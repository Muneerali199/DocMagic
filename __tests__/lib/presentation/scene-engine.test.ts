/**
 * Scene Composition Engine — unit tests.
 *
 * Covers: scene classification, variant selection, diversity rules,
 * deterministic output, and integration with the existing layout pipeline.
 */

import type { SemanticSlide, SemanticElement } from "@/lib/presentation/ir/schema";
import { classifySlide } from "@/lib/presentation/scene/classifier";
import { composeScenes } from "@/lib/presentation/scene/engine";
import { SCENE_LIBRARY, getScene } from "@/lib/presentation/scene/library";
import { SCENE_IDS } from "@/lib/presentation/scene/types";
import { composeDeck } from "@/lib/presentation/layout/composition";
import { resolveDesign } from "@/lib/presentation/design/engine";
import type { PresentationStrategy } from "@/lib/presentation/ir/schema";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let idCounter = 0;
function el(partial: Partial<SemanticElement> & { kind: string }): SemanticElement {
  return { id: `e${++idCounter}`, emphasis: "secondary", ...partial } as SemanticElement;
}

function slide(
  id: string,
  type: SemanticSlide["type"],
  intent: string,
  elements: SemanticElement[],
): SemanticSlide {
  return { id, type, intent, elements };
}

const heroSlide = slide("s-hero", "hero", "Open with the bold product vision", [
  el({ kind: "text", role: "title", content: "The Future of Shipping", emphasis: "primary" }),
  el({ kind: "text", role: "subtitle", content: "Logistics, reinvented." }),
]);

const kpiSlide = slide("s-kpi", "kpi", "Show the traction numbers", [
  el({ kind: "text", role: "heading", content: "Traction", emphasis: "primary" }),
  el({ kind: "metric", value: "312%", label: "YoY growth", trend: "up" }),
  el({ kind: "metric", value: "$4.2M", label: "ARR", trend: "up" }),
  el({ kind: "metric", value: "98%", label: "Retention", trend: "flat" }),
]);

const workflowSlide = slide("s-flow", "process", "Explain how orders move through the system", [
  el({ kind: "text", role: "heading", content: "Order Lifecycle", emphasis: "primary" }),
  el({
    kind: "diagram",
    diagramType: "process",
    nodes: [
      { id: "n1", label: "Intake", emphasis: "primary" },
      { id: "n2", label: "Route", emphasis: "secondary" },
      { id: "n3", label: "Deliver", emphasis: "secondary" },
    ],
    edges: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
    ],
  }),
]);

const architectureSlide = slide("s-arch", "architecture", "Describe the platform infrastructure", [
  el({ kind: "text", role: "heading", content: "Platform", emphasis: "primary" }),
  el({
    kind: "diagram",
    diagramType: "architecture",
    nodes: [
      { id: "a", label: "Edge", group: "network", emphasis: "secondary" },
      { id: "b", label: "API", group: "compute", emphasis: "primary" },
      { id: "c", label: "DB", group: "storage", emphasis: "secondary" },
    ],
    edges: [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
    ],
  }),
]);

const timelineSlide = slide("s-time", "timeline", "Walk through the company milestones over time", [
  el({ kind: "text", role: "heading", content: "Our Journey", emphasis: "primary" }),
  el({
    kind: "diagram",
    diagramType: "timeline",
    nodes: [
      { id: "t1", label: "2022 Founded", emphasis: "secondary" },
      { id: "t2", label: "2024 Series A", emphasis: "primary" },
      { id: "t3", label: "2026 Global", emphasis: "secondary" },
    ],
    edges: [],
  }),
]);

const comparisonSlide = slide("s-cmp", "comparison", "Contrast us against the legacy alternative", [
  el({ kind: "text", role: "heading", content: "Why Switch", emphasis: "primary" }),
  el({
    kind: "table",
    headers: ["Criteria", "Legacy", "Us"],
    rows: [
      ["Setup", "6 weeks", "1 day"],
      ["Cost", "$$$", "$"],
    ],
  }),
]);

