/**
 * Text measurement — deterministic estimation used by the Constraint Solver
 * and Optimization Pipeline for fit calculations. Runs on server and client
 * (no canvas/DOM dependency).
 */

import type { ResolvedTextStyle } from "../ir/schema";

/** Average glyph width as a fraction of font size, per weight bucket. */
function avgCharWidthFactor(fontWeight: number, fontFamily: string): number {
  const mono = /mono/i.test(fontFamily);
  if (mono) return 0.62;
  if (fontWeight >= 700) return 0.56;
  if (fontWeight >= 600) return 0.54;
  return 0.52;
}

export interface TextMetrics {
  lines: number;
  height: number;
  /** widest line width estimate in px */
  width: number;
}

/** Estimate wrapped line count for a string in a given width. */
export function estimateLines(
  text: string,
  style: Pick<ResolvedTextStyle, "fontSize" | "fontWeight" | "fontFamily">,
  maxWidth: number,
): number {
  if (!text) return 0;
  const charW =
    style.fontSize * avgCharWidthFactor(style.fontWeight, style.fontFamily);
  const charsPerLine = Math.max(1, Math.floor(maxWidth / charW));
  // account for word wrap inefficiency (~8%)
  const effective = Math.max(1, Math.floor(charsPerLine * 0.92));
  let lines = 0;
  for (const paragraph of text.split("\n")) {
    lines += Math.max(1, Math.ceil(paragraph.length / effective));
  }
  return lines;
}

/** Estimate rendered metrics of a text block (content + optional bullet items). */
export function measureText(
  content: string,
  items: string[] | undefined,
  style: ResolvedTextStyle,
  maxWidth: number,
): TextMetrics {
  const lineH = style.fontSize * style.lineHeight;
  let lines = estimateLines(content, style, maxWidth);
  if (items && items.length > 0) {
    // bullets have a marker indent
    const bulletWidth = maxWidth - style.fontSize * 1.4;
    for (const item of items) {
      lines += estimateLines(item, style, bulletWidth);
    }
    // spacing between bullets: ~35% of a line each
    lines += items.length * 0.35;
  }
  const charW =
    style.fontSize * avgCharWidthFactor(style.fontWeight, style.fontFamily);
  const longest = [content, ...(items ?? [])].reduce(
    (max, s) => Math.max(max, ...s.split("\n").map((l) => l.length)),
    0,
  );
  return {
    lines: Math.ceil(lines),
    height: Math.ceil(lines * lineH),
    width: Math.min(maxWidth, Math.ceil(longest * charW)),
  };
}
