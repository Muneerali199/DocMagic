/**
 * Resume text-color customization types and utilities
 * Feature #429: Post-generation resume text color and formatting controls
 */

export interface ResumeStyleColors {
  /** Name / header text color */
  headerColor: string;
  /** Section heading text color (e.g. "Work Experience", "Education") */
  sectionHeadingColor: string;
  /** Body / paragraph text color */
  bodyColor: string;
  /** Link text color */
  linkColor: string;
}

/** Default colors – matches the current hardcoded palette */
export const DEFAULT_STYLE_COLORS: ResumeStyleColors = {
  headerColor: '#1F2937',
  sectionHeadingColor: '#1F2937',
  bodyColor: '#374151',
  linkColor: '#2563EB',
};

/**
 * Calculate WCAG 2.1 relative luminance for a hex color.
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate the contrast ratio between two hex colours.
 * Returns a number ≥ 1 (higher = more contrast).
 * WCAG AA for normal text requires ≥ 4.5:1.
 */
export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check whether a foreground colour against white (#FFFFFF) background
 * passes WCAG AA for normal text (≥ 4.5:1).
 */
export function passesWCAGAA(fgHex: string, bgHex = '#FFFFFF'): boolean {
  return contrastRatio(fgHex, bgHex) >= 4.5;
}

/**
 * Return a human-readable contrast verdict.
 */
export function contrastVerdict(
  fgHex: string,
  bgHex = '#FFFFFF'
): { ratio: number; passes: boolean; label: string } {
  const ratio = contrastRatio(fgHex, bgHex);
  const passes = ratio >= 4.5;
  const label = ratio >= 7
    ? 'AAA – Excellent'
    : ratio >= 4.5
      ? 'AA – Good'
      : ratio >= 3
        ? 'AA Large – Caution'
        : 'Fail – Poor readability';
  return { ratio, passes, label };
}

/** Convert hex (#RRGGBB or #RGB) to { r, g, b } */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (sanitized.length === 3) {
    r = parseInt(sanitized[0] + sanitized[0], 16);
    g = parseInt(sanitized[1] + sanitized[1], 16);
    b = parseInt(sanitized[2] + sanitized[2], 16);
  } else if (sanitized.length === 6) {
    r = parseInt(sanitized.substring(0, 2), 16);
    g = parseInt(sanitized.substring(2, 4), 16);
    b = parseInt(sanitized.substring(4, 6), 16);
  } else {
    return null;
  }

  return { r, g, b };
}
