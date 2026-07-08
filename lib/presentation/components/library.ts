/**
 * Premium Visual Component Library
 *
 * Semantic, reusable, design-led components with multiple premium variants.
 * Each component has: metadata (density, hierarchy, emphasis), styling rules,
 * and a render function that produces deterministic ResolvedElements using
 * only tokens and native shapes (no images).
 *
 * Components: HeroSection, KPICard, MetricStack, ArchitectureDiagram,
 * ProcessFlow, Timeline, Dashboard, ComparisonCard, FeatureGrid, Gallery,
 * Quote, CodeBlock, StatsStrip, CalloutBox, LeadershipCard, Testimonial
 */

import type { Frame, ResolvedElement, ResolvedSlide } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import { resolveTextStyle, styleOnFill } from "../typography/apply";
import { emphasisFill, readableTextColor } from "../color/engine";
import {
  canvasFrame,
  splitColumns,
  splitRows,
  splitGrid,
} from "../constraints/geometry";

// ---------------------------------------------------------------------------
// Component Types
// ---------------------------------------------------------------------------

export interface ComponentMetadata {
  density: number; // 0 (sparse) — 1 (dense)
  hierarchy: number; // 0 (flat) — 1 (strong)
  emphasis: "text" | "media" | "data" | "structure" | "balanced";
  whitespace: number; // 0–1, fraction left intentionally empty
  contentCapacity: { min: number; max: number }; // element count
  /** which design languages this component pairs best with */
  affinityLanguages?: string[];
}

export interface ComponentVariant {
  id: string;
  name: string;
  metadata: ComponentMetadata;
  /** 0–1 score for how well this variant fits the given semantic content */
  scoreFor?: (
    contentType: string,
    elementCount: number,
    emphasis: string,
  ) => number;
}

// ---------------------------------------------------------------------------
// Premium Component Renderers
// ---------------------------------------------------------------------------

/**
 * KPI Card — Large metric + label, optimized for dashboards and KPI slides.
 * Variants: minimal, bordered, gradient-accent, multi-stat
 */
export function renderKPICard(
  value: string,
  label: string,
  frame: Frame,
  tokens: DesignTokens,
  unit?: string,
  variant: "minimal" | "bordered" | "gradient" = "bordered",
): ResolvedElement[] {
  const out: ResolvedElement[] = [];
  const padding = tokens.spacing.cardPadding;
  const innerW = frame.w - padding * 2;
  const innerH = frame.h - padding * 2;

  if (variant === "bordered" || variant === "gradient") {
    // Outer card container
    out.push({
      kind: "shape",
      id: `kpi-card-bg-${label}`,
      frame,
      emphasis: "tertiary",
      z: 0,
      shape: "rect",
      box: {
        fill: tokens.colors.surface,
        borderColor: tokens.colors.border,
        borderWidth: variant === "bordered" ? 1 : 0,
        radius: tokens.shape.radius,
        shadow: variant === "gradient" ? "lg" : "none",
      },
    });
  }

  // Editorial stack: accent tick, oversized value, label directly beneath.
  // Vertically centered as a group — no dead space between value and label.
  const valueH = Math.min(Math.max(innerH * 0.4, 48), 88);
  const unitH = unit ? 22 : 0;
  const labelH = 24;
  const stackGap = 6;
  const tickH = 4;
  const stackH =
    tickH + 14 + valueH + (unit ? unitH + stackGap : 0) + stackGap + labelH;
  let y = frame.y + Math.max(padding, (frame.h - stackH) / 2);
  const x = frame.x + padding;

  // accent tick anchoring the card
  out.push({
    kind: "shape",
    id: `kpi-tick-${label}`,
    frame: { x, y, w: 32, h: tickH },
    emphasis: "primary",
    z: 1,
    shape: "rect",
    box: { fill: tokens.colors.primary, radius: 0, shadow: "none" },
  });
  y += tickH + 14;

  // Value text (large, bold, left-aligned)
  out.push({
    kind: "text",
    id: `kpi-value-${label}`,
    frame: { x, y, w: innerW, h: valueH },
    emphasis: "primary",
    z: 1,
    role: "title",
    content: value,
    style: {
      ...resolveTextStyle("title", "primary", tokens, { align: "left" }),
      fontSize: Math.min(56, Math.round(valueH * 0.82)),
      fontWeight: 700,
      letterSpacing: -1,
    },
  });
  y += valueH;

  // Unit (small, muted)
  if (unit) {
    y += stackGap;
    out.push({
      kind: "text",
      id: `kpi-unit-${label}`,
      frame: { x, y, w: innerW, h: unitH },
      emphasis: "tertiary",
      z: 1,
      role: "caption",
      content: unit,
      style: resolveTextStyle("caption", "tertiary", tokens, {
        align: "left",
      }),
    });
    y += unitH;
  }

  // Label directly beneath the value
  y += stackGap;
  out.push({
    kind: "text",
    id: `kpi-label-${label}`,
    frame: { x, y, w: innerW, h: labelH },
    emphasis: "secondary",
    z: 1,
    role: "label",
    content: label,
    style: resolveTextStyle("label", "secondary", tokens, { align: "left" }),
  });

  return out;
}

