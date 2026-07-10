/**
 * Presentation rhythm — deterministic deck-level alternation.
 *
 * A deck where every slide has the same energy, the same centered bias, and the
 * same visual/textual balance reads as machine-generated. This module performs
 * a single sequential pass and, for every slide, chooses an energy, horizontal
 * bias, and modality that (a) fits the slide's own content, yet (b) deliberately
 * contrasts with the previous slide. The result is the "dense → minimal",
 * "left → centered → right", "visual → textual" cadence a human designer uses.
 *
 * Determinism: pure function of the ordered per-slide signals. No RNG, no time.
 */

import type {
  CompositionBias,
  EmotionalIntent,
  SlideEnergy,
  SlideModality,
} from "./types";

export interface RhythmSignal {
  intent: EmotionalIntent;
  elementCount: number;
  visualCount: number;
  textCount: number;
}

export interface RhythmDecision {
  energy: SlideEnergy;
  bias: CompositionBias;
  modality: SlideModality;
}

const MINIMAL_INTENTS = new Set<EmotionalIntent>([
  "inspire",
  "reveal",
  "celebrate",
  "urgency",
]);
const DENSE_INTENTS = new Set<EmotionalIntent>(["explain", "educate", "compare"]);

function baselineEnergy(signal: RhythmSignal): SlideEnergy {
  let energy: SlideEnergy =
    signal.elementCount >= 6 ? "dense" : signal.elementCount <= 2 ? "minimal" : "balanced";
  if (MINIMAL_INTENTS.has(signal.intent) && signal.elementCount <= 4) energy = "minimal";
  else if (DENSE_INTENTS.has(signal.intent) && signal.elementCount >= 4) energy = "dense";
  return energy;
}

function baselineModality(signal: RhythmSignal): SlideModality {
  if (signal.visualCount > signal.textCount) return "visual";
  if (signal.textCount > signal.visualCount * 2) return "textual";
  return "mixed";
}

/** Preference order per baseline so the first fallback is the strongest contrast. */
const ENERGY_ORDER: Record<SlideEnergy, SlideEnergy[]> = {
  dense: ["dense", "minimal", "balanced"],
  minimal: ["minimal", "dense", "balanced"],
  balanced: ["balanced", "dense", "minimal"],
};

const BIAS_ORDER: Record<CompositionBias, CompositionBias[]> = {
  center: ["center", "left", "right"],
  left: ["left", "right", "center"],
  right: ["right", "left", "center"],
};

const MODALITY_ORDER: Record<SlideModality, SlideModality[]> = {
  visual: ["visual", "textual", "mixed"],
  textual: ["textual", "visual", "mixed"],
  mixed: ["mixed", "visual", "textual"],
};

function pickAvoiding<T>(order: T[], avoid: T | undefined): T {
  if (avoid === undefined) return order[0];
  return order.find((value) => value !== avoid) ?? order[0];
}

/** Rotate the baseline horizontal bias so the deck does not center everything. */
function baselineBias(index: number): CompositionBias {
  return (["center", "left", "right"] as const)[index % 3];
}

export function sequenceRhythm(signals: RhythmSignal[]): RhythmDecision[] {
  const decisions: RhythmDecision[] = [];
  let prev: RhythmDecision | undefined;

  signals.forEach((signal, index) => {
    const energy = pickAvoiding(
      ENERGY_ORDER[baselineEnergy(signal)],
      prev?.energy,
    );
    const bias = pickAvoiding(BIAS_ORDER[baselineBias(index)], prev?.bias);
    const modality = pickAvoiding(
      MODALITY_ORDER[baselineModality(signal)],
      prev?.modality,
    );
    const decision: RhythmDecision = { energy, bias, modality };
    decisions.push(decision);
    prev = decision;
  });

  return decisions;
}