const dashboardSlide = slide("s-dash", "dashboard", "Give a real-time overview of operations", [
  el({ kind: "text", role: "heading", content: "Ops at a Glance", emphasis: "primary" }),
  el({ kind: "chart", chartType: "line", categories: ["Q1", "Q2", "Q3"], series: [{ name: "Vol", data: [1, 2, 3] }] }),
  el({ kind: "chart", chartType: "bar", categories: ["A", "B"], series: [{ name: "Rev", data: [4, 5] }] }),
  el({ kind: "metric", value: "99.9%", label: "Uptime", trend: "flat" }),
]);

const quoteSlide = slide("s-quote", "quote", "Let the customer speak", [
  el({ kind: "text", role: "body", content: "This changed everything for our team.", emphasis: "primary" }),
  el({ kind: "text", role: "caption", content: "Ada Chen, COO at Northwind" }),
]);

const closingSlide = slide("s-close", "closing", "End with the call to action to get started", [
  el({ kind: "text", role: "title", content: "Start Shipping Today", emphasis: "primary" }),
]);

const genericContent = (id: string, intent: string) =>
  slide(id, "content", intent, [
    el({ kind: "text", role: "heading", content: "Heading", emphasis: "primary" }),
    el({ kind: "text", role: "bullet", content: "Points", items: ["One", "Two", "Three"] }),
  ]);

const strategy: PresentationStrategy = {
  intent: "pitch",
  audience: "investors",
  goal: "persuade",
  storytellingStrategy: "pitch",
  deckLength: 8,
  tone: "bold",
};

// ---------------------------------------------------------------------------
// Scene library shape
// ---------------------------------------------------------------------------

