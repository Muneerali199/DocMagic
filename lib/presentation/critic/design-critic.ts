/**
 * Design Critic — post-render evaluation module.
 *
 * Runs AFTER the Presentation Compiler input (Resolved IR) is finalized.
 * It never generates or regenerates slides and never calls an LLM — its only
 * responsibility is to analyze the rendered deck and return structured
 * feedback.
 *
 * Evaluated dimensions:
 *   visual hierarchy, typography, whitespace, spacing, alignment,
 *   consistency, visual balance, accessibility, information density,
 *   overall design quality.
 *
 * The public contract is `DesignCritic` / `CriticResult`. This file ships a
 * deterministic rule-based implementation (`ruleBasedDesignCritic`); a
 * vision-capable model can replace it later by implementing the same
 * interface — no API change required.
 */

import {
  CANVAS,
  type ResolvedElement,
  type ResolvedIR,
  type ResolvedSlide,
} from "../ir/schema";

type ResolvedText = Extract<ResolvedElement, { kind: "text" }>;
import type { DesignTokens } from "../design/tokens";
import { detectCollisions, measureBalance } from "../constraints/solver";
import { contrastRatio } from "../color/engine";
import { measureText } from "../typography/measure";

// ---------------------------------------------------------------------------
// Public contract
// ---------------------------------------------------------------------------

export interface CriticResult {
  /** 0-100 overall design quality */
  overallScore: number;
  /** human-readable problems found in the rendered deck */
  issues: string[];
  /** actionable suggestions (no regeneration is performed) */
  recommendations: string[];
}

/** Implement this to swap in a vision-model critic later. */
export interface DesignCritic {
  id: string;
  evaluate(ir: ResolvedIR, tokens: DesignTokens): Promise<CriticResult>;
}

// ---------------------------------------------------------------------------
// Internal: per-dimension scoring (each returns 0..100 + issues)
// ---------------------------------------------------------------------------

interface DimensionAudit {
  score: number;
  issues: string[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function textElements(slide: ResolvedSlide): ResolvedText[] {
  return slide.elements.filter((el): el is ResolvedText => el.kind === "text");
}

/** Visual hierarchy — one clear anchor per slide, meaningful size contrast. */
function auditHierarchy(ir: ResolvedIR): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    const texts = textElements(slide);
    if (texts.length === 0) continue;
    const primaries = texts.filter((t) => t.emphasis === "primary");
    if (primaries.length === 0) {
      issues.push(
        `Slide "${slide.id}": no primary text anchor — hierarchy reads flat.`,
      );
      score -= 8;
    } else if (primaries.length > 2) {
      issues.push(
        `Slide "${slide.id}": ${primaries.length} competing primary anchors.`,
      );
      score -= 6;
    }
    const sizes = texts.map((t) => t.style.fontSize);
    const max = Math.max(...sizes);
    const min = Math.min(...sizes);
    if (texts.length >= 3 && max / min < 1.3) {
      issues.push(
        `Slide "${slide.id}": text sizes are too uniform (${min}-${max}px) for a clear reading order.`,
      );
      score -= 5;
    }
  }
  return { score: clamp(score), issues };
}

/** Typography — readability floor, overflow, line length. */
function auditTypography(ir: ResolvedIR, tokens: DesignTokens): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    for (const el of textElements(slide)) {
      if (el.style.fontSize < 12) {
        issues.push(
          `Slide "${slide.id}": font size ${el.style.fontSize}px in "${el.id}" is below the 12px readability floor.`,
        );
        score -= 7;
      }
      const padding = el.box?.fill ? tokens.spacing.cardPadding : 0;
      const metrics = measureText(
        el.content,
        el.items,
        el.style,
        Math.max(1, el.frame.w - padding * 2),
      );
      if (metrics.height > el.frame.h - padding * 2 + 2) {
        issues.push(
          `Slide "${slide.id}": text in "${el.id}" likely overflows its frame.`,
        );
        score -= 6;
      }
      // body line-length check (~45-90 chars per line is comfortable)
      if (
        (el.role === "body" || el.role === "bullet") &&
        el.style.fontSize > 0
      ) {
        const approxCharsPerLine = el.frame.w / (el.style.fontSize * 0.52);
        if (approxCharsPerLine > 110) {
          issues.push(
            `Slide "${slide.id}": body text in "${el.id}" runs ~${Math.round(approxCharsPerLine)} chars/line; long lines hurt readability.`,
          );
          score -= 3;
        }
      }
    }
  }
  return { score: clamp(score), issues };
}

/** Whitespace — content coverage of the safe area. */
function auditWhitespace(ir: ResolvedIR, tokens: DesignTokens): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    const { coverage } = measureBalance(slide, tokens);
    if (coverage > 0.85) {
      issues.push(
        `Slide "${slide.id}": content covers ${Math.round(coverage * 100)}% of the safe area — cramped.`,
      );
      score -= 8;
    } else if (coverage > 0.75) {
      score -= 3;
    }
  }
  return { score: clamp(score), issues };
}

