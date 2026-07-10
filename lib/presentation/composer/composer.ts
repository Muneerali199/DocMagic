/**
 * Presentation Composer — deterministic composition planning.
 *
 * Pipeline position:  Scene Engine  →  **Presentation Composer**  →  Layout Engine
 *
 * The Scene Engine tells us *what kind of slide* this is (scene + variant).
 * The Composer turns that into a concrete **composition intent**: for each
 * slide it selects one of the scene's ≥5 structurally-distinct strategies and
 * emits a `CompositionPlan` (focal area, canvas split, rhythm, whitespace,
 * hierarchy, grouping, reading flow, comparison/metric emphasis, …).
 *
 * Everything here is:
 *   - SEMANTIC: proportions, roles, directions — never a single coordinate.
 *   - DETERMINISTIC: identical Semantic IR + seed ⇒ identical composition.
 *   - RENDERER-INDEPENDENT: no dependency on any renderer, compiler or token.
 *
 * Diversity: strategy selection is content-fit scored, then adjusted so that
 * consecutive slides do not share the same visual structure (canvas split /
 * rhythm) and the deck does not over-use one strategy — mirroring how a human
 * designer keeps a deck visually varied.
 */

import type { SemanticSlide } from "../ir/schema";
import type { SceneAssignment, SceneId } from "../scene/types";
import {
  buildPlan,
  getStrategies,
  readContent,
  type StrategySpec,
  type ContentSignals,
} from "./strategies";
import type { CompositionPlan, PresentationComposition } from "./types";

// ---------------------------------------------------------------------------
// Deterministic hashing (FNV-1a) — stable tie-breaking, no RNG
// ---------------------------------------------------------------------------

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// ---------------------------------------------------------------------------
// Strategy fit scoring
// ---------------------------------------------------------------------------

/**
 * How well a strategy's structural DNA matches the slide's actual material.
 * Higher = better. Deterministic; content-driven only.
 */
function strategyFit(spec: StrategySpec, content: ContentSignals): number {
  let score = 0;

  // Focal alignment: spotlight what the slide actually contains.
  const dataHeavy = content.metrics + content.charts;
  if (spec.focal === "structure") score += content.diagrams > 0 ? 12 : -8;
  if (spec.focal === "data") score += dataHeavy > 0 ? 10 : -6;
  if (spec.focal === "media") score += content.media > 0 ? 9 : -5;
  if (spec.focal === "statement")
    score += content.total <= 3 && dataHeavy === 0 ? 6 : -2;
  if (spec.focal === "narrative") score += content.texts >= 2 ? 5 : 0;

  // Diagram reservation: never force a diagram slide into a card grid.
  if (content.diagrams > 0) score += spec.diagramPriority * 10;
  if (content.diagrams === 0) score -= spec.diagramPriority * 6;

  // Metric strategies want metrics; dense metric decks like grids/ladders.
  if (spec.metricEmphasis !== "none") {
    score += content.metrics > 0 ? 6 : -6;
    if (content.metrics >= 5 && spec.visualRhythm === "grid") score += 4;
    if (content.metrics === 1 && spec.metricEmphasis === "dominant-one")
      score += 5;
  }

  // Comparison strategies want two comparable clusters or a table/chart.
  if (spec.comparisonStyle !== "none" && spec.comparisonStyle !== "balanced") {
    const comparable =
      content.tables + content.charts + Math.floor(content.metrics / 2);
    score += comparable > 0 ? 6 : -4;
  }

  // Density alignment: airy strategies dislike dense material and vice-versa.
  const volume = Math.min(1, content.total / 9);
  score -= Math.abs(volume - (1 - spec.whitespaceDensity)) * 6;

  // Media strategies want imagery present.
  if (spec.imagePriority >= 0.4) score += content.media > 0 ? 4 : -3;

  return score;
}

// ---------------------------------------------------------------------------
// Diversity-aware selection
// ---------------------------------------------------------------------------

const DIVERSITY = {
  /** same strategy id as the immediately previous slide */
  adjacentStrategyRepeat: 40,
  /** same canvas split as the previous slide */
  adjacentSplitRepeat: 14,
  /** same visual rhythm as the previous slide */
  adjacentRhythmRepeat: 10,
  /** each earlier use of a strategy anywhere in the deck */
  strategyReuse: 5,
} as const;

interface SelectionState {
  prev?: CompositionPlan;
  strategyUsage: Map<string, number>;
}

function selectStrategy(
  slide: SemanticSlide,
  scene: SceneId,
  content: ContentSignals,
  state: SelectionState,
  seed: number,
): { spec: StrategySpec; score: number; notes: string[] } {
  const specs = getStrategies(scene);
  const slideSeed = fnv1a(`${seed}::${slide.id}::${scene}::${slide.intent}`);

  let best = specs[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  const notes: string[] = [];

  specs.forEach((spec, idx) => {
    let score = strategyFit(spec, content);

    if (state.prev) {
      if (state.prev.strategyId === `${scene}/${spec.key}`)
        score -= DIVERSITY.adjacentStrategyRepeat;
      if (state.prev.canvasSplit === spec.canvasSplit)
        score -= DIVERSITY.adjacentSplitRepeat;
      if (state.prev.visualRhythm === spec.visualRhythm)
        score -= DIVERSITY.adjacentRhythmRepeat;
    }
    score -=
      (state.strategyUsage.get(`${scene}/${spec.key}`) ?? 0) *
      DIVERSITY.strategyReuse;

    // Deterministic tie-break: seeded per-slide, stable across runs.
    score += ((slideSeed >> (idx % 8)) & 0x7) * 0.01;

    if (score > bestScore) {
      bestScore = score;
      best = spec;
    }
  });

  notes.push(
    `selected "${scene}/${best.key}" over ${specs.length - 1} alternatives (score ${bestScore.toFixed(2)})`,
  );
  return { spec: best, score: bestScore, notes };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ComposeOptions {
  /** deterministic seed — same IR + same seed ⇒ same composition */
  seed?: number;
}

/**
 * Convert per-slide scene assignments into per-slide composition plans.
 * Pure and deterministic.
 */
export function composePresentation(
  slides: SemanticSlide[],
  scenes: SceneAssignment[],
  options: ComposeOptions = {},
): PresentationComposition {
  const seed = options.seed ?? 0;
  const sceneBySlide = new Map(scenes.map((s) => [s.slideId, s]));
  const state: SelectionState = { strategyUsage: new Map() };
  const plans: CompositionPlan[] = [];

  for (const slide of slides) {
    const assignment = sceneBySlide.get(slide.id);
    // Fallback keeps the composer total even if a slide was not classified.
    const scene: SceneId = assignment?.scene ?? "hero";
    const variantId = assignment?.variant.id ?? `${scene}/default`;
    const content = readContent(slide);

    const { spec, notes } = selectStrategy(
      slide,
      scene,
      content,
      state,
      seed,
    );
    const plan = buildPlan(slide, scene, variantId, spec, content);
    plan.rationale.push(...notes);

    plans.push(plan);
    state.prev = plan;
    state.strategyUsage.set(
      plan.strategyId,
      (state.strategyUsage.get(plan.strategyId) ?? 0) + 1,
    );
  }

  return { plans, seed };
}

export { buildPlan, getStrategies, readContent } from "./strategies";
export { SCENE_STRATEGIES } from "./strategies";
export type {
  CompositionPlan,
  PresentationComposition,
  CompositionZone,
} from "./types";
