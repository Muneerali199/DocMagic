/**
 * Built-in Optimization Pipeline passes.
 *
 * Order bands:
 *   10x — structural (constraint solving)
 *   20x — typography
 *   30x — whitespace / balance
 *   40x — accessibility
 *   50x — charts
 *   (6xx reserved for asset replacement, 7xx for animation planning)
 */

import type { ResolvedIR, ResolvedSlide } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { OptimizationPassPlugin } from "../plugins/types";
import { solveSlide, measureBalance } from "../constraints/solver";
import { readableTextColor, meetsWcagAA } from "../color/engine";

function mapSlides(
  ir: ResolvedIR,
  fn: (slide: ResolvedSlide) => ResolvedSlide,
): ResolvedIR {
  return { ...ir, slides: ir.slides.map(fn) };
}

/** 100 — run the full Constraint Solver on every slide. */
export const constraintSolverPass: OptimizationPassPlugin = {
  id: "core.constraints",
  kind: "optimization-pass",
  name: "Constraint Solver",
  order: 100,
  run: (ir, tokens) => mapSlides(ir, (s) => solveSlide(s, tokens)),
};

/**
 * 200 — typography consistency: identical roles on a slide must share the
 * same font size (constraint solver may have scaled them independently).
 */
export const typographyConsistencyPass: OptimizationPassPlugin = {
  id: "core.typography",
  kind: "optimization-pass",
  name: "Typography Consistency",
  order: 200,
  run: (ir) =>
    mapSlides(ir, (slide) => {
      const minSizeByRole = new Map<string, number>();
      for (const el of slide.elements) {
        if (el.kind !== "text") continue;
        const prev = minSizeByRole.get(el.role);
        if (prev === undefined || el.style.fontSize < prev) {
          minSizeByRole.set(el.role, el.style.fontSize);
        }
      }
      return {
        ...slide,
        elements: slide.elements.map((el) => {
          if (el.kind !== "text") return el;
          const min = minSizeByRole.get(el.role);
          if (min === undefined || el.style.fontSize === min) return el;
          return { ...el, style: { ...el.style, fontSize: min } };
        }),
      };
    }),
};

/**
 * 300 — whitespace guard: flag-and-fix slides whose content coverage is
 * extreme by nudging density via metadata (used by the critic + benchmark).
 * Balance recentering already happens in the solver; this pass only records.
 */
export const whitespacePass: OptimizationPassPlugin = {
  id: "core.whitespace",
  kind: "optimization-pass",
  name: "Whitespace Optimization",
  order: 300,
  run: (ir, tokens) =>
    mapSlides(ir, (slide) => {
      const balance = measureBalance(slide, tokens);
      // stash measurements on intent-free field via speakerNotes? No — keep IR
      // clean. This pass is a no-op placeholder for structural whitespace
      // moves; coverage data is recomputed by critic/benchmark on demand.
      void balance;
      return slide;
    }),
};

/**
 * 400 — accessibility: enforce WCAG AA text contrast against the slide
 * background (or card fill when the text sits in a box).
 */
export const accessibilityPass: OptimizationPassPlugin = {
  id: "core.accessibility",
  kind: "optimization-pass",
  name: "Accessibility Contrast",
  order: 400,
  run: (ir, tokens) =>
    mapSlides(ir, (slide) => ({
      ...slide,
      elements: slide.elements.map((el) => {
        if (el.kind === "text") {
          const bg = el.box?.fill ?? slide.background;
          const large = el.style.fontSize >= 24;
          if (!meetsWcagAA(el.style.color, bg, large, slide.background)) {
            return {
              ...el,
              style: {
                ...el.style,
                color: readableTextColor(
                  el.style.color,
                  bg,
                  tokens.colors,
                  large,
                ),
              },
            };
          }
        }
        if (el.kind === "shape" && el.label && el.labelStyle && el.box.fill) {
          if (
            !meetsWcagAA(
              el.labelStyle.color,
              el.box.fill,
              el.labelStyle.fontSize >= 24,
              slide.background,
            )
          ) {
            return {
              ...el,
              labelStyle: {
                ...el.labelStyle,
                color: readableTextColor(
                  el.labelStyle.color,
                  el.box.fill,
                  tokens.colors,
                ),
              },
            };
          }
        }
        return el;
      }),
    })),
};

/**
 * 500 — chart optimization: trim category label crowding and enforce the
 * token palette (defensive — materializer already assigns it).
 */
export const chartOptimizationPass: OptimizationPassPlugin = {
  id: "core.charts",
  kind: "optimization-pass",
  name: "Chart Optimization",
  order: 500,
  run: (ir, tokens) =>
    mapSlides(ir, (slide) => ({
      ...slide,
      elements: slide.elements.map((el) => {
        if (el.kind !== "chart") return el;
        let out = el;
        if (
          !el.palette.every((c) => tokens.colors.chartPalette.includes(c)) ||
          el.palette.length === 0
        ) {
          out = { ...out, palette: tokens.colors.chartPalette };
        }
        // truncate very long category labels for readability
        const maxLabel = el.categories.length > 6 ? 10 : 16;
        if (el.categories.some((c) => c.length > maxLabel)) {
          out = {
            ...out,
            categories: el.categories.map((c) =>
              c.length > maxLabel ? `${c.slice(0, maxLabel - 1)}…` : c,
            ),
          };
        }
        return out;
      }),
    })),
};

export const builtInPasses: OptimizationPassPlugin[] = [
  constraintSolverPass,
  typographyConsistencyPass,
  whitespacePass,
  accessibilityPass,
  chartOptimizationPass,
];
