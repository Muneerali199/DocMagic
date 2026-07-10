import type {
  PrimitiveBuildResult,
  VisualizationContext,
  VisualizationFamily,
} from "../visualization/types";
import {
  diagramTreatment,
  makePlugin,
  nativeTreatment,
  preserve,
  stableVisualId,
  titleElements,
} from "./helpers";
import type {
  PresentationStyle,
  VisualizationCategory,
  VisualizationPlugin,
} from "./types";

interface CategorySpec {
  category: VisualizationCategory;
  family: VisualizationFamily;
  scene: string;
  variants: readonly string[];
  styles: readonly PresentationStyle[];
  kinds: Array<
    | "diagram"
    | "chart"
    | "table"
    | "metric"
    | "code"
    | "image"
    | "icon"
    | "callout"
    | "text"
  >;
  diagramType?:
    | "flow"
    | "architecture"
    | "timeline"
    | "comparison"
    | "funnel"
    | "orgchart"
    | "cycle";
  supports(context: VisualizationContext): boolean;
}

const SPECS: CategorySpec[] = [
  {
    category: "market",
    family: "market",
    scene: "funnel",
    variants: [
      "tam-sam-som-rings",
      "opportunity-funnel",
      "market-segmentation",
      "growth-curve",
      "opportunity-matrix",
    ],
    styles: ["executive", "editorial"],
    kinds: ["diagram"],
    diagramType: "funnel",
    supports: (c) =>
      c.profile.slideType === "funnel" ||
      c.profile.diagramTypes.some((type) =>
        ["funnel", "pyramid"].includes(type),
      ),
  },
  {
    category: "workflow",
    family: "process",
    scene: "workflow",
    variants: [
      "linear-pipeline",
      "curved-flow",
      "swimlane-process",
      "circular-process",
      "vertical-journey",
    ],
    styles: ["technical", "editorial"],
    kinds: ["diagram"],
    diagramType: "flow",
    supports: (c) =>
      ["process", "flowchart"].includes(c.profile.slideType) ||
      c.profile.scene === "workflow",
  },
  {
    category: "architecture",
    family: "system",
    scene: "technical-architecture",
    variants: [
      "container-diagram",
      "cloud-architecture",
      "service-mesh",
      "event-flow",
      "layered-system",
    ],
    styles: ["technical", "product"],
    kinds: ["diagram"],
    diagramType: "architecture",
    supports: (c) =>
      c.profile.slideType === "architecture" ||
      c.profile.scene === "technical-architecture",
  },
  {
    category: "dashboard",
    family: "product",
    scene: "dashboard-showcase",
    variants: [
      "analytics-dashboard",
      "saas-admin",
      "crm-dashboard",
      "ai-workspace",
      "financial-dashboard",
    ],
    styles: ["product", "executive"],
    kinds: ["chart", "table", "metric", "callout"],
    supports: (c) =>
      c.profile.slideType === "dashboard" ||
      c.profile.scene === "dashboard-showcase",
  },
  {
    category: "comparison",
    family: "data",
    scene: "comparison",
    variants: [
      "side-by-side",
      "before-after",
      "comparison-matrix",
      "scorecard",
      "quadrant",
    ],
    styles: ["executive", "editorial"],
    kinds: ["table", "chart", "metric", "callout"],
    diagramType: "comparison",
    supports: (c) =>
      ["comparison", "swot"].includes(c.profile.slideType) ||
      c.profile.scene === "comparison",
  },
  {
    category: "timeline",
    family: "story",
    scene: "timeline",
    variants: [
      "milestone-rail",
      "roadmap-tracks",
      "vertical-chronology",
      "horizon-bands",
      "progress-journey",
    ],
    styles: ["editorial", "executive"],
    kinds: ["diagram"],
    diagramType: "timeline",
    supports: (c) =>
      ["timeline", "roadmap"].includes(c.profile.slideType) ||
      c.profile.scene === "timeline",
  },
  {
    category: "kpi",
    family: "data",
    scene: "kpi-reveal",
    variants: [
      "hero-metric",
      "executive-dashboard",
      "scorecards",
      "metric-wall",
      "growth-snapshot",
    ],
    styles: ["executive", "cinematic"],
    kinds: ["metric", "chart", "callout"],
    supports: (c) =>
      c.profile.slideType === "kpi" || c.profile.scene === "kpi-reveal",
  },
  {
    category: "pricing",
    family: "data",
    scene: "pricing",
    variants: [
      "plan-cards",
      "feature-matrix",
      "value-ladder",
      "recommended-plan-focus",
      "pricing-spectrum",
    ],
    styles: ["product", "executive"],
    kinds: ["table", "metric", "callout"],
    supports: (c) => c.profile.scene === "pricing",
  },
  {
    category: "team",
    family: "people",
    scene: "team",
    variants: [
      "team-grid",
      "org-tree",
      "leadership-spotlight",
      "functional-pods",
      "network-map",
    ],
    styles: ["editorial", "executive"],
    kinds: ["diagram"],
    diagramType: "orgchart",
    supports: (c) =>
      c.profile.slideType === "orgchart" || c.profile.scene === "team",
  },
  {
    category: "quote",
    family: "story",
    scene: "quote",
    variants: [
      "editorial-pull-quote",
      "testimonial-card",
      "split-portrait-quote",
      "statement-wall",
      "proof-quote",
    ],
    styles: ["editorial", "cinematic"],
    kinds: ["text", "callout", "image"],
    supports: (c) =>
      c.profile.slideType === "quote" || c.profile.scene === "quote",
  },
  {
    category: "gallery",
    family: "story",
    scene: "feature-showcase",
    variants: [
      "showcase-grid",
      "hero-gallery",
      "filmstrip",
      "feature-mosaic",
      "annotated-collection",
    ],
    styles: ["cinematic", "product"],
    kinds: ["image", "icon", "callout", "text"],
    supports: (c) =>
      c.profile.slideType === "gallery" ||
      c.profile.scene === "feature-showcase",
  },
  {
    category: "code",
    family: "content",
    scene: "product-demo",
    variants: [
      "code-focus",
      "terminal-session",
      "ide-workspace",
      "diff-review",
      "code-walkthrough",
    ],
    styles: ["technical", "product"],
    kinds: ["code", "callout"],
    supports: (c) => c.profile.kinds.code > 0,
  },
];

