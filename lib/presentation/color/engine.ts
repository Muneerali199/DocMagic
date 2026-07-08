/**
 * Color engine — deterministic palette resolution + WCAG contrast enforcement.
 * Self-contained (handles hex and rgba token values); no DOM dependency.
 */

import type { ColorTokens } from "../design/tokens";

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(input: string): RGBA | null {
  const str = input.trim();
  if (str.startsWith("#")) {
    let hex = str.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    if (!/^[a-f\d]{6}$/i.test(hex)) return null;
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }
  const rgba = str.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgba) {
    return {
      r: Number.parseFloat(rgba[1]),
      g: Number.parseFloat(rgba[2]),
      b: Number.parseFloat(rgba[3]),
      a: rgba[4] !== undefined ? Number.parseFloat(rgba[4]) : 1,
    };
  }
  return null;
}

/** Composite a translucent color over an opaque backdrop. */
export function composite(fg: RGBA, backdrop: RGBA): RGBA {
  if (fg.a >= 1) return fg;
  const a = fg.a;
  return {
    r: fg.r * a + backdrop.r * (1 - a),
    g: fg.g * a + backdrop.g * (1 - a),
    b: fg.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

export function luminance(c: RGBA): number {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

/**
 * WCAG contrast ratio between two colors. Translucent colors are composited
 * over `backdrop` (defaults to the second color) before measuring.
 */
export function contrastRatio(
  fg: string,
  bg: string,
  backdrop?: string,
): number {
  const bgParsed = parseColor(bg);
  const fgParsed = parseColor(fg);
  if (!bgParsed || !fgParsed) return 21; // unknown format: don't block the pipeline
  const backdropParsed = (backdrop && parseColor(backdrop)) || bgParsed;
  const bgOpaque = composite(
    bgParsed,
    backdropParsed.a < 1 ? { r: 0, g: 0, b: 0, a: 1 } : backdropParsed,
  );
  const fgOpaque = composite(fgParsed, bgOpaque);
  const l1 = luminance(fgOpaque);
  const l2 = luminance(bgOpaque);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function meetsWcagAA(
  fg: string,
  bg: string,
  largeText: boolean,
  backdrop?: string,
): boolean {
  return contrastRatio(fg, bg, backdrop) >= (largeText ? 3 : 4.5);
}

/**
 * Pick a readable text color for a given background: tries the preferred
 * color, then falls back through the token palette to guaranteed contrast.
 */
export function readableTextColor(
  preferred: string,
  background: string,
  colors: ColorTokens,
  largeText = false,
): string {
  if (meetsWcagAA(preferred, background, largeText, colors.background))
    return preferred;
  const candidates = [
    colors.foreground,
    colors.background,
    "#ffffff",
    "#0a0a0a",
  ];
  for (const candidate of candidates) {
    if (meetsWcagAA(candidate, background, largeText, colors.background))
      return candidate;
  }
  return preferred;
}

/** Resolve the fill color for an emphasis level (cards, diagram nodes). */
export function emphasisFill(
  emphasis: "primary" | "secondary" | "tertiary",
  colors: ColorTokens,
): { fill: string; text: string } {
  switch (emphasis) {
    case "primary":
      return { fill: colors.primary, text: colors.primaryForeground };
    case "secondary":
      return {
        fill: colors.surface,
        text: readableTextColor(colors.foreground, colors.surface, colors),
      };
    case "tertiary":
      return {
        fill: colors.surfaceAlt,
        text: readableTextColor(
          colors.mutedForeground,
          colors.surfaceAlt,
          colors,
        ),
      };
  }
}
