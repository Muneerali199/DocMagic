/**
 * Emotional intent inference — deterministic, structural.
 *
 * Intent is derived from the slide's scene archetype, its typed slide role, and
 * the composition's structural signals (focal strategy, metric/comparison
 * emphasis). It NEVER inspects title text or keywords — two slides with the
 * same structure always receive the same emotional intent.
 */

import type { SemanticSlide } from "../ir/schema";
import type { CompositionPlan } from "../composer/types";
import type { SceneAssignment } from "../scene/types";
import type { EmotionalIntent } from "./types";

/** Primary mapping from scene archetype to emotional intent. */
const SCENE_INTENT: Record<string, EmotionalIntent> = {
  hero: "inspire",
  "product-demo": "reveal",
  "dashboard-showcase": "reveal",
  "technical-architecture": "explain",
  workflow: "explain",
  timeline: "educate",
  "kpi-reveal": "reveal",
  comparison: "compare",
  "feature-showcase": "inspire",
  "case-study": "convince",
  pricing: "convince",
  team: "celebrate",
  quote: "celebrate",
  "closing-cta": "urgency",
};

/** Secondary mapping from typed slide role, used when scene is neutral. */
const SLIDE_TYPE_INTENT: Record<string, EmotionalIntent> = {
  hero: "inspire",
  kpi: "reveal",
  timeline: "educate",
  comparison: "compare",
  process: "explain",
  flowchart: "explain",
  architecture: "explain",
  orgchart: "explain",
  swot: "compare",
  funnel: "convince",
  pyramid: "educate",
  roadmap: "educate",
  gallery: "inspire",
  quote: "celebrate",
  dashboard: "reveal",
  content: "educate",
  agenda: "educate",
  section: "inspire",
  closing: "urgency",
};

/**
 * Resolve the emotional intent for a slide. Structural composition signals can
 * sharpen (but never randomise) the scene/type baseline.
 */
export function inferEmotionalIntent(
  slide: SemanticSlide,
  scene: SceneAssignment | undefined,
  plan: CompositionPlan | undefined,
): { intent: EmotionalIntent; rationale: string[] } {
  const rationale: string[] = [];
  let intent: EmotionalIntent =
    (scene && SCENE_INTENT[scene.scene]) ??
    SLIDE_TYPE_INTENT[slide.type] ??
    "educate";
  rationale.push(
    `Baseline intent "${intent}" from ${scene ? `scene "${scene.scene}"` : `slide type "${slide.type}"`}.`,
  );

  if (plan) {
    // A clearly dominant single metric is a reveal moment, not a lesson.
    if (
      plan.metricEmphasis === "dominant-one" ||
      plan.metricEmphasis === "hero-plus-support"
    ) {
      intent = intent === "convince" ? "convince" : "reveal";
      rationale.push(`Sharpened to "${intent}" by dominant-metric emphasis.`);
    }
    // A winner/loser or versus comparison is always a compare intent.
    else if (
      plan.comparisonStyle === "winner-loser" ||
      plan.comparisonStyle === "versus"
    ) {
      intent = "compare";
      rationale.push(`Sharpened to "compare" by ${plan.comparisonStyle} comparison.`);
    }
    // A single-focus statement with very high hierarchy turns a neutral
    // informational slide into a persuasion beat — but never overrides an
    // already-expressive intent (inspire/reveal/celebrate/urgency).
    else if (
      plan.focal === "statement" &&
      plan.hierarchyLevel >= 0.8 &&
      (intent === "explain" || intent === "educate")
    ) {
      intent = "convince";
      rationale.push(`Sharpened to "convince" by high-hierarchy statement focus.`);
    }
  }

  return { intent, rationale };
}
