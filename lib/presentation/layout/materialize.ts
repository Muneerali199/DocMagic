/**
 * Materializer — converts placed semantic elements into fully styled
 * ResolvedElements by delegating to the typography, color, diagram, and
 * chart engines. Deterministic; every visual value resolves from tokens.
 */

import type {
  SemanticElement,
  SemanticSlide,
  ResolvedElement,
  ResolvedSlide,
  Frame,
} from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { LayoutResult } from "./library";
import { resolveTextStyle, styleOnFill } from "../typography/apply";
import { emphasisFill } from "../color/engine";
import type { PluginRegistry } from "../plugins/registry";
import type { ChartPlugin, DiagramPlugin } from "../plugins/types";
import {
  renderKPICard,
  renderCallout,
  renderStatStrip,
  renderFeatureGrid,
} from "../components/library";

function card(tokens: DesignTokens) {
  return {
    fill: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderWidth: tokens.shape.borderWidth,
    radius: tokens.shape.radius,
    shadow: tokens.shape.shadow,
  };
}

function materializeElement(
  el: SemanticElement,
  frame: Frame,
  slide: SemanticSlide,
  tokens: DesignTokens,
  registry: PluginRegistry,
  centered: boolean,
): ResolvedElement[] {
  switch (el.kind) {
    case "text": {
      const align =
        centered &&
        (el.role === "title" || el.role === "subtitle" || el.role === "kicker")
          ? "center"
          : "left";
      return [
        {
          kind: "text",
          id: el.id,
          frame,
          emphasis: el.emphasis,
          z: 1,
          role: el.role,
          content: el.content,
          items: el.items,
          style: resolveTextStyle(el.role, el.emphasis, tokens, {
            slideType: slide.type,
            align,
          }),
        },
      ];
    }

    case "image":
      return [
        {
          kind: "image",
          id: el.id,
          frame,
          emphasis: el.emphasis,
          z: 0,
          src: el.src ?? "",
          alt: el.alt,
          fit: "cover",
          box: { radius: tokens.shape.radiusLg, shadow: "none" },
        },
      ];

    case "icon":
      return [
        {
          kind: "icon",
          id: el.id,
          frame,
          emphasis: el.emphasis,
          z: 1,
          name: el.name,
          color:
            el.emphasis === "primary"
              ? tokens.colors.primary
              : tokens.colors.mutedForeground,
        },
      ];

    case "metric": {
      // Use premium KPI card component for metrics in KPI/dashboard contexts
      if (slide.type === "kpi" || slide.type === "dashboard") {
        return renderKPICard(el.value, el.label, frame, tokens, el.unit, "bordered");
      }

      // Fallback to traditional card style
      const pad = tokens.spacing.cardPadding;
      const boxStyle = card(tokens);
      const valueStyle = {
        ...resolveTextStyle("title", el.emphasis, tokens),
        fontSize: tokens.typography.scale.metricValue.size,
        fontWeight: tokens.typography.scale.metricValue.weight,
        lineHeight: tokens.typography.scale.metricValue.lineHeight,
        letterSpacing: tokens.typography.scale.metricValue.letterSpacing,
        color:
          el.emphasis === "primary"
            ? tokens.colors.primary
            : tokens.colors.foreground,
      };
      const labelStyle = resolveTextStyle("label", "tertiary", tokens);
      const valueH = Math.min(64, frame.h * 0.45);
      const deltaText = el.delta
        ? `${el.trend === "up" ? "▲" : el.trend === "down" ? "▼" : ""} ${el.delta}`.trim()
        : undefined;
      const out: ResolvedElement[] = [
        {
          kind: "shape",
          id: `${el.id}:card`,
          frame,
          emphasis: el.emphasis,
          z: 0,
          shape: tokens.shape.radius > 0 ? "roundRect" : "rect",
          box: boxStyle,
        },
        {
          kind: "text",
          id: `${el.id}:value`,
          frame: {
            x: frame.x + pad,
            y: frame.y + pad,
            w: frame.w - pad * 2,
            h: valueH,
          },
          emphasis: el.emphasis,
          z: 1,
          role: "title",
          content: el.value,
          style: styleOnFill(valueStyle, boxStyle.fill, tokens),
        },
        {
          kind: "text",
          id: `${el.id}:label`,
          frame: {
            x: frame.x + pad,
            y: frame.y + pad + valueH + tokens.spacing.unit,
            w: frame.w - pad * 2,
            h: Math.max(
              20,
              frame.h -
                pad * 2 -
                valueH -
                tokens.spacing.unit -
                (deltaText ? 24 : 0),
            ),
          },
          emphasis: "tertiary",
          z: 1,
          role: "label",
          content: el.label,
          style: styleOnFill(labelStyle, boxStyle.fill, tokens),
        },
      ];
      if (deltaText) {
        out.push({
          kind: "text",
          id: `${el.id}:delta`,
          frame: {
            x: frame.x + pad,
            y: frame.y + frame.h - pad - 22,
            w: frame.w - pad * 2,
            h: 22,
          },
          emphasis: "tertiary",
          z: 1,
          role: "caption",
          content: deltaText,
          style: {
            ...resolveTextStyle("caption", "tertiary", tokens),
            color:
              el.trend === "down"
                ? tokens.colors.negative
                : tokens.colors.positive,
          },
        });
      }
      return out;
    }

    case "callout": {
      // Use premium callout component for emphasis
      return renderCallout(
        el.title ? `${el.title}\n${el.content}` : el.content,
        frame,
        tokens,
        el.tone === "insight" ? "gradient-bg" : "accent-left",
      );
    }

    case "chart": {
      const plugins = registry.all<ChartPlugin>("chart");
      const plugin =
        plugins.find((p) => p.supports.includes(el.chartType)) ?? plugins[0];
      if (!plugin) return [];
      return [plugin.resolve(el, frame, tokens)];
    }

    case "diagram": {
      const plugins = registry.all<DiagramPlugin>("diagram");
      const plugin =
        plugins.find((p) => p.supports.includes(el.diagramType)) ?? plugins[0];
      if (!plugin) return [];
      return plugin.layout(el, frame, tokens);
    }

    case "table":
      return [
        {
          kind: "table",
          id: el.id,
          frame,
          emphasis: el.emphasis,
          z: 1,
          headers: el.headers,
          rows: el.rows,
          headerStyle: styleOnFill(
            resolveTextStyle("label", "primary", tokens),
            tokens.colors.primary,
            tokens,
          ),
          cellStyle: resolveTextStyle("body", "secondary", tokens),
          headerFill: tokens.colors.primary,
          rowFillAlt: tokens.colors.surface,
          borderColor: tokens.colors.border,
        },
      ];

    case "code": {
      const codeStyle = {
        ...resolveTextStyle("body", el.emphasis, tokens),
        fontFamily: tokens.typography.monoFamily,
        fontSize: tokens.typography.scale.code.size,
        lineHeight: tokens.typography.scale.code.lineHeight,
      };
      return [
        {
          kind: "code",
          id: el.id,
          frame,
          emphasis: el.emphasis,
          z: 1,
          language: el.language,
          code: el.code,
          style: styleOnFill(codeStyle, tokens.colors.surfaceAlt, tokens),
          box: { ...card(tokens), fill: tokens.colors.surfaceAlt },
        },
      ];
    }
  }
}

export function materializeSlide(
  slide: SemanticSlide,
  layoutId: string,
  layout: LayoutResult,
  tokens: DesignTokens,
  registry: PluginRegistry,
): ResolvedSlide {
  const centered =
    slide.type === "hero" ||
    slide.type === "quote" ||
    slide.type === "section" ||
    slide.type === "closing";
  const frameById = new Map(
    layout.placements.map((p) => [p.elementId, p.frame]),
  );
  const elements: ResolvedElement[] = [];
  for (const el of slide.elements) {
    const frame = frameById.get(el.id);
    if (!frame) continue; // layout chose to omit this element
    elements.push(
      ...materializeElement(el, frame, slide, tokens, registry, centered),
    );
  }
  return {
    id: slide.id,
    type: slide.type,
    intent: slide.intent,
    layoutId,
    background: tokens.colors.background,
    elements,
    speakerNotes: slide.speakerNotes,
  };
}
