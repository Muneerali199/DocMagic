/**
 * Design Validation Engine — pre-export enforcement of professional design
 * rules with automatic repair. Runs on the Resolved IR after optimization
 * and BEFORE the craft layer (so intentional decorative elements added by
 * craft are never mangled, and repairs happen on real content).
 *
 * Rules enforced (each with deterministic auto-repair):
 *   1. Color contrast   — text must meet WCAG AA against the surface it
 *                         actually sits on (composited, z-aware)
 *   2. Text overflow    — estimated text height must fit its frame;
 *                         font size steps down (bounded) to fit
 *   3. Oversized bodies — paragraph blocks beyond a readable measure get
 *                         a font-size reduction
 *   4. Canvas bounds    — no element may bleed off the slide
 *   5. Alignment        — x/y positions snap to a 4px grid to kill
 *                         one-or-two-pixel misalignments
 *
 * Fully deterministic. Never throws — always returns a repaired deck plus
 * a report of what it found and fixed.
 */

import type {
  ResolvedIR,
  ResolvedSlide,
  ResolvedElement,
  Frame,
} from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import {
  parseColor,
  composite,
  contrastRatio,
  type RGBA,
} from "../color/engine";

export interface ValidationIssue {
  slideId: string;
  elementId: string;
  rule:
    | "contrast"
    | "overflow"
    | "oversized-text"
    | "out-of-bounds"
    | "alignment";
  detail: string;
  repaired: boolean;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  repairedCount: number;
}

const CANVAS_W = 1280;
const CANVAS_H = 720;
const GRID = 4;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function frameContains(outer: Frame, cx: number, cy: number): boolean {
  return (
    cx >= outer.x &&
    cx <= outer.x + outer.w &&
    cy >= outer.y &&
    cy <= outer.y + outer.h
  );
}

/**
 * Resolve the effective opaque background color under a text element:
 * the highest-z shape/image whose frame contains the text center, composited
 * over the slide background token.
 */
function backgroundUnder(
  el: ResolvedElement,
  slide: ResolvedSlide,
  tokens: DesignTokens,
): RGBA {
  const base =
    parseColor(slide.background ?? tokens.colors.background) ??
    ({ r: 255, g: 255, b: 255, a: 1 } as RGBA);
  const cx = el.frame.x + el.frame.w / 2;
  const cy = el.frame.y + el.frame.h / 2;

  let bg = base;
  let bgZ = Number.NEGATIVE_INFINITY;
  for (const other of slide.elements) {
    if (other.id === el.id) continue;
    if (other.kind !== "shape") continue;
    if ((other.z ?? 0) >= (el.z ?? 0)) continue; // only layers beneath
    if (!frameContains(other.frame, cx, cy)) continue;
    const fill = other.box?.fill ? parseColor(other.box.fill) : null;
    if (!fill) continue;
    if ((other.z ?? 0) >= bgZ) {
      bgZ = other.z ?? 0;
      bg = composite(fill, base);
    }
  }
  return bg;
}

/** RGBA → css string, since the color engine's contrastRatio takes strings */
function toCss(c: RGBA): string {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
}

/** crude but deterministic text-height estimate (content + list items) */
function estimateTextHeight(
  el: ResolvedElement & { kind: "text" },
  fontSize: number,
  lineHeight: number,
  frameW: number,
): number {
  const avgCharW = fontSize * 0.52;
  const charsPerLine = Math.max(4, Math.floor(frameW / avgCharW));
  const countLines = (s: string): number => {
    let lines = 0;
    for (const l of s.split("\n")) {
      lines += Math.max(1, Math.ceil(l.length / charsPerLine));
    }
    return lines;
  };
  let lines = el.content ? countLines(el.content) : 0;
  for (const item of el.items ?? []) lines += countLines(item);
  // list items carry extra vertical spacing between entries
  const itemSpacing = (el.items?.length ?? 0) * fontSize * 0.35;
  return lines * fontSize * lineHeight + itemSpacing;
}

