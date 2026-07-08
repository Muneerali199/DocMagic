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

export function composeDeck(
  slides: SemanticSlide[],
  tokens: DesignTokens,
): ComposedSlide[] {
  const composed: ComposedSlide[] = [];
  const usage = new Map<string, number>();

  slides.forEach((slide, i) => {
    const ranked = rankLayouts(slide);
    const prev = composed[i - 1];
    const prev2 = composed[i - 2];

    let bestIdx = 0;
    let bestFinal = Number.NEGATIVE_INFINITY;

    ranked.forEach((cand, idx) => {
      // Never let composition pressure push a slide onto a structurally
      // wrong layout: only the top candidates within a sane score band
      // are eligible for substitution.
      if (idx > 0 && ranked[0].score - cand.score > 18) return;

      let final = cand.score;

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
