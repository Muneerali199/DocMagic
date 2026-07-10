import type { SemanticElement, SemanticSlide } from "@/lib/presentation/ir/schema";
import { composeScenes } from "@/lib/presentation/scene/engine";
import { composePresentation } from "@/lib/presentation/composer/composer";
import { visualizeSlides } from "@/lib/presentation/visualization/engine";
import { VisualizationRegistry } from "@/lib/presentation/visualization/registry";
import type { VisualizationPrimitive } from "@/lib/presentation/visualization/types";

function element(value: Omit<SemanticElement, "id" | "emphasis"> & Partial<Pick<SemanticElement, "id" | "emphasis">>): SemanticElement {
  return { id: value.id ?? `element-${JSON.stringify(value).length}`, emphasis: value.emphasis ?? "secondary", ...value } as SemanticElement;
}

function slide(id: string, type: SemanticSlide["type"], elements: SemanticElement[]): SemanticSlide {
  return { id, type, intent: "Structured evidence", elements };
}

function run(slides: SemanticSlide[]) {
  const scenes = composeScenes(slides);
  const plans = composePresentation(slides, scenes).plans;
  return visualizeSlides(slides, scenes, plans);
}

const title = (content: string) => element({ kind: "text", role: "title", content, emphasis: "primary" });

describe("Semantic Visualization Engine", () => {
  it("selects native primitives from typed structure", () => {
    const fixtures: SemanticSlide[] = [
      slide("workflow", "process", [title("Anything"), element({ kind: "diagram", diagramType: "process", nodes: [{ id: "a", label: "A", emphasis: "secondary" }, { id: "b", label: "B", emphasis: "secondary" }], edges: [{ from: "a", to: "b" }] })]),
      slide("architecture", "architecture", [title("Anything"), element({ kind: "diagram", diagramType: "architecture", nodes: [{ id: "api", label: "API", group: "compute", emphasis: "secondary" }], edges: [] })]),
      slide("dashboard", "dashboard", [title("Anything"), element({ kind: "chart", chartType: "line", categories: ["A", "B"], series: [{ name: "Usage", data: [1, 2] }] })]),
      slide("kpi", "kpi", [title("Anything"), element({ kind: "metric", value: "42%", label: "Growth" })]),
      slide("timeline", "timeline", [title("Anything"), element({ kind: "diagram", diagramType: "timeline", nodes: [{ id: "m1", label: "Launch", emphasis: "secondary" }], edges: [] })]),
      slide("compare", "comparison", [title("Anything"), element({ kind: "table", headers: ["Option", "A", "B"], rows: [["Speed", "Slow", "Fast"]] })]),
      slide("gallery", "gallery", [title("Anything"), element({ kind: "icon", name: "sparkles", label: "Feature" })]),
      slide("code", "content", [title("Anything"), element({ kind: "code", language: "typescript", code: "const value = 1" })]),
    ];
    expect(run(fixtures).assignments.map((assignment) => assignment.primitiveId)).toEqual([
      "workflow-pipeline", "architecture-topology", "dashboard-surface", "hero-metrics", "timeline-story", "comparison-board", "gallery-showcase", "editable-code",
    ]);
  });

  it("does not use title keywords for primitive selection", () => {
    const result = run([slide("neutral", "content", [title("Dashboard architecture workflow market"), element({ kind: "text", role: "body", content: "Plain narrative" })])]);
    expect(result.assignments[0].primitiveId).toBe("generic-native");
  });

  it("is deterministic and emits coordinate-free metadata", () => {
    const slides = [slide("arch", "architecture", [title("Platform"), element({ kind: "diagram", diagramType: "architecture", nodes: [{ id: "a", label: "API", emphasis: "secondary" }], edges: [] })])];
    const first = run(slides);
    const second = run(slides);
    expect(second).toEqual(first);
    expect(JSON.stringify(first.assignments)).not.toMatch(/"(x|y|w|h|frame)":/);
  });

  it("supports extension and rejects duplicate IDs", () => {
    const registry = new VisualizationRegistry();
    const primitive: VisualizationPrimitive = {
      id: "custom-native",
      family: "content",
      score: () => 100,
      build: ({ slide: source }) => ({
        elements: source.elements,
        variant: "custom",
        blueprint: { family: "content", variant: "custom", dominantRole: "content", supportingRoles: [], nativeKinds: ["text"], editable: true },
      }),
    };
    registry.register(primitive);
    expect(() => registry.register(primitive)).toThrow("already registered");
    const slides = [slide("custom", "content", [title("Custom")])];
    const scenes = composeScenes(slides);
    const plans = composePresentation(slides, scenes).plans;
    expect(visualizeSlides(slides, scenes, plans, { registry }).assignments[0].primitiveId).toBe("custom-native");
  });

  it("preserves sparse native content with a conservative fallback", () => {
    const source = slide("plain", "content", [title("A simple statement")]);
    const result = run([source]);
    expect(result.assignments[0].primitiveId).toBe("generic-native");
    expect(result.slides[0].elements).toEqual(source.elements);
  });
});
