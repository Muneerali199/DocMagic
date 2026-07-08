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

  // 1. slide type affinity (strong signal)
  if (layout.suitedTypes.includes(slide.type)) score += 25;
  else if (layout.suitedTypes.includes("content")) score += 8;

  // 2. content capacity fit (elastic penalty)
  const n = slide.elements.length;
  const inRange =
    n >= meta.contentCapacity.min && n <= meta.contentCapacity.max;
  if (inRange) score += 12;
  else {
    const distFromRange = Math.min(
      Math.abs(n - meta.contentCapacity.min),
      Math.abs(n - meta.contentCapacity.max),
    );
    score -= distFromRange * 2.5;
  }

  // 3. element mix vs layout emphasis (nuanced scoring)
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

  const emphasismatch = {
    text: textCount,
    media: mediaCount,
    data: dataCount,
    structure: structureCount,
    balanced: 1,
  };

  if (meta.emphasis === dominant) score += 16;
  else if (meta.emphasis === "balanced") {
    score += 10; // balanced layouts are forgiving
  } else if (emphasismatch[meta.emphasis as keyof typeof emphasismatch] > 0) {
    score += 6; // partial match
  }

  // 4. media availability vs image ratio fit
  if (meta.imageRatio > 0.3 && mediaCount === 0) score -= 18; // needs media
  if (meta.imageRatio === 0 && mediaCount > 1) score -= 8; // too much media
  if (meta.imageRatio > 0.2 && mediaCount > 0) score += 4; // media bonus

  // 5. content volume vs density (sophisticated fit)
  const volume = contentVolume(slide);
  const volumeNorm = Math.min(1, volume / 900);
  const densityDiff = Math.abs(volumeNorm - meta.density);
  score -= densityDiff * 10; // increased penalty for mismatch

  // 6. whitespace preference for certain slide types
  if (
    (slide.type === "hero" ||
      slide.type === "quote" ||
      slide.type === "section") &&
    meta.whitespace >= 0.5
  ) {
    score += 8;
  }

  // 7. visual rhythm bonus for premium variants
  if (layout.id.includes("premium")) {
    score += 3; // prefer premium variants when scores are close
  }

  // 8. structure match bonus
  if (structureCount > 0 && meta.emphasis === "structure") score += 6;

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
