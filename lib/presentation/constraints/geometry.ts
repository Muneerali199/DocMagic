/**
 * Rect math on the 1280x720 canvas + unit conversions.
 * Pure functions only.
 */

import { CANVAS, type Frame } from "../ir/schema";

// PowerPoint 16:9 slide is 10in x 5.625in. Our canvas is 1280x720 px.
export const PX_PER_INCH = CANVAS.width / 10; // 128
export const EMU_PER_INCH = 914400;
export const PT_PER_INCH = 72;

export function pxToInches(px: number): number {
  return px / PX_PER_INCH;
}

export function pxToEmu(px: number): number {
  return Math.round(pxToInches(px) * EMU_PER_INCH);
}

/** Font px → pt for PPTX (72pt per inch; CSS px are 96/in but we design at 128px/in canvas scale — map 1px : 0.75pt like CSS). */
export function fontPxToPt(px: number): number {
  return Math.round(px * 0.75 * 10) / 10;
}

export function intersects(a: Frame, b: Frame): boolean {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function intersection(a: Frame, b: Frame): Frame | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.w, b.x + b.w);
  const bottom = Math.min(a.y + a.h, b.y + b.h);
  if (right <= x || bottom <= y) return null;
  return { x, y, w: right - x, h: bottom - y };
}

export function overlapArea(a: Frame, b: Frame): number {
  const i = intersection(a, b);
  return i ? i.w * i.h : 0;
}

export function area(f: Frame): number {
  return f.w * f.h;
}

export function contains(outer: Frame, inner: Frame): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

export function clampToFrame(f: Frame, bounds: Frame): Frame {
  const w = Math.min(f.w, bounds.w);
  const h = Math.min(f.h, bounds.h);
  const x = Math.min(Math.max(f.x, bounds.x), bounds.x + bounds.w - w);
  const y = Math.min(Math.max(f.y, bounds.y), bounds.y + bounds.h - h);
  return { x, y, w, h };
}

export function inset(f: Frame, amount: number): Frame {
  return {
    x: f.x + amount,
    y: f.y + amount,
    w: Math.max(1, f.w - amount * 2),
    h: Math.max(1, f.h - amount * 2),
  };
}

export function center(f: Frame): { x: number; y: number } {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

/** Split a frame into n columns with a gap. */
export function splitColumns(f: Frame, n: number, gap: number): Frame[] {
  const w = (f.w - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: f.x + i * (w + gap),
    y: f.y,
    w,
    h: f.h,
  }));
}

/** Split a frame into n rows with a gap. */
export function splitRows(f: Frame, n: number, gap: number): Frame[] {
  const h = (f.h - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({
    x: f.x,
    y: f.y + i * (h + gap),
    w: f.w,
    h,
  }));
}

/** Split into a rows x cols grid with gaps, row-major order. */
export function splitGrid(
  f: Frame,
  rows: number,
  cols: number,
  gap: number,
): Frame[] {
  const out: Frame[] = [];
  for (const row of splitRows(f, rows, gap)) {
    out.push(...splitColumns(row, cols, gap));
  }
  return out;
}

export function canvasFrame(): Frame {
  return { x: 0, y: 0, w: CANVAS.width, h: CANVAS.height };
}

export function safeFrame(safeMargin: number): Frame {
  return inset(canvasFrame(), safeMargin);
}
