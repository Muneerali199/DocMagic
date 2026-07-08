/**
 * Constraint Solver — a full deterministic optimization engine. NO LLM.
 *
 * Responsibilities: collision detection, overflow handling, font scaling,
 * spacing optimization, whitespace optimization, optical alignment, grouping,
 * safe margins, responsive positioning, visual balance, hierarchy preservation.
 *
 * Operates on ResolvedSlide (positioned elements). Every function is pure:
 * (slide, tokens) => slide. Same input always yields the same output.
 */

import { CANVAS, type ResolvedElement, type ResolvedSlide } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import {
  intersects,
  overlapArea,
  area,
  safeFrame,
  clampToFrame,
} from "./geometry";
import { measureText } from "../typography/measure";

const MIN_FONT_SCALE = 0.6;

/** Elements allowed to bleed outside safe margins (full-bleed media/decor). */
function isFullBleed(el: ResolvedElement): boolean {
  return (
    (el.kind === "image" || el.kind === "shape") &&
    (el.frame.w >= CANVAS.width * 0.35 || el.frame.h >= CANVAS.height * 0.9) &&
    (el.frame.x <= 0 ||
      el.frame.y <= 0 ||
      el.frame.x + el.frame.w >= CANVAS.width ||
      el.frame.y + el.frame.h >= CANVAS.height)
  );
}

// ---------------------------------------------------------------------------
// 1. Safe margins
// ---------------------------------------------------------------------------

export function enforceSafeMargins(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  const safe = safeFrame(tokens.spacing.safeMargin);
  return {
    ...slide,
    elements: slide.elements.map((el) => {
      if (isFullBleed(el)) return el;
      return { ...el, frame: clampToFrame(el.frame, safe) };
    }),
  };
}

// ---------------------------------------------------------------------------
// 2. Overflow handling + font scaling (hierarchy-preserving)
// ---------------------------------------------------------------------------

export function fitTextElements(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  return {
    ...slide,
    elements: slide.elements.map((el) => {
      if (el.kind !== "text") return el;
      const padding = el.box?.fill ? tokens.spacing.cardPadding : 0;
      const innerW = Math.max(1, el.frame.w - padding * 2);
      const innerH = Math.max(1, el.frame.h - padding * 2);

      let scale = 1;
      let metrics = measureText(el.content, el.items, el.style, innerW);
      while (metrics.height > innerH && scale > MIN_FONT_SCALE) {
        scale -= 0.05;
        metrics = measureText(
          el.content,
          el.items,
          { ...el.style, fontSize: el.style.fontSize * scale },
          innerW,
        );
      }
      if (scale === 1) return el;
      return {
        ...el,
        style: {
          ...el.style,
          fontSize: Math.round(el.style.fontSize * scale * 10) / 10,
        },
      };
    }),
  };
}

// ---------------------------------------------------------------------------
// 3. Collision detection + resolution
// ---------------------------------------------------------------------------

export interface Collision {
  a: string;
  b: string;
  overlap: number;
}

export function detectCollisions(slide: ResolvedSlide): Collision[] {
  const collisions: Collision[] = [];
  const els = slide.elements.filter(
    (el) => !isFullBleed(el) && el.kind !== "shape",
  );
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      const a = els[i];
      const b = els[j];
      if (intersects(a.frame, b.frame)) {
        const overlap = overlapArea(a.frame, b.frame);
        // ignore sub-pixel rounding overlaps
        if (overlap > 4) collisions.push({ a: a.id, b: b.id, overlap });
      }
    }
  }
  return collisions;
}

/**
 * Resolve collisions by pushing the lower element down, then re-clamping.
 * Deterministic: processes collisions sorted by overlap descending, id ascending.
 */
export function resolveCollisions(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  let current = slide;
  const gap = tokens.spacing.unit;
  for (let pass = 0; pass < 4; pass++) {
    const collisions = detectCollisions(current).sort(
      (c1, c2) => c2.overlap - c1.overlap || c1.a.localeCompare(c2.a),
    );
    if (collisions.length === 0) break;
    const elements = [...current.elements];
    for (const col of collisions) {
      const ai = elements.findIndex((e) => e.id === col.a);
      const bi = elements.findIndex((e) => e.id === col.b);
      if (ai === -1 || bi === -1) continue;
      const a = elements[ai];
      const b = elements[bi];
      if (!intersects(a.frame, b.frame)) continue;
      // the element whose top edge is lower moves down below the other
      const [upper, lower, lowerIdx] =
        a.frame.y <= b.frame.y ? [a, b, bi] : [b, a, ai];
      const newY = upper.frame.y + upper.frame.h + gap;
      const maxY = CANVAS.height - tokens.spacing.safeMargin - lower.frame.h;
      if (newY <= maxY) {
        elements[lowerIdx] = { ...lower, frame: { ...lower.frame, y: newY } };
      } else {
        // no room below: shrink the lower element's height to fit beside
        const available = CANVAS.height - tokens.spacing.safeMargin - newY;
        if (available > 40) {
          elements[lowerIdx] = {
            ...lower,
            frame: { ...lower.frame, y: newY, h: available },
          };
        }
        // otherwise leave as-is; critic will flag it
      }
    }
    current = { ...current, elements };
  }
  return current;
}

