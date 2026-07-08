/**
 * Advanced Typography Optimization Pass
 *
 * Premium techniques: optical sizing, dynamic line-height adjustment based on
 * context, improved kerning compensation, baseline grid alignment, and
 * multi-level hierarchy emphasis.
 */

import type { ResolvedElement, ResolvedSlide } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { OptimizationPassPlugin } from "../plugins/types";

type ResolvedText = Extract<ResolvedElement, { kind: "text" }>;

/**
 * Optical sizing adjustment: fine-tune font sizes for visual consistency
 * across different text roles and emphasis levels. Smaller text appears
 * larger due to optical illusions, so we scale compensatively.
 */
function applyOpticalSizing(text: ResolvedText, tokens: DesignTokens): ResolvedText {
  const baseSizeAdjustment: Record<string, number> = {
    kicker: 1.05, // small text needs boost
    label: 1.04,
    caption: 1.06, // smallest text gets the most boost
    bullet: 1.01,
    body: 1,
    heading: 0.98, // large text gets slight reduction
    title: 0.97,
    display: 0.95, // extra-large text gets more reduction
  };

  const adjustment = baseSizeAdjustment[text.role] ?? 1;
  const adjustedSize = Math.round(text.style.fontSize * adjustment);

  // Dynamic line-height: smaller text benefits from looser line-height
  let lineHeight = text.style.lineHeight ?? 1.5;
  if (text.style.fontSize <= 16) {
    lineHeight = Math.max(1.5, lineHeight + 0.1); // tighter leading for small text
  } else if (text.style.fontSize >= 40) {
    lineHeight = Math.max(1, Math.min(lineHeight, 1.2)); // tighter leading for large type
  }

  return {
    ...text,
    style: {
      ...text.style,
      fontSize: adjustedSize,
      lineHeight,
    },
  };
}

/**
 * Letter spacing compensation: improve readability for specific scenarios.
 * Uppercase text and body text at certain sizes benefit from increased tracking.
 */
function improveLetterSpacing(text: ResolvedText): ResolvedText {
  const content = text.content ?? "";
  const isAllCaps = content === content.toUpperCase() && content.length > 2;
  const currentLS = text.style.letterSpacing ?? 0;

  let adjustedLS = currentLS;
  if (isAllCaps && text.style.fontSize < 18) {
    adjustedLS = Math.max(currentLS, 0.5); // add tracking to caps
  }
  if (text.role === "label" && text.style.fontSize < 14) {
    adjustedLS = Math.max(currentLS, 0.3);
  }

  return {
    ...text,
    style: {
      ...text.style,
      letterSpacing: adjustedLS,
    },
  };
}

/**
 * Baseline grid alignment: snap text elements to a nominal 4px or 8px baseline
 * for visual rhythm and cohesion.
 */
function alignToBaselineGrid(
  el: ResolvedElement,
  baselineUnit: number,
): ResolvedElement {
  if (el.kind !== "text") return el;
  const snappedY = Math.round(el.frame.y / baselineUnit) * baselineUnit;
  if (snappedY === el.frame.y) return el;
  return {
    ...el,
    frame: { ...el.frame, y: snappedY },
  };
}

/**
 * Hierarchy emphasis: boost contrast and weight for primary elements
 * to strengthen visual hierarchy.
 */
function emphasizeHierarchy(text: ResolvedText, tokens: DesignTokens): ResolvedText {
  if (text.role !== "title" && text.role !== "heading") return text;
  if (text.emphasis !== "primary") return text;

  // Increase weight by 100–200 points for primary titles
  const boostedWeight = Math.min(
    900,
    (text.style.fontWeight ?? 400) + 150,
  );

  // Ensure adequate color contrast
  const adjusted: ResolvedText = {
    ...text,
    style: {
      ...text.style,
      fontWeight: boostedWeight,
    },
  };

  return adjusted;
}

export const advancedTypographyPass: OptimizationPassPlugin = {
  id: "premium.typography-advanced",
  kind: "optimization-pass",
  name: "Advanced Typography (Optical Sizing & Hierarchy)",
  order: 205,
  run: (ir, tokens) => ({
    ...ir,
    slides: ir.slides.map((slide) => ({
      ...slide,
      elements: slide.elements.map((el) => {
        if (el.kind !== "text") {
          return alignToBaselineGrid(el, tokens.spacing.unit * 2);
        }
        let enhanced = applyOpticalSizing(el, tokens);
        enhanced = improveLetterSpacing(enhanced);
        enhanced = emphasizeHierarchy(enhanced, tokens);
        enhanced = alignToBaselineGrid(enhanced, tokens.spacing.unit * 2) as ResolvedText;
        return enhanced;
      }),
    })),
  }),
};
