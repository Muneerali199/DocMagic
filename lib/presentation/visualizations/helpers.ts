import type { SemanticElement, SemanticSlide } from "../ir/schema";
import type {
  PrimitiveBuildResult,
  VisualizationContext,
  VisualizationFamily,
} from "../visualization/types";
import type {
  PresentationStyle,
  VisualizationCategory,
  VisualizationPlugin,
  VisualizationPluginMetadata,
} from "./types";

export function stableVisualId(
  slideId: string,
  pluginId: string,
  role: string,
  index = 0,
): string {
  return `${slideId}__plugin__${pluginId}__${role}__${index}`;
}

export function titleElements(slide: SemanticSlide): SemanticElement[] {
  return slide.elements.filter(
    (element) =>
      element.kind === "text" &&
      ["title", "heading", "subtitle", "kicker"].includes(element.role),
  );
}

export function preserve(
  slide: SemanticSlide,
  kinds: SemanticElement["kind"][],
): SemanticElement[] {
  return slide.elements.filter((element) => kinds.includes(element.kind));
}

function sourceLabels(slide: SemanticSlide, limit = 8): string[] {
  const diagram = slide.elements.flatMap((element) =>
    element.kind === "diagram" ? element.nodes.map((node) => node.label) : [],
  );
  const table = slide.elements.flatMap((element) =>
    element.kind === "table"
      ? element.rows.map((row) => row[0]).filter(Boolean)
      : [],
  );
  const bullets = slide.elements.flatMap((element) =>
    element.kind === "text" && element.items ? element.items : [],
  );
  return [...diagram, ...table, ...bullets].filter(Boolean).slice(0, limit);
}

export function diagramTreatment(
  context: VisualizationContext,
  pluginId: string,
  family: VisualizationFamily,
  variant: string,
  diagramType:
    | "flow"
    | "architecture"
    | "timeline"
    | "comparison"
    | "funnel"
    | "orgchart"
    | "cycle",
): PrimitiveBuildResult {
  const existing = context.slide.elements.find(
    (element) => element.kind === "diagram",
  );
  const labels =
    existing?.kind === "diagram"
      ? existing.nodes.map((node) => node.label)
      : sourceLabels(context.slide);
  const safeLabels = labels.length
    ? labels
    : ["Primary", "Supporting", "Outcome"];
  const nodes = safeLabels.map((label, index) => ({
    id: stableVisualId(context.slide.id, pluginId, "node", index),
    label,
    emphasis: index === 0 ? ("primary" as const) : ("secondary" as const),
  }));
  const edges = nodes
    .slice(1)
    .map((node, index) => ({ from: nodes[index].id, to: node.id }));
  const diagram: SemanticElement = {
    id: stableVisualId(context.slide.id, pluginId, "diagram"),
    kind: "diagram",
    diagramType,
    nodes,
    edges,
    emphasis: "primary",
  };
  return {
    elements: [...titleElements(context.slide), diagram],
    variant,
    blueprint: {
      family,
      variant,
      dominantRole: "semantic-diagram",
      supportingRoles: ["title"],
      nativeKinds: ["text", "diagram"],
      editable: true,
    },
  };
}

export function nativeTreatment(
  context: VisualizationContext,
  family: VisualizationFamily,
  variant: string,
  kinds: SemanticElement["kind"][],
  dominantRole: string,
): PrimitiveBuildResult {
  const content = preserve(context.slide, kinds);
  return {
    elements: [...titleElements(context.slide), ...content],
    variant,
    blueprint: {
      family,
      variant,
      dominantRole,
      supportingRoles: ["title", "evidence"],
      nativeKinds: [...new Set(["text" as const, ...kinds])],
      editable: true,
    },
  };
}

export function presentationStyle(
  context: VisualizationContext,
): PresentationStyle {
  if (
    context.scene.scene === "technical-architecture" ||
    context.profile.kinds.code > 0
  )
    return "technical";
  if (
    context.scene.scene === "product-demo" ||
    context.scene.scene === "dashboard-showcase"
  )
    return "product";
  if (
    context.composition.metricEmphasis !== "none" ||
    context.profile.metricCount > 1
  )
    return "executive";
  if (
    context.composition.layeringDepth >= 2 ||
    context.composition.imagePriority >= 0.65
  )
    return "cinematic";
  return "editorial";
}

export function metadata(
  label: string,
  description: string,
  styles: PresentationStyle[],
  scenes: string[],
  nativeKinds: SemanticElement["kind"][],
  density: number,
  whitespace: number,
  hierarchy: number,
): VisualizationPluginMetadata {
  return {
    label,
    description,
    readability: 0.9,
    density,
    whitespace,
    hierarchy,
    presentationStyles: styles,
    supportedScenes: scenes,
    preferredAspectRatio: "wide",
    nativeKinds,
    editable: true,
  };
}

export function makePlugin(options: {
  id: string;
  category: VisualizationCategory;
  family: VisualizationFamily;
  variant: string;
  label: string;
  description: string;
  styles: PresentationStyle[];
  scenes: string[];
  nativeKinds: SemanticElement["kind"][];
  density: number;
  whitespace: number;
  hierarchy: number;
  supports: (context: VisualizationContext) => boolean;
  baseScore: number;
  compose: (
    context: VisualizationContext,
    id: string,
    variant: string,
  ) => PrimitiveBuildResult;
}): VisualizationPlugin {
  const meta = metadata(
    options.label,
    options.description,
    options.styles,
    options.scenes,
    options.nativeKinds,
    options.density,
    options.whitespace,
    options.hierarchy,
  );
  return {
    id: options.id,
    category: options.category,
    family: options.family,
    metadata: meta,
    supports: options.supports,
    score: (context) =>
      options.baseScore +
      (meta.presentationStyles.includes(presentationStyle(context)) ? 16 : 0) +
      (meta.supportedScenes.includes(context.scene.scene) ? 12 : 0) -
      Math.abs(meta.density - (1 - context.composition.whitespaceDensity)) * 8 -
      Math.abs(meta.hierarchy - context.composition.hierarchyLevel) * 6,
    compose: (context) => options.compose(context, options.id, options.variant),
  };
}
