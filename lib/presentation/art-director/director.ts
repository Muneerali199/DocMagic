/**
 * Presentation Art Director — deterministic direction pass.
 *
 * Pipeline position:
 *   Visualization Engine → **Art Director** → Layout Engine
 *
 * For every slide the Art Director:
 *   1. infers a single emotional intent (structural, never keyword-based);
 *   2. sets premium whitespace and visual tension for that intent;
 *   3. builds a strict visual hierarchy (one dominant object, the rest recede);
 *   4. participates in a deck-level rhythm so adjacent slides never share
 *      energy, horizontal bias, or visual/textual balance; and
 *   5. refines the slide's CompositionPlan with those decisions.
 *
 * The refined plans are ordinary `CompositionPlan`s: the Layout Engine consumes
 * them unchanged through its existing composition-affinity seam. The Art
 * Director emits ONLY semantic design intent — never a coordinate, size, frame,
 * or renderer instruction. Same inputs ⇒ identical output.
 */

import type { SemanticSlide } from "../ir/schema";
import type { SceneAssignment } from "../scene/types";
import type {
  CompositionPlan,
  EmphasisDirection,
  MetricEmphasis,
  ReadingFlow,
} from "../composer/types";
import { inferEmotionalIntent } from "./intent";
import { buildHierarchy } from "./hierarchy";
import { sequenceRhythm, type RhythmSignal } from "./rhythm";
import type {
  ArtDirection,
  ArtDirectionResult,
  CompositionBias,
  EmotionalIntent,
} from "./types";

function clamp01(value: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * 100) / 100;
}

const WHITESPACE_INTENT: Record<EmotionalIntent, number> = {
  inspire: 0.12,
  reveal: 0.12,
  celebrate: 0.1,
  urgency: 0.06,
  convince: 0,
  compare: -0.05,
  explain: -0.05,
  educate: -0.05,
};

const HIERARCHY_TARGET: Record<EmotionalIntent, number> = {
  inspire: 0.85,
  reveal: 0.85,
  urgency: 0.85,
  convince: 0.85,
  celebrate: 0.75,
  compare: 0.7,
  explain: 0.62,
  educate: 0.6,
};

const TENSION_INTENT: Record<EmotionalIntent, number> = {
  reveal: 0.2,
  urgency: 0.2,
  inspire: 0.1,
  convince: 0.1,
  compare: 0.1,
  explain: 0,
  educate: 0,
  celebrate: 0,
};

function resolveWhitespace(
  plan: CompositionPlan | undefined,
  intent: EmotionalIntent,
  energyMinimal: boolean,
  energyDense: boolean,
): number {
  const base = plan?.whitespaceDensity ?? 0.5;
  const energyAdj = energyMinimal ? 0.25 : energyDense ? -0.2 : 0;
  const target = 0.55 + energyAdj + WHITESPACE_INTENT[intent];
  // Blend with the composition's own density so the direction stays grounded,
  // and keep a premium floor so no slide is ever visually cramped.
  return clamp01(Math.max(0.2, base * 0.5 + target * 0.5));
}

function resolveTension(
  plan: CompositionPlan | undefined,
  intent: EmotionalIntent,
  bias: CompositionBias,
): number {
  let tension = 0.3 + TENSION_INTENT[intent];
  if (bias !== "center") tension += 0.2;
  if (plan && (plan.canvasSplit === "asymmetric" || plan.canvasSplit === "diagonal")) {
    tension += 0.15;
  }
  tension += (plan?.hierarchyLevel ?? 0.5) * 0.1;
  return clamp01(tension);
}

function resolveEyeTravel(
  plan: CompositionPlan | undefined,
  textCount: number,
  visualCount: number,
): ReadingFlow {
  if (!plan) return "focal-first";
  if (plan.visualRhythm === "single-focus" || plan.hierarchyLevel >= 0.75) return "focal-first";
  if (plan.visualRhythm === "flow") return "linear-horizontal";
  if (plan.comparisonStyle !== "none") return "linear-horizontal";
  if (plan.visualRhythm === "radial") return "radial";
  if (plan.visualRhythm === "grid") return "z-pattern";
  if (textCount >= 3 && visualCount === 0) return "f-pattern";
  return plan.readingFlow;
}

