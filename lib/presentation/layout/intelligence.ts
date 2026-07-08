/**
 * Layout Intelligence — deterministic semantic layout selection.
 *
 * Scores every layout in the Layout Library against a slide's semantics
 * (slide type, element mix, content volume, emphasis) and returns the
 * best fit. Same slide always selects the same layout.
 */

import type { SemanticSlide } from "../ir/schema";
import {
  LAYOUT_LIBRARY,
  categorize,
  type SlideLayout,
  type LayoutResult,
} from "./library";
import type { DesignTokens } from "../design/tokens";

export interface LayoutSelection {
  layout: SlideLayout;
  score: number;
  result: LayoutResult;
}

function contentVolume(slide: SemanticSlide): number {
  let chars = 0;
  for (const el of slide.elements) {
    if (el.kind === "text") {
      chars += el.content.length + (el.items?.join("").length ?? 0);
    }
  }
  return chars;
}

export function scoreLayout(layout: SlideLayout, slide: SemanticSlide): number {
  const c = categorize(slide);
  const meta = layout.metadata;
  let score = 0;

  // 1. slide type affinity
  if (layout.suitedTypes.includes(slide.type)) score += 20;
  else if (layout.suitedTypes.includes("content")) score += 4;

  // 2. content capacity fit
  const n = slide.elements.length;
  if (n >= meta.contentCapacity.min && n <= meta.contentCapacity.max)
    score += 10;
  else
    score -=
      Math.abs(
        n -
          (n < meta.contentCapacity.min
            ? meta.contentCapacity.min
            : meta.contentCapacity.max),
      ) * 3;

  // 3. emphasis match against element mix
  const mediaCount = c.media.length;
  const dataCount = c.metrics.length + c.charts.length + c.tables.length;
  const structureCount = c.diagrams.length;
  const textCount = c.texts.length + (c.title ? 1 : 0) + (c.subtitle ? 1 : 0);

  const dominant =
    structureCount > 0 && structureCount >= dataCount
      ? "structure"
      : dataCount > Math.max(mediaCount, textCount / 2)
        ? "data"
        : mediaCount > 1 || (mediaCount === 1 && textCount <= 2)
          ? "media"
          : "text";

  if (meta.emphasis === dominant) score += 12;
  else if (meta.emphasis === "balanced") score += 6;

  // 4. media availability vs image ratio
  if (meta.imageRatio > 0.3 && mediaCount === 0) score -= 15;
  if (meta.imageRatio === 0 && mediaCount > 1) score -= 6;

  // 5. content volume vs density
  const volume = contentVolume(slide);
  const volumeNorm = Math.min(1, volume / 900);
  score -= Math.abs(volumeNorm - meta.density) * 8;

  // 6. hero/quote/section slides deserve whitespace
  if (
    (slide.type === "hero" ||
      slide.type === "quote" ||
      slide.type === "section") &&
    meta.whitespace >= 0.6
  ) {
    score += 6;
  }

  return score;
}

export function selectLayout(
  slide: SemanticSlide,
  tokens: DesignTokens,
): LayoutSelection {
  let best: SlideLayout = LAYOUT_LIBRARY[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const layout of LAYOUT_LIBRARY) {
    const s = scoreLayout(layout, slide);
    if (s > bestScore) {
      best = layout;
      bestScore = s;
    }
  }
  return { layout: best, score: bestScore, result: best.place(slide, tokens) };
}
