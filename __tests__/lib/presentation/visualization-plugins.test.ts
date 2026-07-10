import type { CompositionPlan } from "../../../lib/presentation/composer/types";
import type { SemanticSlide } from "../../../lib/presentation/ir/schema";
import type { SceneAssignment } from "../../../lib/presentation/scene/types";
import { buildSemanticProfile } from "../../../lib/presentation/visualization/profile";
import { visualizeSlides } from "../../../lib/presentation/visualization/engine";
import { defaultVisualizationRegistry } from "../../../lib/presentation/visualization/registry";
import { VisualizationPluginCatalog } from "../../../lib/presentation/visualizations/catalog";
import {
  ALL_VISUALIZATION_PLUGINS,
  CATEGORY_VISUALIZATION_PLUGINS,
} from "../../../lib/presentation/visualizations/categories";
import {
  VISUALIZATION_CATEGORIES,
  type VisualizationPlugin,
} from "../../../lib/presentation/visualizations/types";

const slide: SemanticSlide = {
  id: "s1",
  type: "process",
  intent: "Explain the operating sequence",
  elements: [
    {
      id: "t",
      kind: "text",
      role: "title",
      content: "Arbitrary copy",
      emphasis: "primary",
    },
    {
      id: "b",
      kind: "text",
      role: "bullet",
      content: "Steps",
      items: ["Discover", "Build", "Ship"],
      emphasis: "secondary",
    },
  ],
};
const scene: SceneAssignment = {
  slideId: "s1",
  scene: "workflow",
  variantId: "workflow/stepped-flow",
  focal: "structure",
  rationale: [],
};
const plan: CompositionPlan = {
  slideId: "s1",
  scene: "workflow",
  variantId: "workflow/stepped-flow",
  strategyId: "workflow/stepped-flow",
  strategyName: "Stepped Flow",
  dominantFocalArea: { role: "diagram", weight: 0.7, emphasis: "primary" },
  supportingArea: { role: "title", weight: 0.3, emphasis: "secondary" },
  canvasSplit: "stacked",
  visualRhythm: "flow",
  whitespaceDensity: 0.3,
  hierarchyLevel: 0.6,
  emphasisDirection: "left",
  groupingStrategy: "sequential",
  layeringDepth: 1,
  alignmentStrategy: "grid-aligned",
  readingFlow: "linear-horizontal",
  comparisonStyle: "none",
  metricEmphasis: "none",
  imagePriority: 0,
  diagramPriority: 0.9,
  focal: "structure",
  zones: [],
  rationale: [],
};
const context = {
  slide,
  scene,
  composition: plan,
  profile: buildSemanticProfile(slide, scene, plan),
};

describe("Visualization plugin framework", () => {
  it("discovers twelve categories with five treatments each", () => {
    expect(VISUALIZATION_CATEGORIES).toHaveLength(12);
    for (const category of VISUALIZATION_CATEGORIES)
      expect(CATEGORY_VISUALIZATION_PLUGINS[category]).toHaveLength(5);
    expect(ALL_VISUALIZATION_PLUGINS).toHaveLength(60);
  });

  it("provides complete native editable metadata", () => {
    for (const plugin of ALL_VISUALIZATION_PLUGINS) {
      expect(plugin.metadata.editable).toBe(true);
      expect(plugin.metadata.nativeKinds.length).toBeGreaterThan(0);
      expect(plugin.metadata.presentationStyles.length).toBeGreaterThan(0);
      expect(plugin.metadata.readability).toBeGreaterThanOrEqual(0);
    }
  });

  it("rejects duplicate registrations", () => {
    const catalog = new VisualizationPluginCatalog([
      ALL_VISUALIZATION_PLUGINS[0],
    ]);
    expect(() => catalog.register(ALL_VISUALIZATION_PLUGINS[0])).toThrow(
      /already registered/,
    );
  });

  it("scores every compatible plugin deterministically", () => {
    const catalog = new VisualizationPluginCatalog(ALL_VISUALIZATION_PLUGINS);
    const first = catalog.rank("workflow", context);
    const second = catalog.rank("workflow", context);
    expect(first).toHaveLength(5);
    expect(first.map((entry) => [entry.plugin.id, entry.score])).toEqual(
      second.map((entry) => [entry.plugin.id, entry.score]),
    );
  });

  it("does not use title keywords for selection", () => {
    const catalog = new VisualizationPluginCatalog(ALL_VISUALIZATION_PLUGINS);
    const renamed = {
      ...slide,
      elements: slide.elements.map((element) =>
        element.kind === "text" && element.role === "title"
          ? { ...element, content: "Pricing Architecture Market Timeline" }
          : element,
      ),
    };
    const renamedContext = {
      ...context,
      slide: renamed,
      profile: buildSemanticProfile(renamed, scene, plan),
    };
    expect(catalog.select("workflow", context)?.plugin.id).toBe(
      catalog.select("workflow", renamedContext)?.plugin.id,
    );
  });

  it("supports extension without engine edits and preserves engine compatibility", () => {
    const custom: VisualizationPlugin = {
      ...ALL_VISUALIZATION_PLUGINS[0],
      id: "market/custom-treatment",
    };
    const catalog = new VisualizationPluginCatalog(ALL_VISUALIZATION_PLUGINS);
    catalog.register(custom);
    expect(catalog.get(custom.id)).toBe(custom);
    const result = visualizeSlides([slide], [scene], [plan], {
      registry: defaultVisualizationRegistry,
    });
    expect(result.assignments[0].primitiveId).toBe("workflow-pipeline");
    expect(
      result.slides[0].elements.some((element) => element.kind === "diagram"),
    ).toBe(true);
  });
});
