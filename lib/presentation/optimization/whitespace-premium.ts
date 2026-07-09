/**
 * Premium Whitespace & Breath Optimization Pass
 *
 * Ensures optimal whitespace distribution, visual breathing room, and
 * prevents content clustering. Adjusts element positioning and sizes to
 * maximize aesthetic impact per slide type.
 */

import type { ResolvedIR, ResolvedSlide, ResolvedElement } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { OptimizationPassPlugin } from "../plugins/types";

interface ElementGroup {
  topmost: number;
  bottommost: number;
  elements: ResolvedElement[];
}

function analyzeContentGrouping(slide: ResolvedSlide): ElementGroup[] {
  const groups: ElementGroup[] = [];
  const sorted = [...slide.elements].sort((a, b) => a.frame.y - b.frame.y);

  let current: ElementGroup | null = null;
  const gapThreshold = 30; // pixels

  for (const el of sorted) {
    if (!current) {
      current = {
        topmost: el.frame.y,
        bottommost: el.frame.y + el.frame.h,
        elements: [el],
      };
    } else if (el.frame.y - current.bottommost < gapThreshold) {
      // Element is close to the group; add it
      current.elements.push(el);
      current.bottommost = Math.max(
        current.bottommost,
        el.frame.y + el.frame.h,
      );
    } else {
      // Gap found; start a new group
      groups.push(current);
      current = {
        topmost: el.frame.y,
        bottommost: el.frame.y + el.frame.h,
        elements: [el],
      };
    }
  }
  if (current) groups.push(current);

  return groups;
}

/**
 * Redistribute content groups vertically to maximize whitespace on hero,
 * quote, and section slides.
 */
function optimizeGroupSpacing(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  if (
    slide.type !== "hero" &&
    slide.type !== "quote" &&
    slide.type !== "section"
  ) {
    return slide; // no optimization for content slides
  }

  const groups = analyzeContentGrouping(slide);
  if (groups.length < 2) return slide; // nothing to optimize

  const safe = tokens.spacing.safeMargin;
  const totalH = 720 - safe * 2;
  const contentH = groups.reduce(
    (sum, g) => sum + (g.bottommost - g.topmost),
    0,
  );
  const availableSpace = totalH - contentH;
  const gaps = groups.length - 1;
  const gapSize = Math.floor(availableSpace / (gaps + 1)); // even spacing

  let currentY = safe + gapSize;
  const adjusted = slide.elements.map((el) => {
    const group = groups.find((g) => g.elements.includes(el));
    if (!group) return el;

    const groupStartY = currentY;
    const offsetInGroup = el.frame.y - group.topmost;
    const newY = groupStartY + offsetInGroup;

    // Only update Y on the first element in the group (hack to avoid recalc)
    if (el === group.elements[0]) {
      currentY = groupStartY + (group.bottommost - group.topmost) + gapSize;
    }

    return {
      ...el,
      frame: { ...el.frame, y: newY },
    };
  });

  return { ...slide, elements: adjusted };
}

/**
 * Content slides: if the body content leaves a large dead band at the
 * bottom of the canvas, shift the content block (everything below the
 * title zone) down so top/bottom whitespace reads as balanced. The title
 * stays anchored — designers keep the headline at a consistent height.
 * Pure vertical translation: never touches x, w, h, or relative spacing.
 */
function rebalanceContentBlock(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  if (
    slide.type === "hero" ||
    slide.type === "quote" ||
    slide.type === "section"
  ) {
    return slide; // handled by optimizeGroupSpacing
  }

  const TITLE_ZONE = 190; // y below which elements are part of the header
  const FOOTER_CLEAR = 720 - 72; // keep clear of the craft footer band
  const body = slide.elements.filter((el) => el.frame.y >= TITLE_ZONE);
  if (body.length === 0) return slide;

  const top = Math.min(...body.map((el) => el.frame.y));
  const bottom = Math.max(...body.map((el) => el.frame.y + el.frame.h));
  const bottomSpace = FOOTER_CLEAR - bottom;
  const topSpace = top - TITLE_ZONE;
  // only act on clearly top-heavy slides
  if (bottomSpace - topSpace < 96) return slide;

  const shift = Math.min(Math.floor((bottomSpace - topSpace) / 2), 110);
  if (shift <= 0) return slide;

  return {
    ...slide,
    elements: slide.elements.map((el) =>
      el.frame.y >= TITLE_ZONE
        ? { ...el, frame: { ...el.frame, y: el.frame.y + shift } }
        : el,
    ),
  };
}

// NOTE: an earlier version of this pass also "expanded" cards and nudged
// x positions to enforce breathing room. Both mutations second-guessed the
// deterministic layout engine's exact grid math and corrupted column
// alignment (uneven gaps, squashed titles). Horizontal geometry is now
// owned exclusively by the layout engine; this pass only redistributes
// vertical whitespace (even group spacing on sparse editorial slides,
// balanced content blocks on top-heavy content slides).

export const premiumWhitespacePass: OptimizationPassPlugin = {
  id: "premium.whitespace-breathing",
  kind: "optimization-pass",
  name: "Premium Whitespace & Breathing",
  order: 305,
  run: (ir, tokens) => ({
    ...ir,
    slides: ir.slides
      .map((slide) => optimizeGroupSpacing(slide, tokens))
      .map((slide) => rebalanceContentBlock(slide, tokens)),
  }),
};
