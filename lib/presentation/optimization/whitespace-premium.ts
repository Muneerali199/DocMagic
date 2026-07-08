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
      current.bottommost = Math.max(current.bottommost, el.frame.y + el.frame.h);
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
  const contentH = groups.reduce((sum, g) => sum + (g.bottommost - g.topmost), 0);
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
 * Expand content cards to fill available whitespace while respecting
 * proportions (for dashboard, content, kpi slides).
 */
function expandContentCards(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  if (!["dashboard", "kpi", "content"].includes(slide.type)) return slide;

  const safe = tokens.spacing.safeMargin;
  const canvasW = 1280 - safe * 2;
  const canvasH = 720 - safe * 2;

  // Find columns of elements and expand them proportionally
  const elementsByX = new Map<number, ResolvedElement[]>();
  for (const el of slide.elements) {
    const keyX = Math.round(el.frame.x / 50) * 50; // bucket by rough position
    if (!elementsByX.has(keyX)) elementsByX.set(keyX, []);
    elementsByX.get(keyX)!.push(el);
  }

  const columnCount = elementsByX.size;
  if (columnCount <= 1) return slide; // single column or scattered

  const allocatedW = (canvasW - tokens.spacing.itemGap * (columnCount - 1)) / columnCount;

  let colIndex = 0;
  const adjusted = slide.elements.map((el) => {
    const bucket = Math.round((el.frame.x - safe) / (allocatedW + tokens.spacing.itemGap));
    const newX = safe + bucket * (allocatedW + tokens.spacing.itemGap);
    const newW = Math.min(el.frame.w + 10, allocatedW); // mild expansion

    return {
      ...el,
      frame: { ...el.frame, x: newX, w: newW },
    };
  });

  return { ...slide, elements: adjusted };
}

/**
 * Ensure minimum breathing room around groups of elements
 * (visual padding from edges and peers).
 */
function enforceBreathingRoom(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  const safe = tokens.spacing.safeMargin;
  const minBreathing = tokens.spacing.unit * 3;

  return {
    ...slide,
    elements: slide.elements.map((el) => {
      // Ensure distance from edges
      const frame = el.frame;
      if (frame.x - safe < minBreathing && frame.x > safe) {
        return {
          ...el,
          frame: { ...frame, x: safe + minBreathing },
        };
      }
      if (frame.x + frame.w + safe > 1280 - minBreathing && frame.x + frame.w < 1280 - safe) {
        return {
          ...el,
          frame: { ...frame, x: 1280 - safe - minBreathing - frame.w },
        };
      }
      return el;
    }),
  };
}

export const premiumWhitespacePass: OptimizationPassPlugin = {
  id: "premium.whitespace-breathing",
  kind: "optimization-pass",
  name: "Premium Whitespace & Breathing",
  order: 305,
  run: (ir, tokens) => ({
    ...ir,
    slides: ir.slides
      .map((slide) => optimizeGroupSpacing(slide, tokens))
      .map((slide) => expandContentCards(slide, tokens))
      .map((slide) => enforceBreathingRoom(slide, tokens)),
  }),
};
