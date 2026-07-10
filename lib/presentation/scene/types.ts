/**
 * Scene Composition Engine — types.
 *
 * A "scene" is a presentation archetype (Hero, Workflow, KPI Reveal, …)
 * selected BEFORE layout resolution. Each scene exposes multiple
 * composition variants that differ in structure, hierarchy, whitespace,
 * and element placement strategy.
 *
 * Hard rule: everything in this module is SEMANTIC composition metadata.
 * No absolute coordinates, no pixel values, no frames. Positioning remains
 * the exclusive responsibility of the existing Layout Engine.
 */

import type { LayoutMetadata } from "../layout/library";

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

export const SCENE_IDS = [
  "hero",
  "product-demo",
  "dashboard-showcase",
  "technical-architecture",
  "workflow",
  "timeline",
  "kpi-reveal",
  "comparison",
  "feature-showcase",
  "case-study",
  "pricing",
  "team",
  "quote",
  "closing-cta",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

// ---------------------------------------------------------------------------
// Composition variants — semantic metadata only
// ---------------------------------------------------------------------------

/** High-level structural strategy of a composition (never geometry). */
export type CompositionStructure =
  | "single-focus" // one dominant statement / element
  | "split" // two opposing zones (e.g. narrative vs evidence)
  | "columns" // repeated vertical lanes
  | "grid" // uniform cell repetition
  | "flow" // directional sequence
  | "stacked" // strong vertical top-to-bottom narrative
  | "asymmetric" // intentionally off-balance focal composition
  | "radial"; // center-out arrangement (conceptual, not literal circles)

/** What the composition puts visual weight behind. */
export type FocalStrategy =
  | "statement" // a big claim / title
  | "media" // imagery / product visuals
  | "data" // metrics / charts
  | "structure" // diagrams / relationships
  | "narrative"; // running text / story

export interface CompositionVariant {
  /** globally unique: `${sceneId}/${variantKey}` */
  id: string;
  name: string;
  structure: CompositionStructure;
  focal: FocalStrategy;
  /** visual hierarchy strength: 0 (flat) – 1 (single dominant focal point) */
  hierarchy: number;
  /** intended negative space: 0 (dense) – 1 (very airy) */
  whitespace: number;
  /** content density the variant is designed for: 0 – 1 */
  density: number;
  /**
   * Ordered semantic zones the variant proposes (role names only, e.g.
   * "kicker", "statement", "evidence", "supporting"). The Layout Engine is
   * free to interpret or ignore them — they carry NO positions.
   */
  zones: string[];
  /** which LayoutMetadata.visualRhythm this variant harmonizes with */
  rhythmAffinity: LayoutMetadata["visualRhythm"];
  /** which LayoutMetadata.emphasis this variant harmonizes with */
  emphasisAffinity: LayoutMetadata["emphasis"];
}

export interface SceneDefinition {
  id: SceneId;
  name: string;
  /** what this scene exists to communicate */
  purpose: string;
  /** minimum 5 structurally distinct variants */
  variants: CompositionVariant[];
}

// ---------------------------------------------------------------------------
// Engine output
// ---------------------------------------------------------------------------

export interface SceneAssignment {
  slideId: string;
  scene: SceneId;
  variant: CompositionVariant;
  /** classification confidence score (relative, deterministic) */
  score: number;
  /** human-readable classification evidence, for debugging/tests */
  rationale: string[];
}
