/**
 * Visual Composition Engine — deck-level layout direction.
 *
 * The per-slide Layout Intelligence picks the best layout for one slide in
 * isolation. Real designers compose across the whole deck: no two adjacent
 * slides share a structure, visual rhythm alternates (grid → asymmetric →
 * columns), and every slide keeps a single focal point. This engine takes
 * the ranked layout candidates per slide and performs a sequential,
 * deterministic selection with deck-level penalties:
 *
 *   - hard anti-repetition: the previous slide's layout is heavily penalized
 *   - decay repetition: layouts used anywhere earlier accrue a reuse penalty
 *   - rhythm alternation: repeating the previous slide's visualRhythm costs
 *   - emphasis variety: three same-emphasis slides in a row costs
 *
 * Same Semantic IR always yields the same composition. No LLM, no RNG.
 */

import type { SemanticSlide } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import { rankLayouts } from "./intelligence";
import type { SlideLayout, LayoutResult } from "./library";
import type { SceneAssignment } from "../scene/types";
import type { CompositionPlan, CompositionRhythm } from "../composer/types";

export interface ComposedSlide {
  slide: SemanticSlide;
  layout: SlideLayout;
  result: LayoutResult;
  /** raw semantic score before deck-level adjustments */
  baseScore: number;
  /** final score after composition penalties */
  finalScore: number;
}

/** Penalty weights — tuned so semantics still dominate obviously-bad swaps. */
const PENALTY = {
  /** layout identical to the immediately previous slide */
  adjacentRepeat: 22,
  /** layout used two slides ago */
  nearRepeat: 10,
  /** each additional use of a layout anywhere earlier in the deck */
  reuse: 5,
  /** same visualRhythm as the previous slide */
  rhythmRepeat: 7,
  /** third consecutive slide with the same emphasis */
  emphasisRun: 6,
} as const;

/** Slide types where structure is dictated by content, not variety. */
const EXEMPT_TYPES = new Set(["hero", "section", "quote"]);

/**
 * Scene affinity bonus — when the Scene Composition Engine has assigned a
 * composition variant to a slide, layouts that harmonize with the variant's
 * semantic direction (rhythm, emphasis, whitespace, hierarchy) get a small
 * deterministic bonus. Semantics still dominate: the bonus never outweighs
 * a structurally-wrong layout's deficit.
 */
function sceneAffinity(
  layout: SlideLayout,
  assignment: SceneAssignment | undefined,
): number {
  if (!assignment) return 0;
  const v = assignment.variant;
  const meta = layout.metadata;
  let bonus = 0;
  if (meta.visualRhythm === v.rhythmAffinity) bonus += 8;
  if (meta.emphasis === v.emphasisAffinity) bonus += 6;
  bonus += Math.max(0, 5 - Math.abs(meta.whitespace - v.whitespace) * 10);
  bonus += Math.max(0, 4 - Math.abs(meta.hierarchy - v.hierarchy) * 8);
  return bonus;
}

/** Map the Composer's richer rhythm vocabulary onto layout metadata rhythm. */
const RHYTHM_MAP: Record<CompositionRhythm, LayoutMetadata["visualRhythm"]> = {
  "single-focus": "single-focus",
  split: "asymmetric",
  columns: "columns",
  grid: "grid",
  flow: "flow",
  stacked: "single-focus",
  asymmetric: "asymmetric",
  radial: "asymmetric",
};

const FOCAL_EMPHASIS: Record<string, LayoutMetadata["emphasis"]> = {
  statement: "text",
  narrative: "text",
  media: "media",
  data: "data",
  structure: "structure",
};

/**
 * Composition affinity — the Layout Engine's consumption of the Presentation
 * Composer's intent. The Composer never emits coordinates; instead it states
 * WHAT the slide should look like structurally (focal, split, rhythm,
 * hierarchy, whitespace, emphasis). This function rewards layouts that realise
 * that intent and — crucially — penalises the generic "grid of cards" when the
 * composition calls for a focal, split, or flowing structure. Bounds are kept
 * modest so a structurally-wrong layout can never win on affinity alone.
 */