function resolveEmphasisDirection(
  bias: CompositionBias,
  tension: number,
): EmphasisDirection {
  if (bias === "left") return tension >= 0.6 ? "top-left" : "left";
  if (bias === "right") return tension >= 0.6 ? "bottom-right" : "right";
  return "center";
}

function refineMetricEmphasis(
  plan: CompositionPlan,
  dominantKind: string,
  metricCount: number,
): MetricEmphasis {
  if (dominantKind !== "metric") return plan.metricEmphasis;
  if (plan.metricEmphasis === "progressive") return plan.metricEmphasis;
  return metricCount <= 1 ? "dominant-one" : "hero-plus-support";
}

export function directPresentation(
  slides: SemanticSlide[],
  scenes: SceneAssignment[],
  plans: CompositionPlan[],
): ArtDirectionResult {
  const sceneBySlide = new Map(scenes.map((scene) => [scene.slideId, scene]));
  const planBySlide = new Map(plans.map((plan) => [plan.slideId, plan]));

  // Pass 1: intent + per-slide signals feed the deck-level rhythm sequencer.
  const perSlide = slides.map((slide) => {
    const scene = sceneBySlide.get(slide.id);
    const plan = planBySlide.get(slide.id);
    const { intent, rationale } = inferEmotionalIntent(slide, scene, plan);
    const textCount = slide.elements.filter((el) => el.kind === "text").length;
    const visualCount = slide.elements.length - textCount;
    return { slide, plan, intent, rationale, textCount, visualCount };
  });

  const rhythm = sequenceRhythm(
    perSlide.map<RhythmSignal>((entry) => ({
      intent: entry.intent,
      elementCount: entry.slide.elements.length,
      visualCount: entry.visualCount,
      textCount: entry.textCount,
    })),
  );

  // Pass 2: resolve whitespace/tension/hierarchy and refine each plan.
  const directions: ArtDirection[] = [];
  const refinedPlans: CompositionPlan[] = [];

  perSlide.forEach((entry, index) => {
    const { slide, plan, intent, rationale, textCount, visualCount } = entry;
    const beat = rhythm[index];
    const whitespace = resolveWhitespace(
      plan,
      intent,
      beat.energy === "minimal",
      beat.energy === "dense",
    );
    const tension = resolveTension(plan, intent, beat.bias);
    const eyeTravel = resolveEyeTravel(plan, textCount, visualCount);
    const emphasisDirection = resolveEmphasisDirection(beat.bias, tension);
    const model = buildHierarchy(slide.elements, plan, intent, whitespace);
    const dominantEntry = model.entries[0];
    const metricCount = slide.elements.filter((el) => el.kind === "metric").length;

    directions.push({
      slideId: slide.id,
      emotionalIntent: intent,
      focalPoint: model.focalPoint,
      dominant: model.dominant,
      recede: model.recede,
      secondary: model.secondary,
      whitespace,
      tension,
      eyeTravel,
      bias: beat.bias,
      energy: beat.energy,
      modality: beat.modality,
      emphasisDirection,
      hierarchy: model.entries,
      rationale: [
        ...rationale,
        `Directed the "${model.dominant}" object as the single focal point; ${model.recede.length} role(s) recede.`,
        `Rhythm beat: ${beat.energy} energy, ${beat.bias} bias, ${beat.modality} modality (contrasts the previous slide).`,
        `Premium whitespace ${whitespace.toFixed(2)}, visual tension ${tension.toFixed(2)}, eye travels ${eyeTravel}.`,
      ],
    });

    if (plan) {
      const target = HIERARCHY_TARGET[intent];
      refinedPlans.push({
        ...plan,
        whitespaceDensity: whitespace,
        hierarchyLevel: clamp01(Math.max(plan.hierarchyLevel, target)),
        emphasisDirection,
        readingFlow: eyeTravel,
        metricEmphasis: refineMetricEmphasis(plan, dominantEntry.kind, metricCount),
        comparisonStyle:
          plan.comparisonStyle === "balanced" && intent === "convince"
            ? "winner-loser"
            : plan.comparisonStyle,
        rationale: [
          ...plan.rationale,
          `Art Director: intent="${intent}", whitespace=${whitespace.toFixed(2)}, hierarchy raised for a single focal point.`,
        ],
      });
    }
  });

  return { directions, plans: refinedPlans.length ? refinedPlans : plans };
}
