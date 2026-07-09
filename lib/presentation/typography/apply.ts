/**
 * Typography application — resolves design-token type scale into concrete
 * ResolvedTextStyle values. All font values flow from the DesignTokens;
 * nothing is hardcoded here.
 */

import type {
  Emphasis,
  ResolvedTextStyle,
  SlideType,
  TextRole,
} from "../ir/schema";
import type { DesignTokens, TypeScaleStep } from "../design/tokens";
import { readableTextColor } from "../color/engine";

function stepFor(
  role: TextRole,
  tokens: DesignTokens,
  slideType?: SlideType,
): TypeScaleStep {
  const s = tokens.typography.scale;
  switch (role) {
    case "title":
      return slideType === "hero" ||
        slideType === "section" ||
        slideType === "closing"
        ? s.display
        : s.title;
    case "subtitle":
      return s.subtitle;
    case "heading":
      return s.heading;
    case "body":
      return s.body;
    case "bullet":
      return s.bullet;
    case "caption":
      return s.caption;
    case "label":
      return s.label;
    case "kicker":
      return s.kicker;
  }
}

function familyFor(role: TextRole, tokens: DesignTokens): string {
  return role === "title" ||
    role === "subtitle" ||
    role === "heading" ||
    role === "kicker"
    ? tokens.typography.headingFamily
    : tokens.typography.bodyFamily;
}

export function resolveTextStyle(
  role: TextRole,
  emphasis: Emphasis,
  tokens: DesignTokens,
  options?: {
    slideType?: SlideType;
    background?: string;
    align?: "left" | "center" | "right";
  },
): ResolvedTextStyle {
  const step = stepFor(role, tokens, options?.slideType);
  const background = options?.background ?? tokens.colors.background;

  const preferredColor =
    role === "kicker"
      ? tokens.colors.accent
      : emphasis === "tertiary" ||
          role === "caption" ||
          role === "label" ||
          role === "subtitle"
        ? tokens.colors.mutedForeground
        : tokens.colors.foreground;

  const largeText = step.size >= 24;
  return {
    fontFamily: familyFor(role, tokens),
    fontSize: step.size,
    fontWeight: step.weight,
    lineHeight: step.lineHeight,
    letterSpacing: step.letterSpacing,
    color: readableTextColor(
      preferredColor,
      background,
      tokens.colors,
      largeText,
    ),
    align: options?.align ?? "left",
    textTransform: role === "kicker" ? "uppercase" : "none",
  };
}

/** Style for text sitting on a specific fill (cards, diagram nodes, callouts). */
export function styleOnFill(
  base: ResolvedTextStyle,
  fill: string,
  tokens: DesignTokens,
): ResolvedTextStyle {
  return {
    ...base,
    color: readableTextColor(
      base.color,
      fill,
      tokens.colors,
      base.fontSize >= 24,
    ),
  };
}
