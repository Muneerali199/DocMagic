/**
 * Presentation Composer — composition strategy library.
 *
 * Every scene owns AT LEAST 5 fundamentally different composition
 * strategies. "Fundamentally different" means the visual STRUCTURE changes —
 * the canvas split, focal area, reading flow and grouping differ — not merely
 * that cards are shuffled. A strategy is a content-independent structural DNA
 * (`StrategySpec`) plus a deterministic `buildPlan` that instantiates a
 * `CompositionPlan` for a specific slide's content.
 *
 * No coordinates appear anywhere in this file. Strategies speak in
 * proportions, roles, directions and rhythms only.
 */

import type { SemanticSlide } from "../ir/schema";
import type { SceneId, FocalStrategy } from "../scene/types";
import { categorize } from "../layout/library";
import type {
  CompositionPlan,
  CompositionZone,
  CanvasSplit,
  CompositionRhythm,
  EmphasisDirection,
  GroupingStrategy,
  AlignmentStrategy,
  ReadingFlow,
  ComparisonStyle,
  MetricEmphasis,
} from "./types";

type Holds = NonNullable<CompositionZone["holds"]>;

interface ZoneSpec {
  role: string;
  weight: number;
  holds?: Holds;
}

/** Content-independent structural DNA of one composition strategy. */
export interface StrategySpec {
  key: string;
  name: string;
  focal: FocalStrategy;
  canvasSplit: CanvasSplit;
  visualRhythm: CompositionRhythm;
  whitespaceDensity: number;
  hierarchyLevel: number;
  emphasisDirection: EmphasisDirection;
  groupingStrategy: GroupingStrategy;
  layeringDepth: number;
  alignmentStrategy: AlignmentStrategy;
  readingFlow: ReadingFlow;
  comparisonStyle: ComparisonStyle;
  metricEmphasis: MetricEmphasis;
  imagePriority: number;
  diagramPriority: number;
  dominant: ZoneSpec;
  support: ZoneSpec;
  extras?: Array<ZoneSpec & { emphasis?: "secondary" | "tertiary" }>;
}

// ---------------------------------------------------------------------------
// Content signals — deterministic, derived from the Semantic IR only
// ---------------------------------------------------------------------------

export interface ContentSignals {
  metrics: number;
  charts: number;
  diagrams: number;
  tables: number;
  media: number;
  texts: number;
  total: number;
}

export function readContent(slide: SemanticSlide): ContentSignals {
  const c = categorize(slide);
  return {
    metrics: c.metrics.length,
    charts: c.charts.length,
    diagrams: c.diagrams.length,
    tables: c.tables.length,
    media: c.media.length,
    texts: c.texts.length,
    total: slide.elements.length,
  };
}

// ---------------------------------------------------------------------------
// Plan assembly
// ---------------------------------------------------------------------------

function zone(
  spec: ZoneSpec,
  emphasis: CompositionZone["emphasis"],
): CompositionZone {
  return {
    role: spec.role,
    weight: spec.weight,
    emphasis,
    ...(spec.holds ? { holds: spec.holds } : {}),
  };
}

/**
 * Instantiate a CompositionPlan for a slide from a strategy spec. Purely
 * deterministic: the spec supplies the structure, the content supplies a few
 * safe clamps (never randomness).
 */