/** Spacing — collisions and irregular gaps between sibling elements. */
function auditSpacing(ir: ResolvedIR, tokens: DesignTokens): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    const collisions = detectCollisions(slide);
    for (const col of collisions) {
      issues.push(
        `Slide "${slide.id}": elements "${col.a}" and "${col.b}" overlap.`,
      );
      score -= 10;
    }
    // vertical rhythm: gaps between stacked content should not vary wildly
    const stacked = slide.elements
      .filter((el) => el.kind !== "shape")
      .slice()
      .sort((a, b) => a.frame.y - b.frame.y);
    const gaps: number[] = [];
    for (let i = 1; i < stacked.length; i++) {
      const gap = stacked[i].frame.y - (stacked[i - 1].frame.y + stacked[i - 1].frame.h);
      if (gap > 0 && gap < 200) gaps.push(gap);
    }
    if (gaps.length >= 3) {
      const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
      const maxDev = Math.max(...gaps.map((g) => Math.abs(g - mean)));
      if (mean > 0 && maxDev / mean > 1.6 && maxDev > tokens.spacing.unit * 3) {
        issues.push(
          `Slide "${slide.id}": vertical gaps vary from ${Math.round(Math.min(...gaps))}px to ${Math.round(Math.max(...gaps))}px — rhythm is irregular.`,
        );
        score -= 4;
      }
    }
  }
  return { score: clamp(score), issues };
}

/** Alignment — elements should share common left edges; nothing off-canvas. */
function auditAlignment(ir: ResolvedIR): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  const SNAP = 6; // px tolerance for "aligned"
  for (const slide of ir.slides) {
    const content = slide.elements.filter((el) => el.kind !== "shape");
    // off-canvas
    for (const el of content) {
      const f = el.frame;
      if (
        f.x < -1 ||
        f.y < -1 ||
        f.x + f.w > CANVAS.width + 1 ||
        f.y + f.h > CANVAS.height + 1
      ) {
        if (el.kind !== "image") {
          issues.push(
            `Slide "${slide.id}": element "${el.id}" extends outside the canvas.`,
          );
          score -= 8;
        }
      }
    }
    // left-edge clustering: count distinct left edges (within tolerance)
    if (content.length >= 4) {
      const edges: number[] = [];
      for (const el of content) {
        const x = el.frame.x;
        if (!edges.some((e) => Math.abs(e - x) <= SNAP)) edges.push(x);
      }
      if (edges.length > Math.ceil(content.length * 0.75)) {
        issues.push(
          `Slide "${slide.id}": ${edges.length} distinct left edges across ${content.length} elements — weak alignment grid.`,
        );
        score -= 5;
      }
    }
  }
  return { score: clamp(score), issues };
}

/** Consistency — same text roles should use the same size across the deck. */
function auditConsistency(ir: ResolvedIR): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  const sizesByRole = new Map<string, Set<number>>();
  const fontsUsed = new Set<string>();
  for (const slide of ir.slides) {
    for (const el of textElements(slide)) {
      if (!sizesByRole.has(el.role)) sizesByRole.set(el.role, new Set());
      sizesByRole.get(el.role)!.add(el.style.fontSize);
      fontsUsed.add(el.style.fontFamily);
    }
  }
  for (const [role, sizes] of sizesByRole) {
    // headings scale by slide type, allow up to 3 variants; body roles 2
    const allowed = role === "title" || role === "heading" ? 3 : 2;
    if (sizes.size > allowed) {
      issues.push(
        `Role "${role}" uses ${sizes.size} different font sizes across the deck (${[...sizes].join(", ")}px).`,
      );
      score -= 6;
    }
  }
  if (fontsUsed.size > 2) {
    issues.push(
      `Deck uses ${fontsUsed.size} font families; limit to 2 for consistency.`,
    );
    score -= 8;
  }
  return { score: clamp(score), issues };
}

/** Visual balance — horizontal weight distribution per slide. */
function auditBalance(ir: ResolvedIR, tokens: DesignTokens): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    if (slide.type === "hero" || slide.type === "section") continue;
    const { horizontalImbalance } = measureBalance(slide, tokens);
    if (horizontalImbalance > 0.65) {
      issues.push(
        `Slide "${slide.id}": visual weight is ${Math.round(horizontalImbalance * 100)}% one-sided.`,
      );
      score -= 6;
    }
  }
  return { score: clamp(score), issues };
}