function composeNative(
  spec: CategorySpec,
  context: VisualizationContext,
  id: string,
  variant: string,
): PrimitiveBuildResult {
  if (
    spec.diagramType &&
    (spec.kinds.length === 1 ||
      preserve(context.slide, spec.kinds).length === 0)
  )
    return diagramTreatment(
      context,
      id,
      spec.family,
      variant,
      spec.diagramType,
    );
  const result = nativeTreatment(
    context,
    spec.family,
    variant,
    spec.kinds,
    `${spec.category}-treatment`,
  );
  if (result.elements.length > titleElements(context.slide).length)
    return result;
  const fallback = {
    id: stableVisualId(context.slide.id, id, "callout"),
    kind: "callout" as const,
    tone: "insight" as const,
    title: spec.category,
    content: context.slide.intent,
    emphasis: "primary" as const,
  };
  return {
    ...result,
    elements: [...result.elements, fallback],
    blueprint: {
      ...result.blueprint,
      nativeKinds: [...result.blueprint.nativeKinds, "callout"],
    },
  };
}

function pluginFor(
  spec: CategorySpec,
  variant: string,
  index: number,
): VisualizationPlugin {
  const density = 0.3 + index * 0.12;
  const whitespace = 0.75 - index * 0.1;
  const hierarchy = 0.9 - index * 0.1;
  return makePlugin({
    id: `${spec.category}/${variant}`,
    category: spec.category,
    family: spec.family,
    variant,
    label: variant
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" "),
    description: `Native editable ${variant} treatment for ${spec.category} semantics.`,
    styles: [...spec.styles],
    scenes: [spec.scene],
    nativeKinds: spec.kinds,
    density,
    whitespace,
    hierarchy,
    supports: spec.supports,
    baseScore: 74 + index,
    compose: (context, id, selectedVariant) =>
      composeNative(spec, context, id, selectedVariant),
  });
}

export const CATEGORY_VISUALIZATION_PLUGINS: Record<
  VisualizationCategory,
  VisualizationPlugin[]
> = Object.fromEntries(
  SPECS.map((spec) => [
    spec.category,
    spec.variants.map((variant, index) => pluginFor(spec, variant, index)),
  ]),
) as Record<VisualizationCategory, VisualizationPlugin[]>;

export const ALL_VISUALIZATION_PLUGINS: VisualizationPlugin[] = SPECS.flatMap(
  (spec) => CATEGORY_VISUALIZATION_PLUGINS[spec.category],
);