export function buildPlan(
  slide: SemanticSlide,
  scene: SceneId,
  variantId: string,
  spec: StrategySpec,
  content: ContentSignals,
): CompositionPlan {
  const zones: CompositionZone[] = [
    zone(spec.dominant, "primary"),
    zone(spec.support, "secondary"),
    ...(spec.extras ?? []).map((z) => zone(z, z.emphasis ?? "tertiary")),
  ];

  // Deterministic content clamps — keep intent honest to the material.
  let metricEmphasis = spec.metricEmphasis;
  if (metricEmphasis !== "none") {
    if (content.metrics <= 1) metricEmphasis = "dominant-one";
    else if (content.metrics >= 5 && metricEmphasis === "dominant-one")
      metricEmphasis = "hero-plus-support";
  }

  let comparisonStyle = spec.comparisonStyle;
  // A winner/versus intent still needs at least two comparable clusters.
  if (
    comparisonStyle !== "none" &&
    content.total < 3 &&
    content.tables === 0 &&
    content.charts === 0
  ) {
    comparisonStyle = content.total <= 2 ? "balanced" : comparisonStyle;
  }

  const diagramPriority = content.diagrams > 0
    ? Math.max(spec.diagramPriority, 0.6)
    : spec.diagramPriority;
  const imagePriority = content.media > 0
    ? Math.max(spec.imagePriority, 0.35)
    : spec.imagePriority;

  const rationale = [
    `strategy "${scene}/${spec.key}" (${spec.visualRhythm}, split=${spec.canvasSplit})`,
    `focal=${spec.focal}; hierarchy=${spec.hierarchyLevel}; whitespace=${spec.whitespaceDensity}`,
    `content: ${content.metrics}m ${content.charts}c ${content.diagrams}d ` +
      `${content.tables}t ${content.media}i ${content.texts}x`,
  ];
  if (metricEmphasis !== spec.metricEmphasis)
    rationale.push(
      `metricEmphasis clamped ${spec.metricEmphasis}→${metricEmphasis} (${content.metrics} metrics)`,
    );
  if (comparisonStyle !== spec.comparisonStyle)
    rationale.push(
      `comparisonStyle clamped ${spec.comparisonStyle}→${comparisonStyle}`,
    );

  return {
    slideId: slide.id,
    scene,
    variantId,
    strategyId: `${scene}/${spec.key}`,
    strategyName: spec.name,
    dominantFocalArea: zones[0],
    supportingArea: zones[1],
    canvasSplit: spec.canvasSplit,
    visualRhythm: spec.visualRhythm,
    whitespaceDensity: spec.whitespaceDensity,
    hierarchyLevel: spec.hierarchyLevel,
    emphasisDirection: spec.emphasisDirection,
    groupingStrategy: spec.groupingStrategy,
    layeringDepth: spec.layeringDepth,
    alignmentStrategy: spec.alignmentStrategy,
    readingFlow: spec.readingFlow,
    comparisonStyle,
    metricEmphasis,
    imagePriority,
    diagramPriority,
    focal: spec.focal,
    zones,
    rationale,
  };
}

// ---------------------------------------------------------------------------
// The strategy library — ≥5 structurally distinct strategies per scene
// ---------------------------------------------------------------------------