/**
 * How far a text frame can grow downward before hitting another element
 * (horizontally overlapping, below) or the canvas bottom margin.
 */
function growableHeight(el: ResolvedElement, slide: ResolvedSlide): number {
  const bottom = el.frame.y + el.frame.h;
  let limit = CANVAS_H - 56; // keep clear of the craft footer band
  for (const other of slide.elements) {
    if (other.id === el.id) continue;
    if (other.id.startsWith("craft:")) continue;
    const horizOverlap =
      other.frame.x < el.frame.x + el.frame.w &&
      other.frame.x + other.frame.w > el.frame.x;
    if (!horizOverlap) continue;
    if (other.frame.y >= bottom - 2) {
      limit = Math.min(limit, other.frame.y - 16);
    }
  }
  return Math.max(0, limit - bottom);
}

// ---------------------------------------------------------------------------
// rules
// ---------------------------------------------------------------------------

function repairContrast(
  slide: ResolvedSlide,
  tokens: DesignTokens,
  issues: ValidationIssue[],
): void {
  for (const el of slide.elements) {
    if (el.kind !== "text" || !el.style?.color || !el.content) continue;
    // decorative ghost typography is intentionally low-contrast
    if (el.id.startsWith("craft:")) continue;

    const fg = parseColor(el.style.color);
    if (!fg) continue;
    const bg = backgroundUnder(el, slide, tokens);
    const fgOpaque = composite(fg, bg);
    const ratio = contrastRatio(toCss(fgOpaque), toCss(bg));
    const large = (el.style.fontSize ?? 16) >= 24;
    const min = large ? 3 : 4.5;
    if (ratio >= min) continue;

    // pick whichever token color contrasts best with the actual surface
    const candidates = [
      tokens.colors.foreground,
      tokens.colors.background,
      tokens.colors.mutedForeground,
    ];
    let best = el.style.color;
    let bestRatio = ratio;
    for (const cand of candidates) {
      const c = parseColor(cand);
      if (!c) continue;
      const r = contrastRatio(toCss(composite(c, bg)), toCss(bg));
      if (r > bestRatio) {
        bestRatio = r;
        best = cand;
      }
    }
    const repaired = bestRatio >= min;
    if (best !== el.style.color) el.style.color = best;
    issues.push({
      slideId: slide.id,
      elementId: el.id,
      rule: "contrast",
      detail: `contrast ${ratio.toFixed(2)}:1 < ${min}:1, recolored to ${best} (${bestRatio.toFixed(2)}:1)`,
      repaired,
    });
  }
}

function repairOverflow(slide: ResolvedSlide, issues: ValidationIssue[]): void {
  for (const el of slide.elements) {
    if (el.kind !== "text" || !el.style) continue;
    if (!el.content && !el.items?.length) continue;
    if (el.id.startsWith("craft:")) continue;
    const size = el.style.fontSize ?? 16;
    const lh = el.style.lineHeight ?? 1.4;
    const est = estimateTextHeight(el, size, lh, el.frame.w);
    if (est <= el.frame.h * 1.1) continue; // 10% tolerance

    // Repair 1 (preferred): grow the frame into free space below.
    // Designers fix a cramped textbox by giving it room, not by making
    // the type unreadable.
    const grow = growableHeight(el, slide);
    if (grow > 0) {
      const needed = Math.ceil(est - el.frame.h);
      const applied = Math.min(grow, needed + 8);
      el.frame.h += applied;
      if (est <= el.frame.h * 1.1) {
        issues.push({
          slideId: slide.id,
          elementId: el.id,
          rule: "overflow",
          detail: `frame grown +${applied}px to fit ~${Math.round(est)}px of text`,
          repaired: true,
        });
        continue;
      }
    }

    // Repair 2 (last resort): step the font down — but never below a
    // readable floor. Body/bullet copy floors at 14px; labels at 12px.
    const floor =
      el.role === "body" || el.role === "bullet"
        ? 14
        : el.role === "caption" || el.role === "label"
          ? 12
          : Math.max(14, Math.round(size * 0.7));
    let newSize = size;
    while (
      newSize > floor &&
      estimateTextHeight(el, newSize, lh, el.frame.w) > el.frame.h * 1.1
    ) {
      newSize -= 1;
    }
    const repaired =
      estimateTextHeight(el, newSize, lh, el.frame.w) <= el.frame.h * 1.1;
    if (newSize !== size) el.style.fontSize = newSize;
    issues.push({
      slideId: slide.id,
      elementId: el.id,
      rule: "overflow",
      detail: `estimated ${Math.round(est)}px > frame ${el.frame.h}px, font ${size}→${newSize}px`,
      repaired,
    });
  }
}

