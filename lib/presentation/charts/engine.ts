/**
 * Chart engine — deterministic conversion of semantic chart specs into
 * resolved native chart elements with real data series. Compiler targets
 * render these as native charts (PPTX addChart / SVG in HTML), never images.
 *
 * Registered as the built-in ChartPlugin.
 */

import type { z } from "zod";
import type { SemanticChartSchema, Frame, ResolvedElement } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import { resolveTextStyle } from "../typography/apply";
import type { ChartPlugin } from "../plugins/types";

export type SemanticChart = z.infer<typeof SemanticChartSchema>;

/** Trim series to what the frame can legibly display. */
function legibleData(
  chart: SemanticChart,
  frame: Frame,
): Pick<SemanticChart, "categories" | "series"> {
  // ~64px per category for bar/line legibility
  const maxCategories = Math.max(3, Math.floor(frame.w / 64));
  const maxSeries = 4;
  const categories = chart.categories.slice(0, maxCategories);
  const series = chart.series.slice(0, maxSeries).map((s) => ({
    name: s.name,
    data: s.data.slice(0, categories.length),
  }));
  return { categories, series };
}

export function resolveChart(
  chart: SemanticChart,
  frame: Frame,
  tokens: DesignTokens,
): ResolvedElement {
  const { categories, series } = legibleData(chart, frame);
  return {
    kind: "chart",
    id: chart.id,
    frame,
    emphasis: chart.emphasis,
    z: 1,
    chartType: chart.chartType,
    title: chart.title,
    categories,
    series,
    palette: tokens.colors.chartPalette,
    gridColor: tokens.colors.border,
    labelStyle: resolveTextStyle("caption", "tertiary", tokens),
  };
}

export const builtinChartPlugin: ChartPlugin = {
  id: "builtin-charts",
  kind: "chart",
  name: "Built-in Chart Engine",
  supports: ["bar", "line", "area", "pie", "doughnut", "radar", "scatter"],
  resolve: resolveChart,
};
