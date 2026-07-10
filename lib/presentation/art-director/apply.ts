/**
 * Art Direction Application — the seam that makes the Art Director's semantic
 * decisions actually change the rendered slide.
 *
 * Pipeline position:
 *   Art Director (semantic intent) → **apply** → Layout Result + emphasis map
 *                                              → Materializer → Resolved IR
 *
 * The Art Director emits ONLY intent (whitespace, tension, bias, per-object
 * hierarchy with a relative `scale`). This module is where that intent is
 * consumed and turned into concrete, deterministic transforms:
 *
 *   1. Whitespace  — tightens the movable content cluster toward its own
 *      centre so an airy-intent slide gains real negative space. Uniform, so
 *      column/row alignment and non-overlap are preserved exactly.
 *   2. Bias        — shifts the cluster into the horizontal slack the inset
 *      created, so the deck is not monotonously centred (only when no
 *      full-bleed element pins a side).
 *   3. Hierarchy   — an emphasis map keyed by source element id that the
 *      Materializer uses to scale type and mute receding copy, so the single
 *      focal object genuinely dominates.
 *
 * Full-bleed media/decoration is never moved. Everything is pure integer math
 * on the inputs: same ArtDirection + LayoutResult ⇒ identical output. No
 * coordinates leak back into the Art Director — this stage owns geometry, the
 * Art Director owns meaning.
 */

import { CANVAS, type Frame } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { LayoutResult, PlacedElement } from "../layout/library";
import type { ArtDirection, HierarchyEmphasis } from "./types";

const W = CANVAS.width;
const H = CANVAS.height;
const EDGE_TOL = 6;

/** The per-element art-direction the Materializer consumes. */
export interface ArtEmphasisEntry {
  emphasis: HierarchyEmphasis;
  /** raw relative hierarchy scale intent (0.4 muted → 2.4 hero) */
  scale: number;
  /** bounded multiplier applied to resolved font sizes (0.9–1.15) */
  fontScale: number;
  /** true for the single dominant / focal object */
  focal: boolean;
}

export interface DirectedLayout {
  result: LayoutResult;
  /** per source-element emphasis, keyed by element id */
  emphasis: Map<string, ArtEmphasisEntry>;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function round(v: number): number {
  return Math.round(v);
}

/** Intentional full-bleed media / decoration: pinned, never moved or scaled. */
function isBleed(frame: Frame): boolean {
  const touchesEdge =
    frame.x <= EDGE_TOL ||
    frame.y <= EDGE_TOL ||
    frame.x + frame.w >= W - EDGE_TOL ||
    frame.y + frame.h >= H - EDGE_TOL;
  const large = frame.w >= W * 0.35 || frame.h >= H * 0.9;
  return touchesEdge && large;
}

/**
 * Map a relative hierarchy scale intent onto a bounded font multiplier. Kept
 * tight so the dominant object reads as dominant without forcing overflow (the
 * constraint solver would only have to shrink it back).
 */
export function fontScaleForHierarchy(scale: number): number {
  return Math.round(clamp(1 + (scale - 1) * 0.1, 0.9, 1.15) * 1000) / 1000;
}

/** Build the per-element emphasis map from the Art Director's hierarchy. */
export function buildEmphasisMap(
  direction: ArtDirection,
): Map<string, ArtEmphasisEntry> {
  const map = new Map<string, ArtEmphasisEntry>();
  // hierarchy[0] is the focal object by the Art Director's own ordering.
  const focalId = direction.hierarchy[0]?.elementId;
  for (const entry of direction.hierarchy) {
    map.set(entry.elementId, {
      emphasis: entry.emphasis,
      scale: entry.scale,
      fontScale: fontScaleForHierarchy(entry.scale),
      focal: entry.elementId === focalId,
    });
  }
  return map;
}

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function boundsOf(frames: Frame[]): Bounds {
  return {
    minX: Math.min(...frames.map((f) => f.x)),
    minY: Math.min(...frames.map((f) => f.y)),
    maxX: Math.max(...frames.map((f) => f.x + f.w)),
    maxY: Math.max(...frames.map((f) => f.y + f.h)),
  };
}

/**
 * Whitespace + bias transform on the movable placements. Uniform scaling about
 * the cluster centre guarantees any two previously-aligned/non-overlapping
 * frames stay aligned/non-overlapping.
 */
function transformPlacements(
  placements: PlacedElement[],
  direction: ArtDirection,
  tokens: DesignTokens,
): PlacedElement[] {
  const movable = placements.filter((p) => !isBleed(p.frame));
  const hasBleed = movable.length !== placements.length;
  if (movable.length < 2) return placements;

  // Only ADD whitespace (tighten) when the art-directed intent is above the
  // neutral midpoint — never pack a slide tighter than the layout intended.
  const extra = clamp(direction.whitespace - 0.5, 0, 0.5); // 0 → 0.5
  const k = 1 - extra * 0.22; // whitespace 1.0 ⇒ k ≈ 0.89

  const b = boundsOf(movable.map((p) => p.frame));
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;

  const scale = (v: number, centre: number) => centre + (v - centre) * k;

  // First pass: whitespace inset.
  const scaled = placements.map((p) => {
    if (isBleed(p.frame)) return p;
    const x = scale(p.frame.x, cx);
    const y = scale(p.frame.y, cy);
    return {
      ...p,
      frame: {
        x: round(x),
        y: round(y),
        w: Math.max(1, round(p.frame.w * k)),
        h: Math.max(1, round(p.frame.h * k)),
      },
    };
  });

  // Second pass: horizontal bias into the slack the inset opened up. Skipped
  // when a full-bleed element pins a side (shifting could collide with it).
  const biasSign =
    direction.bias === "left" ? -1 : direction.bias === "right" ? 1 : 0;
  if (biasSign === 0 || hasBleed || k >= 0.999) return scaled;

  const margin = tokens.spacing.safeMargin;
  const sb = boundsOf(scaled.filter((p) => !isBleed(p.frame)).map((p) => p.frame));
  const slack =
    biasSign < 0 ? sb.minX - margin : W - margin - sb.maxX;
  if (slack <= 1) return scaled;
  // tension decides how assertively the composition leans off-centre.
  const dx = round(biasSign * clamp(slack * (0.3 + direction.tension * 0.3), 0, slack));
  if (dx === 0) return scaled;

  return scaled.map((p) =>
    isBleed(p.frame)
      ? p
      : { ...p, frame: { ...p.frame, x: p.frame.x + dx } },
  );
}

/**
 * Consume an ArtDirection: return the geometrically art-directed LayoutResult
 * plus the per-element emphasis map for the Materializer. Deterministic.
 */
export function applyArtDirection(
  result: LayoutResult,
  direction: ArtDirection,
  tokens: DesignTokens,
): DirectedLayout {
  return {
    result: {
      ...result,
      placements: transformPlacements(result.placements, direction, tokens),
    },
    emphasis: buildEmphasisMap(direction),
  };
}
