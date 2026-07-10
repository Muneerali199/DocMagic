/**
 * Presentation Composer — types.
 *
 * The Presentation Composer sits BETWEEN the Scene Engine and the Layout
 * Engine. The Scene Engine decides *what kind of slide* this is (scene) and a
 * broad composition variant. The Composer turns that decision into a concrete
 * **composition intent** — a rich, semantic description of how a human
 * presentation designer would structure the canvas — WITHOUT ever computing a
 * single coordinate.
 *
 * Hard rule (identical to the Scene Engine): nothing in this module emits
 * pixels, frames, or absolute positions. It emits *proportions*, *roles*,
 * *directions* and *strategies*. Coordinate math stays the exclusive job of
 * the Layout Engine, which consumes this metadata.
 */

import type { SceneId, FocalStrategy } from "../scene/types";

// ---------------------------------------------------------------------------
// Vocabulary — every field is a semantic direction, never geometry
// ---------------------------------------------------------------------------

/**
 * How the canvas is fundamentally divided. These are *intents*, not frames;
 * the Layout Engine decides the actual pixels.
 */
export type CanvasSplit =
  | "full-bleed" // one element owns the whole canvas
  | "single-focus" // one focal object with generous margins
  | "50-50" // balanced halves
  | "60-40" // dominant / supporting
  | "40-60" // supporting / dominant
  | "70-30" // strong dominance
  | "30-70"
  | "asymmetric" // intentional off-balance, no clean ratio
  | "diagonal" // focal energy runs corner-to-corner
  | "stacked" // full-width horizontal bands
  | "radial" // center-out from a hub
  | "sidebar"; // narrow rail + wide stage

export type CompositionRhythm =
  | "single-focus"
  | "split"
  | "columns"
  | "grid"
  | "flow"
  | "stacked"
  | "asymmetric"
  | "radial";

export type EmphasisDirection =
  | "center"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "diagonal";

export type GroupingStrategy =
  | "unified" // one continuous composition, no visible grouping
  | "paired" // two related clusters
  | "clustered" // several small clusters
  | "sequential" // ordered chain of steps
  | "nested" // hierarchy of containers
  | "layered"; // overlapping depth planes

export type AlignmentStrategy =
  | "grid-aligned"
  | "edge-aligned"
  | "center-aligned"
  | "optical" // deliberately optically balanced, not mathematically centered
  | "baseline";

export type ReadingFlow =
  | "z-pattern"
  | "f-pattern"
  | "linear-vertical"
  | "linear-horizontal"
  | "radial"
  | "focal-first"; // eye is pulled to the hero, then scatters

export type ComparisonStyle =
  | "none"
  | "balanced" // two genuinely equal columns
  | "winner-loser" // one side is clearly dominant / preferred
  | "before-after" // temporal transformation, left→right
  | "versus"; // head-to-head confrontation with a divider

export type MetricEmphasis =
  | "none"
  | "equal" // all metrics same weight
  | "dominant-one" // one hero number, the rest supporting
  | "hero-plus-support" // hero number + a small support cluster
  | "progressive"; // metrics build in a ranked sequence

// ---------------------------------------------------------------------------
// Zones — ordered, weighted, semantic (NO coordinates)
// ---------------------------------------------------------------------------

/**
 * A semantic region the composition proposes. `weight` is the share of visual
 * importance (0–1) — the Layout Engine may translate that into size, but the
 * Composer never says *where* or *how big* in pixels.
 */
export interface CompositionZone {
  /** semantic role, e.g. "hero-statement", "winner", "supporting-metrics" */
  role: string;
  /** relative visual importance 0–1 (all zone weights roughly sum to ~1) */
  weight: number;
  /** rank of prominence */
  emphasis: "primary" | "secondary" | "tertiary";
  /** which element kinds this zone is meant to hold, if constrained */
  holds?: Array<
    | "text"
    | "image"
    | "icon"
    | "metric"
    | "chart"
    | "diagram"
    | "table"
    | "code"
    | "callout"
  >;
}

// ---------------------------------------------------------------------------
// The Composition Plan — the Composer's per-slide output
// ---------------------------------------------------------------------------

export interface CompositionPlan {
  /** globally unique: `${slideId}` */
  slideId: string;
  scene: SceneId;
  /** the scene variant id this plan was derived from */
  variantId: string;
  /** the composition strategy id: `${scene}/${strategyKey}` */
  strategyId: string;
  strategyName: string;

  // --- required composition metadata (spec §2) ---------------------------
  /** the single most important region */
  dominantFocalArea: CompositionZone;
  /** the secondary region(s) that support the focal point */
  supportingArea: CompositionZone;
  canvasSplit: CanvasSplit;
  visualRhythm: CompositionRhythm;
  /** 0 (dense/packed) – 1 (very airy) */
  whitespaceDensity: number;
  /** 0 (flat, egalitarian) – 1 (one dominant focal point) */
  hierarchyLevel: number;
  emphasisDirection: EmphasisDirection;
  groupingStrategy: GroupingStrategy;
  /** 0 (flat) – 3 (multiple overlapping depth planes) */
  layeringDepth: number;
  alignmentStrategy: AlignmentStrategy;
  readingFlow: ReadingFlow;
  comparisonStyle: ComparisonStyle;
  metricEmphasis: MetricEmphasis;
  /** how much the composition prioritises imagery / mockups: 0–1 */
  imagePriority: number;
  /** how much the composition prioritises diagrams: 0–1 */
  diagramPriority: number;

  // --- derived / supporting ---------------------------------------------
  /** what the composition puts its visual weight behind */
  focal: FocalStrategy;
  /** ordered semantic zones (focal first). Roles only, never positions. */
  zones: CompositionZone[];
  /** deterministic explanation for tests / debugging */
  rationale: string[];
}

export interface PresentationComposition {
  plans: CompositionPlan[];
  /** the seed used — same seed + same IR ⇒ identical composition */
  seed: number;
}
