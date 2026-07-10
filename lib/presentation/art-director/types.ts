/**
 * Presentation Art Director — types.
 *
 * Pipeline position:
 *   Scene Engine → Composer → Visualization Engine → **Art Director** → Layout Engine
 *
 * The Art Director is the stage that turns a technically-correct assembly of
 * components into a deliberately *art-directed* slide. It decides the emotional
 * purpose of every slide, what dominates, what recedes, where the eye travels,
 * how much whitespace and tension a slide carries, and how energy alternates
 * across the deck so no two adjacent slides feel the same.
 *
 * Hard rule (identical to every upstream semantic engine): this module emits
 * ONLY semantic design decisions. No coordinates, no pixels, no frames, no
 * renderer-specific output. Positioning remains the exclusive responsibility of
 * the Layout Engine, which already consumes the (refined) CompositionPlan.
 */

import type { SemanticElement } from "../ir/schema";
import type { CompositionPlan, EmphasisDirection, ReadingFlow } from "../composer/types";

// ---------------------------------------------------------------------------
// Emotional intent
// ---------------------------------------------------------------------------

/** The single emotional purpose a slide is directed to achieve. */
export const EMOTIONAL_INTENTS = [
  "inspire",
  "explain",
  "compare",
  "convince",
  "reveal",
  "educate",
  "celebrate",
  "urgency",
] as const;

export type EmotionalIntent = (typeof EMOTIONAL_INTENTS)[number];

// ---------------------------------------------------------------------------
// Deck rhythm — alternated across slides to avoid "AI sameness"
// ---------------------------------------------------------------------------

/** Content energy of a slide — deliberately alternated across the deck. */
export type SlideEnergy = "dense" | "balanced" | "minimal";
/** Horizontal weighting of the composition — alternated to avoid all-centered decks. */
export type CompositionBias = "left" | "center" | "right";
/** Whether a slide leans on imagery/structure or on words. */
export type SlideModality = "visual" | "mixed" | "textual";

// ---------------------------------------------------------------------------
// Visual hierarchy — per-object art direction (no geometry)
// ---------------------------------------------------------------------------

/** Rank of visual emphasis, from the hero object down to muted supporting content. */
export type HierarchyEmphasis =
  | "dominant"
  | "primary"
  | "secondary"
  | "tertiary"
  | "muted";

/**
 * The art-directed weighting of a single semantic object. Every field is a
 * relative, unitless design intent — never a size, position, or pixel value.
 */
export interface VisualHierarchyEntry {
  elementId: string;
  kind: SemanticElement["kind"];
  role?: string;
  /** 1 = highest priority (the focal object); larger numbers recede. */
  priority: number;
  emphasis: HierarchyEmphasis;
  /** relative scale intent (0.4 muted → 2.4 hero). Not a font size. */
  scale: number;
  /** how much breathing room this object deserves around it: 0–1 */
  spacingWeight: number;
  /** how important negative space is to this object's impact: 0–1 */
  whitespaceImportance: number;
  /** how tightly this object binds to its neighbours: 0 (isolated) – 1 (tight cluster) */
  groupingStrength: number;
  /** deterministic reading order (0 = seen first) */
  readingOrder: number;
}

// ---------------------------------------------------------------------------
// Art direction — the Art Director's per-slide output
// ---------------------------------------------------------------------------

export interface ArtDirection {
  slideId: string;
  emotionalIntent: EmotionalIntent;
  /** the semantic role/element the eye must hit first */
  focalPoint: string;
  /** what owns the slide */
  dominant: string;
  /** what is intentionally muted so the focal point wins */
  recede: string[];
  /** supporting roles that stay legible but never compete */
  secondary: string[];
  /** premium negative space intent: 0 (packed) – 1 (very airy) */
  whitespace: number;
  /** visual tension intent: 0 (calm/balanced) – 1 (dynamic/off-balance) */
  tension: number;
  /** how the eye is directed to travel across the slide */
  eyeTravel: ReadingFlow;
  /** where the composition's weight is placed horizontally */
  bias: CompositionBias;
  /** content energy — alternated across the deck */
  energy: SlideEnergy;
  /** visual vs textual lean — alternated across the deck */
  modality: SlideModality;
  /** the resolved emphasis direction handed to the layout stage */
  emphasisDirection: EmphasisDirection;
  /** per-object art direction (unequal by design) */
  hierarchy: VisualHierarchyEntry[];
  /** deterministic explanation for tests / debugging */
  rationale: string[];
}

// ---------------------------------------------------------------------------
// Engine output
// ---------------------------------------------------------------------------

export interface ArtDirectionResult {
  /** per-slide art direction (semantic decisions only) */
  directions: ArtDirection[];
  /**
   * The composition plans, refined with the Art Director's decisions
   * (whitespace, hierarchy strength, emphasis direction, metric/comparison
   * emphasis, reading flow). Still valid `CompositionPlan`s — the Layout Engine
   * consumes them unchanged through its existing composition-affinity seam.
   */
  plans: CompositionPlan[];
}