function compositionAffinity(
  layout: SlideLayout,
  plan: CompositionPlan | undefined,
): number {
  if (!plan) return 0;
  const meta = layout.metadata;
  const wantRhythm = RHYTHM_MAP[plan.visualRhythm];
  const wantEmphasis = FOCAL_EMPHASIS[plan.focal] ?? "balanced";
  let bonus = 0;

  if (meta.visualRhythm === wantRhythm) bonus += 8;
  if (meta.emphasis === wantEmphasis) bonus += 6;
  bonus += Math.max(0, 5 - Math.abs(meta.whitespace - plan.whitespaceDensity) * 10);
  bonus += Math.max(0, 4 - Math.abs(meta.hierarchy - plan.hierarchyLevel) * 8);
  bonus += Math.max(0, 3 - Math.abs(meta.imageRatio - plan.imagePriority) * 6);

  // Break up "grids of reusable cards": if the composition wants a focal,
  // split, flowing or radial structure, a uniform grid is actively wrong.
  if (plan.visualRhythm !== "grid" && meta.visualRhythm === "grid") bonus -= 9;

  // Reserve space for diagrams — never funnel structural content into a grid.
  if (plan.diagramPriority >= 0.6) {
    if (meta.emphasis === "structure") bonus += 6;
    if (meta.visualRhythm === "grid") bonus -= 6;
  }

  // Dominant-metric intent wants a strong hierarchy, not equal-size cards.
  if (
    plan.metricEmphasis === "dominant-one" ||
    plan.metricEmphasis === "hero-plus-support"
  ) {
    if (meta.hierarchy >= 0.7) bonus += 5;
    if (meta.visualRhythm === "grid") bonus -= 5;
  }

  // True comparison compositions favour asymmetric/column structure.
  if (
    plan.comparisonStyle === "winner-loser" ||
    plan.comparisonStyle === "before-after" ||
    plan.comparisonStyle === "versus"
  ) {
    if (meta.visualRhythm === "asymmetric" || meta.visualRhythm === "columns")
      bonus += 5;
    if (meta.hierarchy >= 0.6 && plan.comparisonStyle === "winner-loser")
      bonus += 3;
  }

  return bonus;
}

export function composeDeck(
  slides: SemanticSlide[],
  tokens: DesignTokens,
  scenes?: SceneAssignment[],
  plans?: CompositionPlan[],
): ComposedSlide[] {
  const composed: ComposedSlide[] = [];
  const usage = new Map<string, number>();

  slides.forEach((slide, i) => {
    const ranked = rankLayouts(slide);
    const prev = composed[i - 1];
    const prev2 = composed[i - 2];
    const assignment = scenes?.find((s) => s.slideId === slide.id);
    const plan = plans?.find((p) => p.slideId === slide.id);

    let bestIdx = 0;
    let bestFinal = Number.NEGATIVE_INFINITY;

    ranked.forEach((cand, idx) => {
      // Never let composition pressure push a slide onto a structurally
      // wrong layout: only the top candidates within a sane score band
      // are eligible for substitution.
      if (idx > 0 && ranked[0].score - cand.score > 18) return;

      // Prefer the richer Presentation Composer intent when available;
      // fall back to the coarser scene-variant affinity otherwise.
      const affinity = plan
        ? compositionAffinity(cand.layout, plan)
        : sceneAffinity(cand.layout, assignment);
      let final = cand.score + affinity;

      if (!EXEMPT_TYPES.has(slide.type)) {
        if (prev && cand.layout.id === prev.layout.id)
          final -= PENALTY.adjacentRepeat;
        if (prev2 && cand.layout.id === prev2.layout.id)
          final -= PENALTY.nearRepeat;
        final -= (usage.get(cand.layout.id) ?? 0) * PENALTY.reuse;

        if (
          prev &&
          cand.layout.metadata.visualRhythm ===
            prev.layout.metadata.visualRhythm
        )
          final -= PENALTY.rhythmRepeat;

        if (
          prev &&
          prev2 &&
          cand.layout.metadata.emphasis === prev.layout.metadata.emphasis &&
          cand.layout.metadata.emphasis === prev2.layout.metadata.emphasis
        )
          final -= PENALTY.emphasisRun;
      }

      if (final > bestFinal) {
        bestFinal = final;
        bestIdx = idx;
      }
    });

    const chosen = ranked[bestIdx];
    usage.set(chosen.layout.id, (usage.get(chosen.layout.id) ?? 0) + 1);
    composed.push({
      slide,
      layout: chosen.layout,
      result: chosen.layout.place(slide, tokens),
      baseScore: chosen.score,
      finalScore: bestFinal,
    });
  });

  return composed;
}