// ---------------------------------------------------------------------------
// 4. Optical alignment + spacing optimization
// ---------------------------------------------------------------------------

/**
 * Snap near-aligned edges to each other (within tolerance) so columns and
 * rows read as intentional. Groups by x-left, x-right, y-top.
 */
export function opticalAlign(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  const tolerance = tokens.spacing.unit;
  const elements = slide.elements.map((el) => ({
    ...el,
    frame: { ...el.frame },
  }));

  const snap = (
    get: (f: { x: number; y: number; w: number; h: number }) => number,
    set: (f: { x: number; y: number; w: number; h: number }, v: number) => void,
  ) => {
    const values: number[] = [];
    for (const el of elements) {
      if (isFullBleed(el)) continue;
      const v = get(el.frame);
      const existing = values.find(
        (e) => Math.abs(e - v) <= tolerance && e !== v,
      );
      if (existing !== undefined) {
        set(el.frame, existing);
      } else if (!values.includes(v)) {
        values.push(v);
      }
    }
  };

  snap(
    (f) => f.x,
    (f, v) => {
      f.x = v;
    },
  );
  snap(
    (f) => f.y,
    (f, v) => {
      f.y = v;
    },
  );
  return { ...slide, elements };
}

// ---------------------------------------------------------------------------
// 5. Visual balance / whitespace optimization
// ---------------------------------------------------------------------------

export interface BalanceReport {
  /** 0 = perfectly balanced, 1 = all weight on one side */
  horizontalImbalance: number;
  verticalImbalance: number;
  /** fraction of safe area covered by content */
  coverage: number;
}

export function measureBalance(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): BalanceReport {
  const safe = safeFrame(tokens.spacing.safeMargin);
  const cx = CANVAS.width / 2;
  const cy = CANVAS.height / 2;
  let leftWeight = 0;
  let rightWeight = 0;
  let topWeight = 0;
  let bottomWeight = 0;
  let covered = 0;
  for (const el of slide.elements) {
    if (el.kind === "shape" && !el.label) continue; // decorative
    const a = area(el.frame);
    covered += a;
    const ecx = el.frame.x + el.frame.w / 2;
    const ecy = el.frame.y + el.frame.h / 2;
    if (ecx < cx) leftWeight += a;
    else rightWeight += a;
    if (ecy < cy) topWeight += a;
    else bottomWeight += a;
  }
  const h = leftWeight + rightWeight;
  const v = topWeight + bottomWeight;
  return {
    horizontalImbalance: h === 0 ? 0 : Math.abs(leftWeight - rightWeight) / h,
    verticalImbalance: v === 0 ? 0 : Math.abs(topWeight - bottomWeight) / v,
    coverage: Math.min(1, covered / area(safe)),
  };
}

/**
 * If content underfills the canvas vertically, recenter the whole content
 * block for intentional whitespace distribution.
 */
export function rebalanceVertical(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  const movable = slide.elements.filter((el) => !isFullBleed(el));
  if (movable.length === 0) return slide;
  const top = Math.min(...movable.map((el) => el.frame.y));
  const bottom = Math.max(...movable.map((el) => el.frame.y + el.frame.h));
  const safe = safeFrame(tokens.spacing.safeMargin);
  const contentH = bottom - top;
  const idealTop = safe.y + Math.max(0, (safe.h - contentH) / 2);
  // only shift when meaningfully off-center and content fits
  const shift = idealTop - top;
  if (contentH >= safe.h || Math.abs(shift) < tokens.spacing.unit * 2)
    return slide;
  return {
    ...slide,
    elements: slide.elements.map((el) =>
      isFullBleed(el)
        ? el
        : { ...el, frame: { ...el.frame, y: el.frame.y + shift } },
    ),
  };
}

// ---------------------------------------------------------------------------
// Solve — full deterministic pipeline for one slide
// ---------------------------------------------------------------------------

export function solveSlide(
  slide: ResolvedSlide,
  tokens: DesignTokens,
): ResolvedSlide {
  let s = slide;
  s = enforceSafeMargins(s, tokens);
  s = fitTextElements(s, tokens);
  s = resolveCollisions(s, tokens);
  s = opticalAlign(s, tokens);
  s = rebalanceVertical(s, tokens);
  return s;
}
