/**
 * Benchmark framework — scores a Resolved IR deck on 9 quality dimensions
 * so generated output can be compared across pipeline versions and against
 * competitor tools (given IR-converted samples).
 *
 * All metrics are deterministic 0-100 scores computed from the IR.
 */

import { CANVAS, type ResolvedIR, type ResolvedSlide } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import { detectCollisions, measureBalance } from "../constraints/solver";
import { contrastRatio } from "../color/engine";
import { measureText } from "../typography/measure";

export interface BenchmarkScore {
  readability: number;
  visualHierarchy: number;
  consistency: number;
  editability: number;
  accessibility: number;
  whitespace: number;
  storytelling: number;
  informationDensity: number;
  designQuality: number;
  /** weighted composite 0-100 */
  overall: number;
}

export interface BenchmarkReport {
  deckTitle: string;
  slideCount: number;
  scores: BenchmarkScore;
  generatedAt: string;
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

function textElements(slide: ResolvedSlide) {
  return slide.elements.filter((el) => el.kind === "text");
}

/** Readability: font sizes above floors, no estimated overflow. */
function scoreReadability(ir: ResolvedIR, tokens: DesignTokens): number {
  let total = 0;
  let count = 0;
  for (const slide of ir.slides) {
    for (const el of textElements(slide)) {
      if (el.kind !== "text") continue;
      count++;
      let s = 100;
      if (el.style.fontSize < 12) s -= 50;
      else if (el.style.fontSize < 14) s -= 20;
      const padding = el.box?.fill ? tokens.spacing.cardPadding : 0;
      const m = measureText(
        el.content,
        el.items,
        el.style,
        Math.max(1, el.frame.w - padding * 2),
      );
      if (m.height > el.frame.h - padding * 2 + 2) s -= 40;
      total += Math.max(0, s);
    }
  }
  return count === 0 ? 100 : clamp(total / count);
}

/** Hierarchy: each slide has a clear primary anchor and size differentiation. */
function scoreVisualHierarchy(ir: ResolvedIR): number {
  let total = 0;
  for (const slide of ir.slides) {
    const texts = textElements(slide);
    let s = 100;
    const primaries = texts.filter((el) => el.emphasis === "primary");
    if (primaries.length === 0) s -= 35;
    if (primaries.length > 2) s -= 15;
    if (texts.length >= 2) {
      const sizes = texts
        .map((el) => (el.kind === "text" ? el.style.fontSize : 0))
        .sort((a, b) => b - a);
      const ratio = sizes[0] / Math.max(1, sizes[sizes.length - 1]);
      if (ratio < 1.3) s -= 25; // flat type scale
    }
    total += Math.max(0, s);
  }
  return clamp(total / ir.slides.length);
}

/** Consistency: same roles share sizes; colors stay within the palette. */
function scoreConsistency(ir: ResolvedIR, tokens: DesignTokens): number {
  const sizesByRole = new Map<string, Set<number>>();
  const allowedColors = new Set(
    [
      tokens.colors.foreground,
      tokens.colors.mutedForeground,
      tokens.colors.primary,
      tokens.colors.primaryForeground,
      tokens.colors.accent,
      tokens.colors.positive,
      tokens.colors.negative,
      "#ffffff",
      "#0a0a0a",
    ].map((c) => c.toLowerCase()),
  );
  let colorViolations = 0;
  let colorTotal = 0;
  for (const slide of ir.slides) {
    for (const el of textElements(slide)) {
      if (el.kind !== "text") continue;
      // hero display sizes legitimately differ from body slides
      const key = `${slide.type === "hero" ? "hero-" : ""}${el.role}`;
      if (!sizesByRole.has(key)) sizesByRole.set(key, new Set());
      sizesByRole.get(key)!.add(Math.round(el.style.fontSize));
      colorTotal++;
      if (!allowedColors.has(el.style.color.toLowerCase())) colorViolations++;
    }
  }
  let s = 100;
  for (const sizes of sizesByRole.values()) {
    if (sizes.size > 2) s -= 8; // constraint solver may create 2 legit variants
  }
  if (colorTotal > 0) s -= (colorViolations / colorTotal) * 40;
  return clamp(s);
}

/** Editability: fraction of content that is native objects (always true in v2 IR — penalize rasterized fallbacks). */
function scoreEditability(ir: ResolvedIR): number {
  let native = 0;
  let total = 0;
  for (const slide of ir.slides) {
    for (const el of slide.elements) {
      total++;
      // images of charts/diagrams would be non-editable; our IR keeps them native
      if (el.kind !== "image") native++;
      else native += 0.6; // images are replaceable but not text-editable
    }
  }
  return total === 0 ? 100 : clamp((native / total) * 100);
}

/** Accessibility: WCAG AA contrast + alt text presence. */
function scoreAccessibility(ir: ResolvedIR): number {
  let checks = 0;
  let passes = 0;
  for (const slide of ir.slides) {
    for (const el of slide.elements) {
      if (el.kind === "text") {
        checks++;
        const bg = el.box?.fill ?? slide.background;
        const required = el.style.fontSize >= 24 ? 3 : 4.5;
        if (contrastRatio(el.style.color, bg, slide.background) >= required)
          passes++;
      }
      if (el.kind === "image") {
        checks++;
        if (el.alt && el.alt.length > 3) passes++;
      }
    }
  }
  return checks === 0 ? 100 : clamp((passes / checks) * 100);
}

/** Whitespace: coverage in the 25-70% sweet spot; no collisions. */
function scoreWhitespace(ir: ResolvedIR, tokens: DesignTokens): number {
  let total = 0;
  for (const slide of ir.slides) {
    const b = measureBalance(slide, tokens);
    let s = 100;
    if (b.coverage > 0.85) s -= 45;
    else if (b.coverage > 0.7) s -= 20;
    else if (
      b.coverage < 0.12 &&
      slide.type !== "hero" &&
      slide.type !== "quote"
    )
      s -= 20;
    s -= detectCollisions(slide).length * 15;
    total += Math.max(0, s);
  }
  return clamp(total / ir.slides.length);
}

/** Storytelling: opening/closing anchors, type variety, speaker notes. */
function scoreStorytelling(ir: ResolvedIR): number {
  let s = 100;
  const first = ir.slides[0];
  const last = ir.slides[ir.slides.length - 1];
  if (first?.type !== "hero" && first?.type !== "section") s -= 15;
  if (
    ir.slides.length >= 4 &&
    last?.type !== "closing" &&
    last?.type !== "quote"
  )
    s -= 10;
  const types = new Set(ir.slides.map((sl) => sl.type));
  if (ir.slides.length >= 6) {
    if (types.size <= 2) s -= 25;
    else if (types.size <= 3) s -= 10;
  }
  const withNotes = ir.slides.filter(
    (sl) => sl.speakerNotes && sl.speakerNotes.length > 10,
  ).length;
  s -= Math.round((1 - withNotes / ir.slides.length) * 20);
  return clamp(s);
}

/** Information density: word counts per slide within readable bounds. */
function scoreInformationDensity(ir: ResolvedIR): number {
  let total = 0;
  for (const slide of ir.slides) {
    const words = textElements(slide).reduce((sum, el) => {
      if (el.kind !== "text") return sum;
      const all = [el.content, ...(el.items ?? [])].join(" ");
      return sum + all.split(/\s+/).filter(Boolean).length;
    }, 0);
    let s = 100;
    if (words > 120) s -= 50;
    else if (words > 80) s -= 25;
    else if (words < 4 && slide.type !== "hero" && slide.type !== "section")
      s -= 15;
    const contentEls = slide.elements.filter(
      (el) => el.kind !== "shape",
    ).length;
    if (contentEls > 9) s -= 20;
    total += Math.max(0, s);
  }
  return clamp(total / ir.slides.length);
}

/** Design quality: balance, safe margins respected, decorative restraint. */
function scoreDesignQuality(ir: ResolvedIR, tokens: DesignTokens): number {
  let total = 0;
  for (const slide of ir.slides) {
    let s = 100;
    const b = measureBalance(slide, tokens);
    if (b.horizontalImbalance > 0.7 && slide.type !== "hero") s -= 20;
    if (b.verticalImbalance > 0.8) s -= 10;
    for (const el of slide.elements) {
      if (el.kind === "image" || el.kind === "shape") continue;
      const f = el.frame;
      const m = tokens.spacing.safeMargin;
      if (
        f.x < m - 1 ||
        f.y < m - 1 ||
        f.x + f.w > CANVAS.width - m + 1 ||
        f.y + f.h > CANVAS.height - m + 1
      ) {
        s -= 8;
      }
    }
    total += Math.max(0, s);
  }
  return clamp(total / ir.slides.length);
}

const OVERALL_WEIGHTS: Record<keyof Omit<BenchmarkScore, "overall">, number> = {
  readability: 0.16,
  visualHierarchy: 0.13,
  consistency: 0.11,
  editability: 0.1,
  accessibility: 0.13,
  whitespace: 0.1,
  storytelling: 0.09,
  informationDensity: 0.09,
  designQuality: 0.09,
};

export function benchmarkDeck(
  ir: ResolvedIR,
  tokens: DesignTokens,
): BenchmarkReport {
  const scores: Omit<BenchmarkScore, "overall"> = {
    readability: scoreReadability(ir, tokens),
    visualHierarchy: scoreVisualHierarchy(ir),
    consistency: scoreConsistency(ir, tokens),
    editability: scoreEditability(ir),
    accessibility: scoreAccessibility(ir),
    whitespace: scoreWhitespace(ir, tokens),
    storytelling: scoreStorytelling(ir),
    informationDensity: scoreInformationDensity(ir),
    designQuality: scoreDesignQuality(ir, tokens),
  };
  const overall = clamp(
    (Object.keys(OVERALL_WEIGHTS) as (keyof typeof OVERALL_WEIGHTS)[]).reduce(
      (sum, k) => sum + scores[k] * OVERALL_WEIGHTS[k],
      0,
    ),
  );
  return {
    deckTitle: ir.title,
    slideCount: ir.slides.length,
    scores: { ...scores, overall },
    generatedAt: new Date().toISOString(),
  };
}