function repairOversizedText(
  slide: ResolvedSlide,
  issues: ValidationIssue[],
): void {
  for (const el of slide.elements) {
    if (el.kind !== "text" || !el.content || !el.style) continue;
    if (el.role !== "body") continue;
    if (el.content.length <= 420) continue;
    const size = el.style.fontSize ?? 16;
    if (size <= 14) continue;
    el.style.fontSize = Math.max(14, size - 2);
    issues.push({
      slideId: slide.id,
      elementId: el.id,
      rule: "oversized-text",
      detail: `${el.content.length}-char paragraph, font ${size}→${el.style.fontSize}px`,
      repaired: true,
    });
  }
}

function repairBounds(slide: ResolvedSlide, issues: ValidationIssue[]): void {
  for (const el of slide.elements) {
    // full-bleed craft decoration may intentionally touch edges
    if (el.id.startsWith("craft:")) continue;
    const f = el.frame;
    let moved = false;
    if (f.x < 0) {
      f.x = 0;
      moved = true;
    }
    if (f.y < 0) {
      f.y = 0;
      moved = true;
    }
    if (f.x + f.w > CANVAS_W) {
      f.x = Math.max(0, CANVAS_W - f.w);
      moved = true;
    }
    if (f.y + f.h > CANVAS_H) {
      f.y = Math.max(0, CANVAS_H - f.h);
      moved = true;
    }
    if (moved) {
      issues.push({
        slideId: slide.id,
        elementId: el.id,
        rule: "out-of-bounds",
        detail: "element pulled back inside canvas",
        repaired: true,
      });
    }
  }
}

function repairAlignment(
  slide: ResolvedSlide,
  issues: ValidationIssue[],
): void {
  for (const el of slide.elements) {
    if (el.id.startsWith("craft:")) continue;
    const f = el.frame;
    const sx = Math.round(f.x / GRID) * GRID;
    const sy = Math.round(f.y / GRID) * GRID;
    // only fix near-misses; big offsets are intentional composition
    if (sx !== f.x && Math.abs(sx - f.x) <= 3) {
      f.x = sx;
      issues.push({
        slideId: slide.id,
        elementId: el.id,
        rule: "alignment",
        detail: "x snapped to 4px grid",
        repaired: true,
      });
    }
    if (sy !== f.y && Math.abs(sy - f.y) <= 3) {
      f.y = sy;
      issues.push({
        slideId: slide.id,
        elementId: el.id,
        rule: "alignment",
        detail: "y snapped to 4px grid",
        repaired: true,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// public API
// ---------------------------------------------------------------------------

/**
 * Validate and auto-repair a Resolved IR in place.
 * Order matters: bounds → alignment → overflow → oversized → contrast
 * (contrast last, because earlier repairs can move text onto new surfaces).
 */
export function validateAndRepair(
  ir: ResolvedIR,
  tokens: DesignTokens,
): ValidationReport {
  const issues: ValidationIssue[] = [];
  for (const slide of ir.slides) {
    repairBounds(slide, issues);
    repairAlignment(slide, issues);
    repairOverflow(slide, issues);
    repairOversizedText(slide, issues);
    repairContrast(slide, tokens, issues);
  }
  return {
    issues,
    repairedCount: issues.filter((i) => i.repaired).length,
  };
}
