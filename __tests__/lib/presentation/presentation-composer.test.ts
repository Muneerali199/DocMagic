/**
 * Presentation Composer — unit tests.
 *
 * Covers (spec §10):
 *   - composition generation (every slide → a complete, valid plan)
 *   - diversity (consecutive slides get different visual structures)
 *   - determinism (same IR + seed ⇒ identical output; seed changes output)
 *   - scene compatibility (plan belongs to the assigned scene, ≥5 strategies)
 *   - Layout Engine integration (composeDeck consumes plans, still valid)
 *   - the targeted quality upgrades: comparison winner emphasis, dominant KPI,
 *     hero focal point, and diagram-reserving workflow/architecture scenes.
 */

import type {
  SemanticSlide,
  SemanticElement,
} from "@/lib/presentation/ir/schema";
import { composeScenes } from "@/lib/presentation/scene/engine";
import { SCENE_IDS } from "@/lib/presentation/scene/types";
import {
  composePresentation,
  readContent,
} from "@/lib/presentation/composer/composer";
import {
  SCENE_STRATEGIES,
  getStrategies,
  buildPlan,
} from "@/lib/presentation/composer/strategies";
import type { CompositionPlan } from "@/lib/presentation/composer/types";
import { composeDeck } from "@/lib/presentation/layout/composition";
import { resolveDesign } from "@/lib/presentation/design/engine";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let idCounter = 0;
function el(
  partial: Partial<SemanticElement> & { kind: string },
): SemanticElement {
  return {
    id: `e${++idCounter}`,
    emphasis: "secondary",
    ...partial,
  } as SemanticElement;
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

const singleKpiSlide = slide("s-kpi1", "kpi", "One number that matters", [
  el({ kind: "metric", value: "1,000,000", label: "Users", trend: "up", emphasis: "primary" }),
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
  el({ kind: "text", role: "subtitle", content: "Book a demo with our team." }),
]);

const deck: SemanticSlide[] = [
  heroSlide,
  kpiSlide,
  workflowSlide,
  architectureSlide,
  comparisonSlide,
  dashboardSlide,
  quoteSlide,
  closingSlide,
];

function planFor(slides: SemanticSlide[], seed = 0): CompositionPlan[] {
  const scenes = composeScenes(slides);
  return composePresentation(slides, scenes, { seed }).plans;
}

// ---------------------------------------------------------------------------
// Scene compatibility / library integrity
// ---------------------------------------------------------------------------

describe("strategy library integrity", () => {
  it("gives every scene at least 5 strategies", () => {
    for (const scene of SCENE_IDS) {
      expect(getStrategies(scene).length).toBeGreaterThanOrEqual(5);
    }
  });

  it("makes the 5 strategies structurally distinct, not card shuffles", () => {
    for (const scene of SCENE_IDS) {
      const specs = SCENE_STRATEGIES[scene];
      // Fundamentally different = distinct (canvasSplit + visualRhythm) combos.
      const signatures = new Set(
        specs.map((s) => `${s.canvasSplit}|${s.visualRhythm}`),
      );
      expect(signatures.size).toBeGreaterThanOrEqual(4);
      // And distinct reading flows / focal areas overall.
      const flows = new Set(specs.map((s) => s.readingFlow));
      expect(flows.size).toBeGreaterThanOrEqual(3);
    }
  });

  it("uses unique strategy keys within a scene", () => {
    for (const scene of SCENE_IDS) {
      const keys = SCENE_STRATEGIES[scene].map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

// ---------------------------------------------------------------------------
// Composition generation
// ---------------------------------------------------------------------------

describe("composition generation", () => {
  const plans = planFor(deck);

  it("produces exactly one complete plan per slide, in order", () => {
    expect(plans).toHaveLength(deck.length);
    plans.forEach((p, i) => expect(p.slideId).toBe(deck[i].id));
  });

  it("populates every required composition field with valid values", () => {
    for (const p of plans) {
      expect(p.dominantFocalArea).toBeDefined();
      expect(p.supportingArea).toBeDefined();
      expect(p.zones.length).toBeGreaterThanOrEqual(2);
      expect(p.dominantFocalArea.emphasis).toBe("primary");
      for (const z of p.zones) {
        expect(z.weight).toBeGreaterThanOrEqual(0);
        expect(z.weight).toBeLessThanOrEqual(1);
        expect(z.role.length).toBeGreaterThan(0);
      }
      for (const n of [
        p.whitespaceDensity,
        p.hierarchyLevel,
        p.imagePriority,
        p.diagramPriority,
      ]) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(1);
      }
      expect(p.layeringDepth).toBeGreaterThanOrEqual(0);
      expect(p.layeringDepth).toBeLessThanOrEqual(3);
      expect(p.rationale.length).toBeGreaterThan(0);
    }
  });

  it("gives the dominant focal area more weight than the supporting area, when hierarchy is strong", () => {
    for (const p of plans) {
      if (p.hierarchyLevel >= 0.8) {
        expect(p.dominantFocalArea.weight).toBeGreaterThanOrEqual(
          p.supportingArea.weight,
        );
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Scene compatibility of generated plans
// ---------------------------------------------------------------------------

describe("scene compatibility", () => {
  it("derives each plan from a strategy belonging to the assigned scene", () => {
    const scenes = composeScenes(deck);
    const plans = composePresentation(deck, scenes).plans;
    plans.forEach((p, i) => {
      expect(p.scene).toBe(scenes[i].scene);
      expect(p.strategyId.startsWith(`${p.scene}/`)).toBe(true);
      const validKeys = SCENE_STRATEGIES[p.scene].map(
        (s) => `${p.scene}/${s.key}`,
      );
      expect(validKeys).toContain(p.strategyId);
    });
  });
});

// ---------------------------------------------------------------------------
// Diversity
// ---------------------------------------------------------------------------

describe("diversity", () => {
  const plans = planFor(deck);

  it("never repeats the exact strategy on consecutive slides", () => {
    for (let i = 1; i < plans.length; i++) {
      expect(plans[i].strategyId).not.toBe(plans[i - 1].strategyId);
    }
  });

  it("varies the visual structure between most consecutive slides", () => {
    let differentStructure = 0;
    for (let i = 1; i < plans.length; i++) {
      const a = plans[i];
      const b = plans[i - 1];
      if (a.canvasSplit !== b.canvasSplit || a.visualRhythm !== b.visualRhythm)
        differentStructure++;
    }
    // At least 70% of adjacent pairs should differ structurally.
    expect(differentStructure).toBeGreaterThanOrEqual(
      Math.ceil((plans.length - 1) * 0.7),
    );
  });

  it("does not collapse the whole deck onto a single structure", () => {
    const splits = new Set(plans.map((p) => p.canvasSplit));
    expect(splits.size).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe("determinism", () => {
  it("produces identical output for identical input + seed", () => {
    const a = planFor(deck, 7);
    const b = planFor(deck, 7);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("is stable across repeated runs of the whole composer", () => {
    const scenes = composeScenes(deck);
    const runs = Array.from({ length: 4 }, () =>
      composePresentation(deck, scenes, { seed: 3 }),
    );
    const first = JSON.stringify(runs[0].plans);
    for (const r of runs) expect(JSON.stringify(r.plans)).toBe(first);
  });

  it("can change the composition when the seed changes", () => {
    const a = planFor(deck, 1);
    const b = planFor(deck, 999);
    // Determinism does not require seed-sensitivity on every slide, but the
    // overall composition should be able to differ for a different seed.
    const changed = a.some((p, i) => p.strategyId !== b[i].strategyId);
    expect(changed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Targeted quality upgrades (spec §6–§9)
// ---------------------------------------------------------------------------

describe("comparison scenes emphasise a winner, not two equal columns", () => {
  it("chooses a directional comparison style for a genuine comparison slide", () => {
    const scenes = composeScenes([comparisonSlide]);
    const [p] = composePresentation([comparisonSlide], scenes).plans;
    expect(["winner-loser", "before-after", "versus"]).toContain(
      p.comparisonStyle,
    );
    // The winner zone should out-weight the alternative for winner-loser.
    if (p.comparisonStyle === "winner-loser") {
      expect(p.dominantFocalArea.weight).toBeGreaterThan(
        p.supportingArea.weight,
      );
    }
  });
});

describe("KPI scenes create one dominant metric, not equal-size cards", () => {
  it("picks a dominant metric emphasis for a single hero metric", () => {
    const scenes = composeScenes([singleKpiSlide]);
    const [p] = composePresentation([singleKpiSlide], scenes).plans;
    expect(p.metricEmphasis).toBe("dominant-one");
    expect(p.hierarchyLevel).toBeGreaterThanOrEqual(0.8);
  });

  it("never uses flat equal cards as the ONLY option for a multi-metric deck", () => {
    // Across seeds the KPI scene should be able to produce a non-equal emphasis.
    const emphases = new Set<string>();
    for (let seed = 0; seed < 6; seed++) {
      const scenes = composeScenes([kpiSlide]);
      const [p] = composePresentation([kpiSlide], scenes, { seed }).plans;
      emphases.add(p.metricEmphasis);
    }
    expect([...emphases].some((e) => e !== "equal" && e !== "none")).toBe(true);
  });
});

describe("hero scenes create a single strong focal point", () => {
  it("uses a high-hierarchy, generous-whitespace, single-focus composition", () => {
    const scenes = composeScenes([heroSlide]);
    const [p] = composePresentation([heroSlide], scenes).plans;
    expect(p.hierarchyLevel).toBeGreaterThanOrEqual(0.8);
    expect(p.whitespaceDensity).toBeGreaterThanOrEqual(0.4);
    expect(p.dominantFocalArea.weight).toBeGreaterThanOrEqual(0.55);
  });
});

describe("workflow & architecture scenes reserve space for diagrams", () => {
  it("prioritises diagrams and does not use a card grid", () => {
    const scenes = composeScenes([workflowSlide, architectureSlide]);
    const plans = composePresentation(
      [workflowSlide, architectureSlide],
      scenes,
    ).plans;
    for (const p of plans) {
      expect(p.diagramPriority).toBeGreaterThanOrEqual(0.6);
      expect(p.focal).toBe("structure");
      expect(p.visualRhythm).not.toBe("grid");
    }
  });
});

// ---------------------------------------------------------------------------
// Layout Engine integration
// ---------------------------------------------------------------------------

describe("Layout Engine integration", () => {
  const design = resolveDesign({
    intent: "pitch",
    audience: "investors",
    goal: "raise",
    storytellingStrategy: "pitch",
    deckLength: deck.length,
    tone: "bold",
  });

  it("composeDeck consumes plans and still places every element", () => {
    const scenes = composeScenes(deck);
    const plans = composePresentation(deck, scenes).plans;
    const composed = composeDeck(deck, design.tokens, scenes, plans);
    expect(composed).toHaveLength(deck.length);
    composed.forEach((c, i) => {
      expect(c.slide.id).toBe(deck[i].id);
      // every element on the slide receives a placement frame
      expect(c.result.placements.length).toBe(deck[i].elements.length);
      for (const pl of c.result.placements) {
        expect(pl.frame.w).toBeGreaterThan(0);
        expect(pl.frame.h).toBeGreaterThan(0);
      }
    });
  });

  it("plans steer diagram slides away from grid layouts", () => {
    const slides = [workflowSlide, architectureSlide];
    const scenes = composeScenes(slides);
    const plans = composePresentation(slides, scenes).plans;
    const composed = composeDeck(slides, design.tokens, scenes, plans);
    for (const c of composed) {
      expect(c.layout.metadata.visualRhythm).not.toBe("grid");
    }
  });

  it("remains deterministic end-to-end through the layout engine", () => {
    const run = () => {
      const scenes = composeScenes(deck);
      const plans = composePresentation(deck, scenes).plans;
      return composeDeck(deck, design.tokens, scenes, plans).map((c) => ({
        id: c.slide.id,
        layout: c.layout.id,
      }));
    };
    expect(JSON.stringify(run())).toBe(JSON.stringify(run()));
  });
});

// ---------------------------------------------------------------------------
// buildPlan unit behaviour
// ---------------------------------------------------------------------------

describe("buildPlan", () => {
  it("clamps metric emphasis to dominant-one when only one metric exists", () => {
    const spec = getStrategies("kpi-reveal").find(
      (s) => s.metricEmphasis === "progressive",
    )!;
    const content = readContent(singleKpiSlide);
    const p = buildPlan(singleKpiSlide, "kpi-reveal", "kpi-reveal/x", spec, content);
    expect(p.metricEmphasis).toBe("dominant-one");
  });

  it("raises diagram priority when the slide actually has a diagram", () => {
    const spec = getStrategies("hero")[0]; // diagramPriority 0 by default
    const content = readContent(workflowSlide);
    const p = buildPlan(workflowSlide, "hero", "hero/x", spec, content);
    expect(p.diagramPriority).toBeGreaterThanOrEqual(0.6);
  });
});