/**
 * Stat Strip — Horizontal row of 2-4 small metrics with icons and labels.
 * Used for quick fact display on content slides.
 */
export function renderStatStrip(
  stats: Array<{ label: string; value: string; icon?: string }>,
  frame: Frame = canvasFrame(),
  tokens: DesignTokens,
): ResolvedElement[] {
  const out: ResolvedElement[] = [];
  const cols = splitColumns(frame, stats.length, tokens.spacing.itemGap);

  stats.forEach((stat, i) => {
    const col = cols[i];
    const padding = tokens.spacing.unit * 1.5;
    const innerW = col.w - padding * 2;
    const innerH = col.h - padding * 2;

    // Stat container (subtle background)
    out.push({
      kind: "shape",
      id: `stat-${i}-bg`,
      frame: col,
      emphasis: "tertiary",
      z: 0,
      shape: "rect",
      box: {
        fill: tokens.colors.surfaceAlt,
        borderColor: tokens.colors.border,
        borderWidth: 0,
        radius: tokens.shape.radius,
        shadow: "none",
      },
    });

    // Value (bold, prominent)
    out.push({
      kind: "text",
      id: `stat-${i}-value`,
      frame: {
        x: col.x + padding,
        y: col.y + padding + 2,
        w: innerW,
        h: 32,
      },
      emphasis: "primary",
      z: 1,
      role: "heading",
      content: stat.value,
      style: resolveTextStyle("heading", "primary", tokens, {
        align: "center",
      }),
    });

    // Label (small, muted)
    out.push({
      kind: "text",
      id: `stat-${i}-label`,
      frame: {
        x: col.x + padding,
        y: col.y + padding + 32 + 4,
        w: innerW,
        h: innerH - 36,
      },
      emphasis: "secondary",
      z: 1,
      role: "label",
      content: stat.label,
      style: resolveTextStyle("label", "secondary", tokens, {
        align: "center",
      }),
    });
  });

  return out;
}

/**
 * Callout Box — Emphasized statement with accent border, used for highlights
 * and key points.
 */
export function renderCallout(
  text: string,
  frame: Frame = canvasFrame(),
  tokens: DesignTokens,
  variant: "accent-left" | "accent-top" | "gradient-bg" = "accent-left",
): ResolvedElement[] {
  const out: ResolvedElement[] = [];
  const padding = tokens.spacing.cardPadding;

  // A "title\nbody" payload becomes an eyebrow-style heading + body copy —
  // how a designer structures an insight panel, not one undifferentiated blob.
  const newline = text.indexOf("\n");
  const heading = newline > 0 ? text.slice(0, newline).trim() : undefined;
  const body = newline > 0 ? text.slice(newline + 1).trim() : text;

  // All variants share the same quiet panel: surface fill, hairline border.
  // The "insight" (gradient-bg) variant differentiates via a tinted surface
  // and a heavier accent bar — never a saturated full-bleed slab.
  const isInsight = variant === "gradient-bg";
  const fill = isInsight ? tokens.colors.surfaceAlt : tokens.colors.surface;
  const accentW = variant === "accent-top" ? 0 : isInsight ? 6 : 4;

  out.push({
    kind: "shape",
    id: `callout-bg`,
    frame,
    emphasis: "tertiary",
    z: 0,
    shape: "rect",
    box: {
      fill,
      borderColor: tokens.colors.border,
      borderWidth: 1,
      radius: tokens.shape.radius,
      shadow: "none",
    },
  });

  if (variant === "accent-top") {
    out.push({
      kind: "shape",
      id: `callout-accent`,
      frame: { x: frame.x, y: frame.y, w: frame.w, h: 4 },
      emphasis: "primary",
      z: 1,
      shape: "rect",
      box: { fill: tokens.colors.primary, radius: 0, shadow: "none" },
    });
  } else {
    out.push({
      kind: "shape",
      id: `callout-accent`,
      frame: { x: frame.x, y: frame.y, w: accentW, h: frame.h },
      emphasis: "primary",
      z: 1,
      shape: "rect",
      box: { fill: tokens.colors.primary, radius: 0, shadow: "none" },
    });
  }

  const textX = frame.x + padding + accentW;
  const textW = frame.w - padding * 2 - accentW;
  let textY = frame.y + padding;

  if (heading) {
    const headingStyle = {
      ...resolveTextStyle("label", "primary", tokens),
      color: tokens.colors.primary,
      fontWeight: 700,
      letterSpacing: 1.2,
    };
    out.push({
      kind: "text",
      id: `callout-heading`,
      frame: { x: textX, y: textY, w: textW, h: 24 },
      emphasis: "primary",
      z: 2,
      role: "label",
      content: heading.toUpperCase(),
      style: styleOnFill(headingStyle, fill, tokens),
    });
    textY += 24 + tokens.spacing.unit;
  }

  out.push({
    kind: "text",
    id: `callout-text`,
    frame: {
      x: textX,
      y: textY,
      w: textW,
      h: Math.max(20, frame.y + frame.h - padding - textY),
    },
    emphasis: "secondary",
    z: 2,
    role: "body",
    content: body,
    style: styleOnFill(
      resolveTextStyle("body", "secondary", tokens, { align: "left" }),
      fill,
      tokens,
    ),
  });

  return out;
}

