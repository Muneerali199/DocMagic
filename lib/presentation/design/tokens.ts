/**
 * Centralized design token system.
 *
 * Single source of truth for every visual value in the pipeline.
 * No engine or compiler target may hardcode spacing, type, color, radius,
 * shadow, or grid values — everything resolves through a DesignTokens object
 * composed by the Design Engine from a Design Language.
 */

export interface TypeScaleStep {
  size: number;
  weight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface TypographyTokens {
  headingFamily: string;
  bodyFamily: string;
  monoFamily: string;
  scale: {
    display: TypeScaleStep; // hero titles
    title: TypeScaleStep; // slide titles
    subtitle: TypeScaleStep;
    heading: TypeScaleStep; // section headings within slide
    body: TypeScaleStep;
    bullet: TypeScaleStep;
    caption: TypeScaleStep;
    label: TypeScaleStep;
    kicker: TypeScaleStep; // small uppercase eyebrow text
    metricValue: TypeScaleStep;
    code: TypeScaleStep;
  };
}

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  border: string;
  chartPalette: string[]; // 3-5 colors max
  positive: string;
  negative: string;
}

export interface SpacingTokens {
  /** base unit in px; all spacing = multiples of this */
  unit: number;
  /** outer safe margin of the slide canvas */
  safeMargin: number;
  /** gap between major regions (e.g. title block and content) */
  sectionGap: number;
  /** gap between sibling items (cards, columns, bullets) */
  itemGap: number;
  /** internal padding of cards/callouts */
  cardPadding: number;
}

export interface ShapeTokens {
  radius: number;
  radiusLg: number;
  borderWidth: number;
  shadow: "none" | "sm" | "md" | "lg";
}

export interface GridTokens {
  columns: number;
  gutter: number;
}

export interface IconographyTokens {
  size: number;
  sizeLg: number;
  strokeWidth: number;
  style: "outline" | "solid";
}

export interface IllustrationTokens {
  /** preferred image treatment for this language */
  treatment: "photo" | "duotone" | "geometric" | "none";
  overlayOpacity: number;
}

export interface MotionTokens {
  /** reserved for future animation planning pass */
  duration: number;
  easing: string;
  entrance: "none" | "fade" | "rise";
}

export interface DesignTokens {
  typography: TypographyTokens;
  colors: ColorTokens;
  spacing: SpacingTokens;
  shape: ShapeTokens;
  grid: GridTokens;
  iconography: IconographyTokens;
  illustration: IllustrationTokens;
  motion: MotionTokens;
}

/** Spacing helper: n spacing units in px. */
export function space(tokens: DesignTokens, n: number): number {
  return tokens.spacing.unit * n;
}

/** Resolve a type scale step by text role. */
export function typeStepForRole(
  tokens: DesignTokens,
  role:
    | "title"
    | "subtitle"
    | "heading"
    | "body"
    | "bullet"
    | "caption"
    | "label"
    | "kicker",
  slideType?: string,
): TypeScaleStep {
  if (role === "title" && slideType === "hero")
    return tokens.typography.scale.display;
  return tokens.typography.scale[role];
}
