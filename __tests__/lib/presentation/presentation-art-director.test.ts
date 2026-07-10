import type { SemanticElement, SemanticSlide } from "@/lib/presentation/ir/schema";
import { composeScenes } from "@/lib/presentation/scene/engine";
import { composePresentation } from "@/lib/presentation/composer/composer";
import { directPresentation } from "@/lib/presentation/art-director/director";

function element(
  value: Omit<SemanticElement, "id" | "emphasis"> &
    Partial<Pick<SemanticElement, "id" | "emphasis">>,
): SemanticElement {
  return {
    id: value.id ?? `element-${JSON.stringify(value).length}`,
    emphasis: value.emphasis ?? "secondary",
    ...value,
  } as SemanticElement;
}

function slide(
  id: string,
  type: SemanticSlide["type"],
  elements: SemanticElement[],
): SemanticSlide {
  return { id, type, intent: "Structured evidence", elements };
}

const title = (content: string, id = "title") =>
  element({ id, kind: "text", role: "title", content, emphasis: "primary" });

function run(slides: SemanticSlide[]) {
  const scenes = composeScenes(slides);
  const plans = composePresentation(slides, scenes).plans;
  return directPresentation(slides, scenes, plans);
}

const heroDeck: SemanticSlide[] = [
  slide("hero", "hero", [title("Vision", "t-hero"), element({ id: "sub", kind: "text", role: "subtitle", content: "One idea" })]),
  slide("kpi", "kpi", [
    title("Growth", "t-kpi"),
    element({ id: "m1", kind: "metric", value: "92%", label: "Retention", emphasis: "primary" }),
    element({ id: "m2", kind: "metric", value: "3x", label: "Revenue" }),
    element({ id: "m3", kind: "metric", value: "40k", label: "Users" }),
  ]),
  slide("flow", "process", [
    title("How it works", "t-flow"),
    element({ id: "d1", kind: "diagram", diagramType: "process", nodes: [{ id: "a", label: "A", emphasis: "secondary" }, { id: "b", label: "B", emphasis: "secondary" }], edges: [{ from: "a", to: "b" }] }),
  ]),
  slide("compare", "comparison", [
    title("Us vs Them", "t-cmp"),
    element({ id: "tbl", kind: "table", headers: ["Metric", "Us", "Them"], rows: [["Speed", "Fast", "Slow"]] }),
  ]),
];

describe("Presentation Art Director", () => {
  it("assigns a single emotional intent per slide from structure, not keywords", () => {
    const result = run(heroDeck);
    const byId = new Map(result.directions.map((d) => [d.slideId, d]));
    expect(byId.get("hero")!.emotionalIntent).toBe("inspire");
    expect(byId.get("flow")!.emotionalIntent).toBe("explain");
    expect(byId.get("compare")!.emotionalIntent).toBe("compare");
    // kpi with multiple metrics is a reveal moment
    expect(byId.get("kpi")!.emotionalIntent).toBe("reveal");
  });

  it("builds an unequal visual hierarchy with exactly one dominant object", () => {
    const kpi = run(heroDeck).directions.find((d) => d.slideId === "kpi")!;
    const dominants = kpi.hierarchy.filter((h) => h.emphasis === "dominant");
    expect(dominants).toHaveLength(1);
    // the hero metric dominates the title and supporting metrics
    expect(dominants[0].kind).toBe("metric");
    // scales strictly decay: no two adjacent priorities share a scale
    const scales = [...kpi.hierarchy].sort((a, b) => a.priority - b.priority).map((h) => h.scale);
    for (let i = 1; i < scales.length; i++) expect(scales[i]).toBeLessThanOrEqual(scales[i - 1]);
    // never uniform
    expect(new Set(scales).size).toBeGreaterThan(1);
  });

  it("alternates deck rhythm so adjacent slides never share energy", () => {
    const directions = run(heroDeck).directions;
    for (let i = 1; i < directions.length; i++) {
      expect(directions[i].energy).not.toBe(directions[i - 1].energy);
    }
    // the deck is not centered everywhere
    expect(new Set(directions.map((d) => d.bias)).size).toBeGreaterThan(1);
  });

  it("refines composition plans without emitting geometry, and keeps a strong hierarchy", () => {
    const result = run(heroDeck);
    for (const plan of result.plans) {
      expect(plan.hierarchyLevel).toBeGreaterThanOrEqual(0.6);
      expect(plan.whitespaceDensity).toBeGreaterThanOrEqual(0.2);
    }
    expect(JSON.stringify(result)).not.toMatch(/"(x|y|w|h|frame)":/);
  });

  it("is fully deterministic", () => {
    expect(run(heroDeck)).toEqual(run(heroDeck));
  });
});