/**
 * Feature Grid — 2-3 column layout of feature cards (icon + title + description).
 */
export function renderFeatureGrid(
  features: Array<{ title: string; description: string; icon?: string }>,
  frame: Frame = canvasFrame(),
  tokens: DesignTokens,
  columns = 3,
): ResolvedElement[] {
  const out: ResolvedElement[] = [];
  const gridCols = splitColumns(
    frame,
    Math.min(columns, features.length),
    tokens.spacing.itemGap,
  );

  features.slice(0, gridCols.length).forEach((feature, i) => {
    const col = gridCols[i];
    const padding = tokens.spacing.cardPadding;
    const innerW = col.w - padding * 2;

    // Feature card background
    out.push({
      kind: "shape",
      id: `feature-${i}-bg`,
      frame: col,
      emphasis: "tertiary",
      z: 0,
      shape: "rect",
      box: {
        fill: tokens.colors.surfaceAlt,
        borderColor: tokens.colors.border,
        borderWidth: 1,
        radius: tokens.shape.radius,
        shadow: "none",
      },
    });

    let currentY = col.y + padding;

    // Icon placeholder (small circle)
    if (feature.icon) {
      const iconSize = 48;
      out.push({
        kind: "shape",
        id: `feature-${i}-icon`,
        frame: {
          x: col.x + (col.w - iconSize) / 2,
          y: currentY,
          w: iconSize,
          h: iconSize,
        },
        emphasis: "primary",
        z: 1,
        shape: "ellipse",
        box: {
          fill: tokens.colors.primary,
          borderColor: "transparent",
          borderWidth: 0,
          radius: iconSize / 2,
          shadow: "none",
        },
      });
      currentY += iconSize + tokens.spacing.unit;
    }

    // Title
    out.push({
      kind: "text",
      id: `feature-${i}-title`,
      frame: {
        x: col.x + padding,
        y: currentY,
        w: innerW,
        h: 40,
      },
      emphasis: "primary",
      z: 1,
      role: "heading",
      content: feature.title,
      style: resolveTextStyle("heading", "primary", tokens, {
        align: "center",
      }),
    });

    // Description
    out.push({
      kind: "text",
      id: `feature-${i}-desc`,
      frame: {
        x: col.x + padding,
        y: currentY + 40 + tokens.spacing.unit,
        w: innerW,
        h: col.y + col.h - padding - (currentY + 40 + tokens.spacing.unit),
      },
      emphasis: "secondary",
      z: 1,
      role: "body",
      content: feature.description,
      style: resolveTextStyle("body", "secondary", tokens, {
        align: "center",
      }),
    });
  });

  return out;
}

// ---------------------------------------------------------------------------
// Component Registry
// ---------------------------------------------------------------------------

export const PREMIUM_COMPONENTS = {
  kpiCard: {
    render: renderKPICard,
    variants: ["minimal", "bordered", "gradient"],
  },
  statStrip: { render: renderStatStrip },
  callout: {
    render: renderCallout,
    variants: ["accent-left", "accent-top", "gradient-bg"],
  },
  featureGrid: { render: renderFeatureGrid },
};