/* eslint-disable prettier/prettier */
export const SCENE_STRATEGIES: Record<SceneId, StrategySpec[]> = {
  hero: [
    { key: "monument", name: "Monument Statement", focal: "statement", canvasSplit: "full-bleed", visualRhythm: "single-focus", whitespaceDensity: 0.8, hierarchyLevel: 1, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "hero-statement", weight: 0.75, holds: ["text"] }, support: { role: "supporting-line", weight: 0.25, holds: ["text"] } },
    { key: "split-reveal", name: "Split Reveal", focal: "media", canvasSplit: "60-40", visualRhythm: "split", whitespaceDensity: 0.45, hierarchyLevel: 0.85, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.5, diagramPriority: 0, dominant: { role: "statement", weight: 0.6, holds: ["text"] }, support: { role: "hero-media", weight: 0.4, holds: ["image"] } },
    { key: "diagonal", name: "Diagonal Energy", focal: "statement", canvasSplit: "diagonal", visualRhythm: "asymmetric", whitespaceDensity: 0.6, hierarchyLevel: 0.9, emphasisDirection: "bottom-left", groupingStrategy: "layered", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.3, diagramPriority: 0, dominant: { role: "statement", weight: 0.7, holds: ["text"] }, support: { role: "accent", weight: 0.3, holds: ["image", "icon"] } },
    { key: "stage", name: "Sidebar Stage", focal: "media", canvasSplit: "sidebar", visualRhythm: "asymmetric", whitespaceDensity: 0.35, hierarchyLevel: 0.8, emphasisDirection: "right", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.55, diagramPriority: 0, dominant: { role: "stage-media", weight: 0.65, holds: ["image"] }, support: { role: "title-rail", weight: 0.35, holds: ["text"] } },
    { key: "billboard", name: "Stacked Billboard", focal: "statement", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.7, hierarchyLevel: 0.95, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "headline", weight: 0.7, holds: ["text"] }, support: { role: "kicker-subtitle", weight: 0.3, holds: ["text"] } },
  ],
  "product-demo": [
    { key: "device-hero", name: "Device Hero", focal: "media", canvasSplit: "full-bleed", visualRhythm: "single-focus", whitespaceDensity: 0.5, hierarchyLevel: 0.9, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.8, diagramPriority: 0, dominant: { role: "product-mockup", weight: 0.75, holds: ["image"] }, support: { role: "caption", weight: 0.25, holds: ["text"] } },
    { key: "split-callouts", name: "Annotated Split", focal: "media", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.6, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.55, diagramPriority: 0, dominant: { role: "mockup", weight: 0.5, holds: ["image"] }, support: { role: "callouts", weight: 0.5, holds: ["text", "callout", "icon"] } },
    { key: "floating-layers", name: "Floating Layers", focal: "media", canvasSplit: "asymmetric", visualRhythm: "asymmetric", whitespaceDensity: 0.4, hierarchyLevel: 0.7, emphasisDirection: "diagonal", groupingStrategy: "layered", layeringDepth: 3, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.75, diagramPriority: 0, dominant: { role: "primary-screen", weight: 0.6, holds: ["image"] }, support: { role: "secondary-screens", weight: 0.4, holds: ["image"] } },
    { key: "feature-rail", name: "Feature Rail", focal: "media", canvasSplit: "sidebar", visualRhythm: "asymmetric", whitespaceDensity: 0.3, hierarchyLevel: 0.65, emphasisDirection: "right", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.6, diagramPriority: 0, dominant: { role: "stage-media", weight: 0.62, holds: ["image"] }, support: { role: "feature-list", weight: 0.38, holds: ["text", "icon"] } },
    { key: "before-after", name: "Before / After", focal: "media", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.55, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "before-after", metricEmphasis: "none", imagePriority: 0.7, diagramPriority: 0, dominant: { role: "after-state", weight: 0.55, holds: ["image"] }, support: { role: "before-state", weight: 0.45, holds: ["image"] } },
  ],
  "dashboard-showcase": [
    { key: "hero-chart", name: "Hero Chart", focal: "data", canvasSplit: "70-30", visualRhythm: "asymmetric", whitespaceDensity: 0.25, hierarchyLevel: 0.8, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "hero-plus-support", imagePriority: 0, diagramPriority: 0.2, dominant: { role: "primary-chart", weight: 0.68, holds: ["chart"] }, support: { role: "supporting-metrics", weight: 0.32, holds: ["metric", "callout"] } },
    { key: "control-room", name: "Control Room", focal: "data", canvasSplit: "stacked", visualRhythm: "grid", whitespaceDensity: 0.15, hierarchyLevel: 0.4, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "equal", imagePriority: 0, diagramPriority: 0.2, dominant: { role: "tile-grid", weight: 0.7, holds: ["chart", "metric", "table"] }, support: { role: "header", weight: 0.3, holds: ["text"] } },
    { key: "metric-spotlight", name: "Metric Spotlight", focal: "data", canvasSplit: "60-40", visualRhythm: "split", whitespaceDensity: 0.35, hierarchyLevel: 0.85, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0, diagramPriority: 0.1, dominant: { role: "hero-metric", weight: 0.55, holds: ["metric"] }, support: { role: "trend-chart", weight: 0.45, holds: ["chart"] } },
    { key: "split-panels", name: "Split Panels", focal: "data", canvasSplit: "50-50", visualRhythm: "columns", whitespaceDensity: 0.2, hierarchyLevel: 0.5, emphasisDirection: "center", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "equal", imagePriority: 0, diagramPriority: 0.2, dominant: { role: "chart-panel", weight: 0.5, holds: ["chart"] }, support: { role: "table-panel", weight: 0.5, holds: ["table"] } },
    { key: "stacked-strips", name: "Stacked Strips", focal: "data", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.2, hierarchyLevel: 0.55, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "progressive", imagePriority: 0, diagramPriority: 0.1, dominant: { role: "kpi-strip", weight: 0.45, holds: ["metric"] }, support: { role: "chart-strip", weight: 0.55, holds: ["chart", "table"] } },
  ],
  "technical-architecture": [
    { key: "canvas", name: "Full Canvas Diagram", focal: "structure", canvasSplit: "full-bleed", visualRhythm: "single-focus", whitespaceDensity: 0.2, hierarchyLevel: 0.6, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.9, dominant: { role: "architecture-diagram", weight: 0.82, holds: ["diagram"] }, support: { role: "title", weight: 0.18, holds: ["text"] } },
    { key: "layered-stack", name: "Layered Tiers", focal: "structure", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.2, hierarchyLevel: 0.55, emphasisDirection: "top", groupingStrategy: "nested", layeringDepth: 2, alignmentStrategy: "edge-aligned", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.85, dominant: { role: "tier-stack", weight: 0.78, holds: ["diagram"] }, support: { role: "tier-labels", weight: 0.22, holds: ["text", "callout"] } },
    { key: "hub-radial", name: "Radial Hub", focal: "structure", canvasSplit: "radial", visualRhythm: "radial", whitespaceDensity: 0.3, hierarchyLevel: 0.75, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "radial", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.85, dominant: { role: "hub", weight: 0.6, holds: ["diagram"] }, support: { role: "spokes", weight: 0.4, holds: ["diagram", "icon"] } },
    { key: "diagram-legend", name: "Diagram + Legend", focal: "structure", canvasSplit: "70-30", visualRhythm: "asymmetric", whitespaceDensity: 0.2, hierarchyLevel: 0.6, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.9, dominant: { role: "diagram", weight: 0.7, holds: ["diagram"] }, support: { role: "legend", weight: 0.3, holds: ["text", "callout", "icon"] } },
    { key: "flow-lr", name: "Left-to-Right Flow", focal: "structure", canvasSplit: "stacked", visualRhythm: "flow", whitespaceDensity: 0.25, hierarchyLevel: 0.5, emphasisDirection: "left", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.88, dominant: { role: "flow-diagram", weight: 0.8, holds: ["diagram"] }, support: { role: "caption", weight: 0.2, holds: ["text"] } },
  ],
  workflow: [
    { key: "stepped-flow", name: "Stepped Flow", focal: "structure", canvasSplit: "stacked", visualRhythm: "flow", whitespaceDensity: 0.3, hierarchyLevel: 0.5, emphasisDirection: "left", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.85, dominant: { role: "flow-diagram", weight: 0.76, holds: ["diagram"] }, support: { role: "step-captions", weight: 0.24, holds: ["text", "callout"] } },
    { key: "vertical-journey", name: "Vertical Journey", focal: "structure", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.3, hierarchyLevel: 0.55, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.8, dominant: { role: "journey-spine", weight: 0.74, holds: ["diagram"] }, support: { role: "milestone-notes", weight: 0.26, holds: ["text"] } },
    { key: "diagram-stage", name: "Diagram Stage", focal: "structure", canvasSplit: "full-bleed", visualRhythm: "single-focus", whitespaceDensity: 0.25, hierarchyLevel: 0.6, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.9, dominant: { role: "workflow-diagram", weight: 0.82, holds: ["diagram"] }, support: { role: "title", weight: 0.18, holds: ["text"] } },
    { key: "split-narrative", name: "Split Narrative", focal: "narrative", canvasSplit: "40-60", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.5, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.75, dominant: { role: "process-diagram", weight: 0.6, holds: ["diagram"] }, support: { role: "narrative", weight: 0.4, holds: ["text"] } },
    { key: "numbered-columns", name: "Numbered Columns", focal: "structure", canvasSplit: "stacked", visualRhythm: "columns", whitespaceDensity: 0.25, hierarchyLevel: 0.45, emphasisDirection: "center", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.6, dominant: { role: "step-columns", weight: 0.72, holds: ["diagram", "text", "icon"] }, support: { role: "header", weight: 0.28, holds: ["text"] } },
  ],
  timeline: [
    { key: "horizontal-track", name: "Horizontal Track", focal: "structure", canvasSplit: "stacked", visualRhythm: "flow", whitespaceDensity: 0.35, hierarchyLevel: 0.5, emphasisDirection: "left", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.8, dominant: { role: "timeline-track", weight: 0.78, holds: ["diagram"] }, support: { role: "title", weight: 0.22, holds: ["text"] } },
    { key: "vertical-spine", name: "Vertical Spine", focal: "structure", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.35, hierarchyLevel: 0.5, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.78, dominant: { role: "spine", weight: 0.76, holds: ["diagram"] }, support: { role: "milestone-notes", weight: 0.24, holds: ["text"] } },
    { key: "milestone-hero", name: "Milestone Hero", focal: "structure", canvasSplit: "asymmetric", visualRhythm: "asymmetric", whitespaceDensity: 0.4, hierarchyLevel: 0.8, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.2, diagramPriority: 0.7, dominant: { role: "hero-milestone", weight: 0.58, holds: ["diagram", "text"] }, support: { role: "context-track", weight: 0.42, holds: ["diagram"] } },
    { key: "diagonal-ascend", name: "Diagonal Ascent", focal: "structure", canvasSplit: "diagonal", visualRhythm: "asymmetric", whitespaceDensity: 0.4, hierarchyLevel: 0.6, emphasisDirection: "diagonal", groupingStrategy: "sequential", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.75, dominant: { role: "ascending-track", weight: 0.74, holds: ["diagram"] }, support: { role: "caption", weight: 0.26, holds: ["text"] } },
    { key: "phased-bands", name: "Phased Bands", focal: "structure", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.25, hierarchyLevel: 0.45, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.72, dominant: { role: "phase-bands", weight: 0.72, holds: ["diagram", "table"] }, support: { role: "header", weight: 0.28, holds: ["text"] } },
  ],
  "kpi-reveal": [
    { key: "one-big-number", name: "One Big Number", focal: "data", canvasSplit: "single-focus", visualRhythm: "single-focus", whitespaceDensity: 0.65, hierarchyLevel: 1, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0, diagramPriority: 0, dominant: { role: "hero-metric", weight: 0.8, holds: ["metric"] }, support: { role: "context-line", weight: 0.2, holds: ["text", "callout"] } },
    { key: "hero-plus-trio", name: "Hero + Trio", focal: "data", canvasSplit: "60-40", visualRhythm: "asymmetric", whitespaceDensity: 0.4, hierarchyLevel: 0.85, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "hero-plus-support", imagePriority: 0, diagramPriority: 0, dominant: { role: "hero-metric", weight: 0.55, holds: ["metric"] }, support: { role: "support-metrics", weight: 0.45, holds: ["metric"] } },
    { key: "progressive-ladder", name: "Progressive Ladder", focal: "data", canvasSplit: "stacked", visualRhythm: "flow", whitespaceDensity: 0.3, hierarchyLevel: 0.6, emphasisDirection: "left", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "progressive", imagePriority: 0, diagramPriority: 0.1, dominant: { role: "metric-ladder", weight: 0.72, holds: ["metric"] }, support: { role: "label", weight: 0.28, holds: ["text"] } },
    { key: "split-context", name: "Split Context", focal: "data", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.35, hierarchyLevel: 0.7, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "metric-cluster", weight: 0.5, holds: ["metric"] }, support: { role: "narrative", weight: 0.5, holds: ["text", "callout"] } },
    { key: "dashboard-tiles", name: "KPI Tiles", focal: "data", canvasSplit: "stacked", visualRhythm: "grid", whitespaceDensity: 0.2, hierarchyLevel: 0.4, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "equal", imagePriority: 0, diagramPriority: 0, dominant: { role: "metric-grid", weight: 0.75, holds: ["metric"] }, support: { role: "header", weight: 0.25, holds: ["text"] } },
  ],
  comparison: [
    { key: "winner-loser", name: "Winner / Loser", focal: "data", canvasSplit: "60-40", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.85, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 2, alignmentStrategy: "grid-aligned", readingFlow: "z-pattern", comparisonStyle: "winner-loser", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0.2, dominant: { role: "winner", weight: 0.6, holds: ["text", "metric", "callout", "table"] }, support: { role: "alternative", weight: 0.4, holds: ["text", "metric", "table"] } },
    { key: "before-after", name: "Before / After", focal: "data", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.6, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "before-after", metricEmphasis: "none", imagePriority: 0.3, diagramPriority: 0.1, dominant: { role: "after", weight: 0.55, holds: ["text", "metric", "image"] }, support: { role: "before", weight: 0.45, holds: ["text", "metric", "image"] } },
    { key: "versus", name: "Head-to-Head", focal: "data", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.25, hierarchyLevel: 0.55, emphasisDirection: "center", groupingStrategy: "paired", layeringDepth: 2, alignmentStrategy: "center-aligned", readingFlow: "linear-horizontal", comparisonStyle: "versus", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0.2, dominant: { role: "side-a", weight: 0.5, holds: ["text", "metric", "table"] }, support: { role: "side-b", weight: 0.5, holds: ["text", "metric", "table"] } },
    { key: "scorecard", name: "Winner Scorecard", focal: "data", canvasSplit: "asymmetric", visualRhythm: "asymmetric", whitespaceDensity: 0.25, hierarchyLevel: 0.75, emphasisDirection: "right", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "winner-loser", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0.2, dominant: { role: "scorecard-table", weight: 0.68, holds: ["table"] }, support: { role: "verdict", weight: 0.32, holds: ["callout", "text", "metric"] } },
    { key: "balanced-columns", name: "Balanced Columns", focal: "narrative", canvasSplit: "50-50", visualRhythm: "columns", whitespaceDensity: 0.3, hierarchyLevel: 0.4, emphasisDirection: "center", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "balanced", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0.1, dominant: { role: "column-a", weight: 0.5, holds: ["text", "table"] }, support: { role: "column-b", weight: 0.5, holds: ["text", "table"] } },
  ],
  "feature-showcase": [
    { key: "hero-feature", name: "Hero Feature", focal: "media", canvasSplit: "60-40", visualRhythm: "asymmetric", whitespaceDensity: 0.4, hierarchyLevel: 0.85, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.5, diagramPriority: 0, dominant: { role: "hero-feature", weight: 0.58, holds: ["text", "image", "icon"] }, support: { role: "supporting-features", weight: 0.42, holds: ["text", "icon"] } },
    { key: "triptych", name: "Triptych", focal: "narrative", canvasSplit: "stacked", visualRhythm: "columns", whitespaceDensity: 0.3, hierarchyLevel: 0.4, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.2, diagramPriority: 0, dominant: { role: "feature-columns", weight: 0.74, holds: ["text", "icon"] }, support: { role: "header", weight: 0.26, holds: ["text"] } },
    { key: "grid", name: "Feature Grid", focal: "narrative", canvasSplit: "stacked", visualRhythm: "grid", whitespaceDensity: 0.2, hierarchyLevel: 0.35, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.15, diagramPriority: 0, dominant: { role: "feature-grid", weight: 0.75, holds: ["text", "icon"] }, support: { role: "header", weight: 0.25, holds: ["text"] } },
    { key: "media-split", name: "Media Split", focal: "media", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.55, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.55, diagramPriority: 0, dominant: { role: "media", weight: 0.5, holds: ["image"] }, support: { role: "feature-list", weight: 0.5, holds: ["text", "icon"] } },
    { key: "zigzag", name: "Zigzag", focal: "media", canvasSplit: "asymmetric", visualRhythm: "asymmetric", whitespaceDensity: 0.35, hierarchyLevel: 0.5, emphasisDirection: "diagonal", groupingStrategy: "sequential", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.45, diagramPriority: 0, dominant: { role: "feature-rows", weight: 0.7, holds: ["text", "image", "icon"] }, support: { role: "header", weight: 0.3, holds: ["text"] } },
  ],
  "case-study": [
    { key: "narrative-arc", name: "Narrative Arc", focal: "narrative", canvasSplit: "40-60", visualRhythm: "split", whitespaceDensity: 0.35, hierarchyLevel: 0.6, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "hero-plus-support", imagePriority: 0.3, diagramPriority: 0.1, dominant: { role: "evidence", weight: 0.58, holds: ["metric", "chart", "image"] }, support: { role: "story", weight: 0.42, holds: ["text"] } },
    { key: "before-after", name: "Before / After", focal: "data", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.3, hierarchyLevel: 0.6, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "before-after", metricEmphasis: "dominant-one", imagePriority: 0.3, diagramPriority: 0, dominant: { role: "after-result", weight: 0.55, holds: ["metric", "text", "image"] }, support: { role: "before-state", weight: 0.45, holds: ["metric", "text", "image"] } },
    { key: "quote-hero", name: "Quote Hero", focal: "statement", canvasSplit: "single-focus", visualRhythm: "single-focus", whitespaceDensity: 0.6, hierarchyLevel: 0.9, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0.2, diagramPriority: 0, dominant: { role: "testimonial", weight: 0.7, holds: ["text", "callout"] }, support: { role: "proof-metric", weight: 0.3, holds: ["metric"] } },
    { key: "metric-proof", name: "Metric Proof", focal: "data", canvasSplit: "60-40", visualRhythm: "asymmetric", whitespaceDensity: 0.35, hierarchyLevel: 0.8, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0.1, diagramPriority: 0.1, dominant: { role: "headline-metric", weight: 0.56, holds: ["metric", "chart"] }, support: { role: "story", weight: 0.44, holds: ["text"] } },
    { key: "stacked-story", name: "Stacked Story", focal: "narrative", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.25, hierarchyLevel: 0.45, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "hero-plus-support", imagePriority: 0.2, diagramPriority: 0.1, dominant: { role: "problem-approach-result", weight: 0.72, holds: ["text", "metric", "callout"] }, support: { role: "header", weight: 0.28, holds: ["text"] } },
  ],
  pricing: [
    { key: "recommended-tier", name: "Recommended Tier", focal: "data", canvasSplit: "stacked", visualRhythm: "columns", whitespaceDensity: 0.3, hierarchyLevel: 0.8, emphasisDirection: "center", groupingStrategy: "paired", layeringDepth: 2, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "winner-loser", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0, dominant: { role: "recommended-plan", weight: 0.45, holds: ["metric", "text", "callout"] }, support: { role: "other-plans", weight: 0.55, holds: ["metric", "text"] } },
    { key: "columns", name: "Plan Columns", focal: "data", canvasSplit: "stacked", visualRhythm: "columns", whitespaceDensity: 0.3, hierarchyLevel: 0.4, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "linear-horizontal", comparisonStyle: "balanced", metricEmphasis: "equal", imagePriority: 0, diagramPriority: 0, dominant: { role: "plan-columns", weight: 0.74, holds: ["metric", "text"] }, support: { role: "header", weight: 0.26, holds: ["text"] } },
    { key: "single-offer", name: "Single Offer", focal: "statement", canvasSplit: "single-focus", visualRhythm: "single-focus", whitespaceDensity: 0.55, hierarchyLevel: 0.9, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0, diagramPriority: 0, dominant: { role: "offer", weight: 0.7, holds: ["metric", "text", "callout"] }, support: { role: "inclusions", weight: 0.3, holds: ["text", "icon"] } },
    { key: "feature-matrix", name: "Feature Matrix", focal: "data", canvasSplit: "stacked", visualRhythm: "grid", whitespaceDensity: 0.15, hierarchyLevel: 0.4, emphasisDirection: "center", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "balanced", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0, dominant: { role: "matrix-table", weight: 0.78, holds: ["table"] }, support: { role: "header", weight: 0.22, holds: ["text"] } },
    { key: "split-value", name: "Split Value", focal: "narrative", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.35, hierarchyLevel: 0.6, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "dominant-one", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "value-narrative", weight: 0.5, holds: ["text", "callout"] }, support: { role: "price", weight: 0.5, holds: ["metric", "text"] } },
  ],
  team: [
    { key: "grid", name: "Member Grid", focal: "media", canvasSplit: "stacked", visualRhythm: "grid", whitespaceDensity: 0.25, hierarchyLevel: 0.35, emphasisDirection: "center", groupingStrategy: "clustered", layeringDepth: 1, alignmentStrategy: "grid-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.6, diagramPriority: 0, dominant: { role: "member-grid", weight: 0.75, holds: ["image", "text"] }, support: { role: "header", weight: 0.25, holds: ["text"] } },
    { key: "leader-hero", name: "Leader Hero", focal: "media", canvasSplit: "60-40", visualRhythm: "asymmetric", whitespaceDensity: 0.35, hierarchyLevel: 0.8, emphasisDirection: "left", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.6, diagramPriority: 0, dominant: { role: "leader", weight: 0.55, holds: ["image", "text"] }, support: { role: "team-grid", weight: 0.45, holds: ["image", "text"] } },
    { key: "rail", name: "Leader Rail", focal: "media", canvasSplit: "sidebar", visualRhythm: "asymmetric", whitespaceDensity: 0.3, hierarchyLevel: 0.6, emphasisDirection: "right", groupingStrategy: "nested", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "f-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.55, diagramPriority: 0, dominant: { role: "team-stage", weight: 0.62, holds: ["image", "text"] }, support: { role: "intro-rail", weight: 0.38, holds: ["text"] } },
    { key: "duo", name: "Founder Duo", focal: "media", canvasSplit: "50-50", visualRhythm: "split", whitespaceDensity: 0.4, hierarchyLevel: 0.5, emphasisDirection: "center", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "center-aligned", readingFlow: "linear-horizontal", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.6, diagramPriority: 0, dominant: { role: "founder-a", weight: 0.5, holds: ["image", "text"] }, support: { role: "founder-b", weight: 0.5, holds: ["image", "text"] } },
    { key: "mosaic", name: "Mosaic", focal: "media", canvasSplit: "asymmetric", visualRhythm: "asymmetric", whitespaceDensity: 0.2, hierarchyLevel: 0.45, emphasisDirection: "diagonal", groupingStrategy: "layered", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "radial", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.65, diagramPriority: 0, dominant: { role: "photo-mosaic", weight: 0.78, holds: ["image"] }, support: { role: "caption", weight: 0.22, holds: ["text"] } },
  ],
  quote: [
    { key: "monument", name: "Monument", focal: "statement", canvasSplit: "single-focus", visualRhythm: "single-focus", whitespaceDensity: 0.8, hierarchyLevel: 1, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0, dominant: { role: "quote", weight: 0.8, holds: ["text"] }, support: { role: "attribution", weight: 0.2, holds: ["text"] } },
    { key: "portrait-split", name: "Portrait Split", focal: "media", canvasSplit: "40-60", visualRhythm: "split", whitespaceDensity: 0.5, hierarchyLevel: 0.75, emphasisDirection: "right", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.5, diagramPriority: 0, dominant: { role: "quote", weight: 0.6, holds: ["text"] }, support: { role: "portrait", weight: 0.4, holds: ["image"] } },
    { key: "pull-left", name: "Pull Quote", focal: "statement", canvasSplit: "asymmetric", visualRhythm: "asymmetric", whitespaceDensity: 0.6, hierarchyLevel: 0.9, emphasisDirection: "bottom-left", groupingStrategy: "layered", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "quote", weight: 0.72, holds: ["text"] }, support: { role: "attribution", weight: 0.28, holds: ["text"] } },
    { key: "stacked", name: "Stacked Bands", focal: "statement", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.55, hierarchyLevel: 0.8, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0, diagramPriority: 0, dominant: { role: "quote", weight: 0.72, holds: ["text"] }, support: { role: "attribution", weight: 0.28, holds: ["text"] } },
    { key: "spotlight", name: "Spotlight", focal: "statement", canvasSplit: "single-focus", visualRhythm: "single-focus", whitespaceDensity: 0.75, hierarchyLevel: 0.95, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.15, diagramPriority: 0, dominant: { role: "quote", weight: 0.76, holds: ["text"] }, support: { role: "attribution", weight: 0.24, holds: ["text", "image"] } },
  ],
  "closing-cta": [
    { key: "monument", name: "Monument CTA", focal: "statement", canvasSplit: "full-bleed", visualRhythm: "single-focus", whitespaceDensity: 0.75, hierarchyLevel: 1, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "cta-statement", weight: 0.75, holds: ["text"] }, support: { role: "action", weight: 0.25, holds: ["text", "callout", "icon"] } },
    { key: "split-action", name: "Split Action", focal: "statement", canvasSplit: "60-40", visualRhythm: "split", whitespaceDensity: 0.45, hierarchyLevel: 0.85, emphasisDirection: "left", groupingStrategy: "paired", layeringDepth: 1, alignmentStrategy: "edge-aligned", readingFlow: "z-pattern", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.2, diagramPriority: 0, dominant: { role: "statement", weight: 0.6, holds: ["text"] }, support: { role: "contact-action", weight: 0.4, holds: ["text", "callout", "icon"] } },
    { key: "stacked", name: "Stacked Invite", focal: "statement", canvasSplit: "stacked", visualRhythm: "stacked", whitespaceDensity: 0.6, hierarchyLevel: 0.9, emphasisDirection: "top", groupingStrategy: "sequential", layeringDepth: 1, alignmentStrategy: "baseline", readingFlow: "linear-vertical", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "headline", weight: 0.65, holds: ["text"] }, support: { role: "action", weight: 0.35, holds: ["text", "callout"] } },
    { key: "diagonal", name: "Diagonal CTA", focal: "statement", canvasSplit: "diagonal", visualRhythm: "asymmetric", whitespaceDensity: 0.55, hierarchyLevel: 0.9, emphasisDirection: "bottom-right", groupingStrategy: "layered", layeringDepth: 2, alignmentStrategy: "optical", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.2, diagramPriority: 0, dominant: { role: "cta-statement", weight: 0.7, holds: ["text"] }, support: { role: "accent", weight: 0.3, holds: ["image", "icon"] } },
    { key: "centered-invite", name: "Centered Invite", focal: "statement", canvasSplit: "single-focus", visualRhythm: "single-focus", whitespaceDensity: 0.7, hierarchyLevel: 0.95, emphasisDirection: "center", groupingStrategy: "unified", layeringDepth: 1, alignmentStrategy: "center-aligned", readingFlow: "focal-first", comparisonStyle: "none", metricEmphasis: "none", imagePriority: 0.1, diagramPriority: 0, dominant: { role: "invite", weight: 0.72, holds: ["text"] }, support: { role: "action", weight: 0.28, holds: ["text", "callout", "icon"] } },
  ],
};
/* eslint-enable prettier/prettier */

export function getStrategies(scene: SceneId): StrategySpec[] {
  return SCENE_STRATEGIES[scene];
}