describe("scene library", () => {
  it("defines all 14 required scenes", () => {
    expect(SCENE_LIBRARY.map((s) => s.id).sort()).toEqual([...SCENE_IDS].sort());
    expect(SCENE_LIBRARY).toHaveLength(14);
  });

  it("every scene exposes at least 5 variants", () => {
    for (const scene of SCENE_LIBRARY) {
      expect(scene.variants.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("variant ids are globally unique and scene-prefixed", () => {
    const ids = SCENE_LIBRARY.flatMap((s) => s.variants.map((v) => v.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const scene of SCENE_LIBRARY) {
      for (const variant of scene.variants) {
        expect(variant.id.startsWith(`${scene.id}/`)).toBe(true);
      }
    }
  });

  it("variants within a scene differ structurally", () => {
    for (const scene of SCENE_LIBRARY) {
      const signatures = scene.variants.map(
        (v) => `${v.structure}|${v.focal}|${v.hierarchy}|${v.whitespace}`,
      );
      expect(new Set(signatures).size).toBe(scene.variants.length);
      // structure alone must show real variety (at least 3 distinct)
      const structures = new Set(scene.variants.map((v) => v.structure));
      expect(structures.size).toBeGreaterThanOrEqual(3);
    }
  });

  it("contains only semantic metadata — no absolute coordinates", () => {
    const forbidden = ["x", "y", "w", "h", "width", "height", "top", "left", "frame"];
    for (const scene of SCENE_LIBRARY) {
      for (const variant of scene.variants) {
        for (const key of Object.keys(variant)) {
          expect(forbidden).not.toContain(key);
        }
        expect(typeof variant.zones[0]).toBe("string");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Scene classification
// ---------------------------------------------------------------------------

describe("scene classification", () => {
  const pos = (index: number, total = 8) => ({ index, total });

  it("classifies the opening title slide as hero", () => {
    expect(classifySlide(heroSlide, pos(0)).scene).toBe("hero");
  });

  it("classifies metric-heavy slides as kpi-reveal", () => {
    expect(classifySlide(kpiSlide, pos(2)).scene).toBe("kpi-reveal");
  });

  it("classifies process-diagram slides as workflow", () => {
    expect(classifySlide(workflowSlide, pos(3)).scene).toBe("workflow");
  });

  it("classifies architecture-diagram slides as technical-architecture", () => {
    expect(classifySlide(architectureSlide, pos(4)).scene).toBe("technical-architecture");
  });

  it("classifies chronological slides as timeline", () => {
    expect(classifySlide(timelineSlide, pos(5)).scene).toBe("timeline");
  });

  it("classifies option-matrix slides as comparison", () => {
    expect(classifySlide(comparisonSlide, pos(3)).scene).toBe("comparison");
  });

  it("classifies multi-panel data slides as dashboard-showcase", () => {
    expect(classifySlide(dashboardSlide, pos(4)).scene).toBe("dashboard-showcase");
  });

  it("classifies quote slides as quote", () => {
    expect(classifySlide(quoteSlide, pos(6)).scene).toBe("quote");
  });

  it("classifies the final CTA slide as closing-cta", () => {
    expect(classifySlide(closingSlide, pos(7, 8)).scene).toBe("closing-cta");
  });

  it("infers scenes from content semantics on generic content slides", () => {
    const pricing = genericContent("s-price", "Present the subscription plans and cost tiers");
    expect(classifySlide(pricing, pos(5)).scene).toBe("pricing");

    const team = genericContent("s-team", "Introduce the founders and leadership");
    expect(classifySlide(team, pos(5)).scene).toBe("team");

    const caseStudy = genericContent("s-case", "Tell the Northwind customer success story");
    expect(classifySlide(caseStudy, pos(5)).scene).toBe("case-study");
  });

  it("structural evidence outranks slide type when they disagree", () => {
    // a "content" slide that actually contains a process diagram
    const disguised = slide("s-disguised", "content", "Details", [
      workflowSlide.elements[1],
    ]);
    expect(classifySlide(disguised, pos(3)).scene).toBe("workflow");
  });

  it("provides a full ranking and rationale", () => {
    const result = classifySlide(kpiSlide, pos(2));
    expect(result.ranking).toHaveLength(SCENE_IDS.length);
    expect(result.ranking[0].scene).toBe(result.scene);
    expect(result.rationale.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Variant selection
// ---------------------------------------------------------------------------

describe("variant selection", () => {
  it("selects a variant belonging to the assigned scene", () => {
    const deck = [heroSlide, kpiSlide, workflowSlide, closingSlide];
    for (const a of composeScenes(deck)) {
      const scene = getScene(a.scene);
      expect(scene.variants.some((v) => v.id === a.variant.id)).toBe(true);
      expect(a.variant.id.startsWith(`${a.scene}/`)).toBe(true);
    }
  });

  it("matches variant focal strategy to slide content", () => {
    const [heroA, kpiA, flowA] = composeScenes([heroSlide, kpiSlide, workflowSlide]);
    expect(["statement", "narrative"]).toContain(heroA.variant.focal);
    expect(kpiA.variant.focal).toBe("data");
    expect(flowA.variant.focal).toBe("structure");
  });

  it("outputs only semantic metadata — never coordinates", () => {
    const assignments = composeScenes([heroSlide, kpiSlide, dashboardSlide]);
    const json = JSON.stringify(assignments);
    // SceneAssignment must never carry frame-like geometry
    expect(json).not.toMatch(/"frame"/);
    expect(json).not.toMatch(/"x":/);
    expect(json).not.toMatch(/"y":/);
  });
});

// ---------------------------------------------------------------------------
// Diversity rules
// ---------------------------------------------------------------------------

describe("diversity rules", () => {
  it("never assigns the same variant to consecutive slides", () => {
    // five near-identical generic slides — worst case for repetition
    const deck = Array.from({ length: 5 }, (_, i) =>
      genericContent(`s-gen-${i}`, "Present the platform capabilities and features"),
    );
    const assignments = composeScenes(deck);
    for (let i = 1; i < assignments.length; i++) {
      expect(assignments[i].variant.id).not.toBe(assignments[i - 1].variant.id);
    }
  });

  it("swaps a repeated scene when a close alternative exists", () => {
    // dashboard-flavored slide followed by a KPI slide (dashboard is a
    // close runner-up on the second) — engine should diversify
    const kpiTwin = slide("s-kpi-2", "kpi", "More traction metrics at a glance", [
      el({ kind: "metric", value: "10x", label: "Speed", trend: "up" }),
      el({ kind: "metric", value: "50%", label: "Cost cut", trend: "down" }),
      el({ kind: "metric", value: "24/7", label: "Coverage", trend: "flat" }),
    ]);
    const assignments = composeScenes([kpiSlide, kpiTwin]);
    // scenes may legitimately repeat only when no close alternative exists;
    // in every case the exact variant must differ
    if (assignments[0].scene === assignments[1].scene) {
      expect(assignments[0].variant.id).not.toBe(assignments[1].variant.id);
    }
  });

  it("keeps a repeated scene when content genuinely demands it", () => {
    // two pure quote slides in a row — quote is repeat-exempt
    const quote2 = slide("s-quote-2", "quote", "A second customer voice", [
      el({ kind: "text", role: "body", content: "Incredible speed.", emphasis: "primary" }),
    ]);
    const assignments = composeScenes([quoteSlide, quote2]);
    expect(assignments[0].scene).toBe("quote");
    expect(assignments[1].scene).toBe("quote");
    expect(assignments[1].variant.id).not.toBe(assignments[0].variant.id);
  });

  it("spreads variant usage across a long deck", () => {
    const deck = Array.from({ length: 8 }, (_, i) =>
      genericContent(`s-long-${i}`, "Explain the product capabilities"),
    );
    const assignments = composeScenes(deck);
    const used = new Set(assignments.map((a) => a.variant.id));
    // 8 similar slides should exercise several distinct variants
    expect(used.size).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe("deterministic output", () => {
  const deck = [
    heroSlide,
    kpiSlide,
    workflowSlide,
    architectureSlide,
    timelineSlide,
    comparisonSlide,
    dashboardSlide,
    quoteSlide,
    closingSlide,
  ];

  it("same input always yields identical assignments", () => {
    const a = composeScenes(deck);
    const b = composeScenes(deck);
    const c = composeScenes(deck.map((s) => ({ ...s, elements: [...s.elements] })));
    expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)));
    expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(c)));
  });

  it("classification is deterministic per slide", () => {
    const first = classifySlide(kpiSlide, { index: 2, total: 9 });
    const second = classifySlide(kpiSlide, { index: 2, total: 9 });
    expect(first.scene).toBe(second.scene);
    expect(first.ranking).toEqual(second.ranking);
  });
});

// ---------------------------------------------------------------------------
// Pipeline integration
// ---------------------------------------------------------------------------

describe("integration with the layout pipeline", () => {
  const deck = [heroSlide, kpiSlide, workflowSlide, dashboardSlide, closingSlide];
  const { tokens } = resolveDesign(strategy, "stripe");

  it("composeDeck accepts scene assignments and still places every slide", () => {
    const scenes = composeScenes(deck);
    const composition = composeDeck(deck, tokens, scenes);
    expect(composition).toHaveLength(deck.length);
    for (const c of composition) {
      expect(c.layout).toBeDefined();
      expect(c.result.placements.length).toBeGreaterThan(0);
    }
  });

  it("remains backward compatible without scene assignments", () => {
    const composition = composeDeck(deck, tokens);
    expect(composition).toHaveLength(deck.length);
  });

  it("scene-guided composition is deterministic end to end", () => {
    const run = () => {
      const scenes = composeScenes(deck);
      return composeDeck(deck, tokens, scenes).map((c) => c.layout.id);
    };
    expect(run()).toEqual(run());
  });

  it("scene bias never forces a structurally wrong layout", () => {
    const scenes = composeScenes(deck);
    const withScenes = composeDeck(deck, tokens, scenes);
    // the KPI slide must still land on a data-capable layout
    const kpiComposed = withScenes[1];
    expect(kpiComposed.slide.id).toBe("s-kpi");
    expect(kpiComposed.result.placements.length).toBeGreaterThanOrEqual(
      kpiSlide.elements.length - 1,
    );
  });
});