/** Accessibility — WCAG AA contrast, image alt text. */
function auditAccessibility(ir: ResolvedIR): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    for (const el of slide.elements) {
      if (el.kind === "text") {
        const bg = el.box?.fill ?? slide.background;
        const ratio = contrastRatio(el.style.color, bg, slide.background);
        const required = el.style.fontSize >= 24 ? 3 : 4.5;
        if (ratio < required) {
          issues.push(
            `Slide "${slide.id}": contrast ${ratio.toFixed(2)}:1 in "${el.id}" is below WCAG AA (${required}:1).`,
          );
          score -= 7;
        }
      }
      if (el.kind === "image" && !el.alt) {
        issues.push(
          `Slide "${slide.id}": image "${el.id}" is missing alt text.`,
        );
        score -= 4;
      }
    }
  }
  return { score: clamp(score), issues };
}

/** Information density — element count and estimated word count per slide. */
function auditDensity(ir: ResolvedIR): DimensionAudit {
  const issues: string[] = [];
  let score = 100;
  for (const slide of ir.slides) {
    const content = slide.elements.filter((el) => el.kind !== "shape");
    if (content.length > 9) {
      issues.push(
        `Slide "${slide.id}": ${content.length} content elements — consider splitting.`,
      );
      score -= 6;
    }
    let words = 0;
    for (const el of textElements(slide)) {
      words += el.content.split(/\s+/).filter(Boolean).length;
      for (const item of el.items ?? [])
        words += item.split(/\s+/).filter(Boolean).length;
    }
    if (words > 120) {
      issues.push(
        `Slide "${slide.id}": ~${words} words — too much text for one slide.`,
      );
      score -= 5;
    }
  }
  return { score: clamp(score), issues };
}

// ---------------------------------------------------------------------------
// Recommendations (derived from issues, deck-wide)
// ---------------------------------------------------------------------------

function buildRecommendations(
  dims: Record<string, DimensionAudit>,
  ir: ResolvedIR,
): string[] {
  const recs: string[] = [];
  if (dims.spacing.score < 85)
    recs.push(
      "Resolve overlaps and normalize vertical gaps — rerun the constraint solver or reduce content per slide.",
    );
  if (dims.typography.score < 85)
    recs.push(
      "Shorten copy or enlarge frames where text overflows; keep all text at 12px or larger.",
    );
  if (dims.accessibility.score < 90)
    recs.push(
      "Raise text contrast to WCAG AA and add alt text to all informational images.",
    );
  if (dims.whitespace.score < 85)
    recs.push(
      "Trim content on cramped slides or split them — target under 75% safe-area coverage.",
    );
  if (dims.density.score < 85)
    recs.push("Aim for one idea per slide; move overflow content to new slides.");
  if (dims.hierarchy.score < 85)
    recs.push(
      "Give each slide exactly one primary anchor and increase size contrast between heading and body text.",
    );
  if (dims.consistency.score < 85)
    recs.push(
      "Unify font sizes per text role and limit the deck to two font families.",
    );
  if (dims.alignment.score < 85)
    recs.push("Snap elements to a shared left-edge grid to strengthen alignment.");
  if (dims.balance.score < 85)
    recs.push(
      "Redistribute content horizontally on one-sided slides (or pair text with a visual).",
    );
  const types = new Set(ir.slides.map((s) => s.type));
  if (ir.slides.length >= 6 && types.size <= 2)
    recs.push(
      "Vary slide types (KPI, comparison, timeline, diagram) to improve visual rhythm.",
    );
  return recs;
}

// ---------------------------------------------------------------------------
// Rule-based implementation
// ---------------------------------------------------------------------------

/** Weights sum to 1. Overall design quality is the weighted dimension mean. */
const WEIGHTS: Record<string, number> = {
  hierarchy: 0.14,
  typography: 0.14,
  whitespace: 0.1,
  spacing: 0.14,
  alignment: 0.1,
  consistency: 0.1,
  balance: 0.08,
  accessibility: 0.12,
  density: 0.08,
};

export function evaluateDesign(
  ir: ResolvedIR,
  tokens: DesignTokens,
): CriticResult {
  const dims: Record<string, DimensionAudit> = {
    hierarchy: auditHierarchy(ir),
    typography: auditTypography(ir, tokens),
    whitespace: auditWhitespace(ir, tokens),
    spacing: auditSpacing(ir, tokens),
    alignment: auditAlignment(ir),
    consistency: auditConsistency(ir),
    balance: auditBalance(ir, tokens),
    accessibility: auditAccessibility(ir),
    density: auditDensity(ir),
  };

  let weighted = 0;
  const issues: string[] = [];
  for (const [key, audit] of Object.entries(dims)) {
    weighted += audit.score * (WEIGHTS[key] ?? 0);
    issues.push(...audit.issues);
  }

  return {
    overallScore: clamp(weighted),
    issues,
    recommendations: buildRecommendations(dims, ir),
  };
}

export const ruleBasedDesignCritic: DesignCritic = {
  id: "core.design-critic.rules",
  evaluate: async (ir, tokens) => evaluateDesign(ir, tokens),
};
