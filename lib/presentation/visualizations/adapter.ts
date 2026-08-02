import type {
  VisualizationPrimitive,
  VisualizationRegistryContract,
} from "../visualization/types";
import { VisualizationPluginCatalog } from "./catalog";
import type { VisualizationCategory } from "./types";

const CATEGORY_PRIMITIVE_IDS: Record<VisualizationCategory, string> = {
  market: "market-map",
  workflow: "workflow-pipeline",
  architecture: "architecture-topology",
  dashboard: "dashboard-surface",
  comparison: "comparison-board",
  timeline: "timeline-story",
  kpi: "hero-metrics",
  pricing: "pricing-matrix",
  team: "team-map",
  quote: "editorial-quote",
  gallery: "gallery-showcase",
  code: "editable-code",
};

export function pluginPrimitive(
  category: VisualizationCategory,
  catalog: VisualizationPluginCatalog,
): VisualizationPrimitive {
  return {
    id: CATEGORY_PRIMITIVE_IDS[category],
    family: catalog.byCategory(category)[0]?.family ?? "content",
    score: (profile) => {
      const probe = catalog.byCategory(category)[0];
      if (!probe) return 0;
      if (category === "market")
        return profile.slideType === "funnel" ||
          profile.diagramTypes.some((type) =>
            ["funnel", "pyramid"].includes(type),
          )
          ? 100
          : 0;
      if (category === "workflow")
        return ["process", "flowchart"].includes(profile.slideType) ||
          profile.scene === "workflow"
          ? 100
          : 0;
      if (category === "architecture")
        return profile.slideType === "architecture" ||
          (profile.scene === "technical-architecture" &&
            profile.kinds.code === 0)
          ? 110
          : 0;
      if (category === "dashboard")
        return profile.slideType === "dashboard" ||
          profile.scene === "dashboard-showcase"
          ? 105
          : 0;
      if (category === "comparison")
        return ["comparison", "swot"].includes(profile.slideType) ||
          profile.scene === "comparison"
          ? 100
          : 0;
      if (category === "timeline")
        return ["timeline", "roadmap"].includes(profile.slideType) ||
          profile.scene === "timeline"
          ? 100
          : 0;
      if (category === "kpi")
        return profile.slideType === "kpi" || profile.scene === "kpi-reveal"
          ? 105
          : 0;
      if (category === "pricing") return profile.scene === "pricing" ? 110 : 0;
      if (category === "team")
        return profile.slideType === "orgchart" || profile.scene === "team"
          ? 105
          : 0;
      if (category === "quote")
        return profile.slideType === "quote" || profile.scene === "quote"
          ? 110
          : 0;
      if (category === "gallery")
        return profile.slideType === "gallery" ||
          profile.scene === "feature-showcase"
          ? 100
          : 0;
      return profile.kinds.code > 0 ? 120 : 0;
    },
    build: (context) =>
      catalog.select(category, context)?.plugin.compose(context) ?? {
        elements: context.slide.elements,
        variant: "preserve-source",
        blueprint: {
          family: "fallback",
          variant: "preserve-source",
          dominantRole: "source-content",
          supportingRoles: [],
          nativeKinds: [
            ...new Set(context.slide.elements.map((element) => element.kind)),
          ],
          editable: true,
        },
      },
  };
}

export function registerPluginPrimitives(
  registry: VisualizationRegistryContract,
  catalog: VisualizationPluginCatalog,
): void {
  for (const category of Object.keys(
    CATEGORY_PRIMITIVE_IDS,
  ).sort((a, b) => a - b) as VisualizationCategory[])
    registry.register(pluginPrimitive(category, catalog));
}
