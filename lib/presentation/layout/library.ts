/**
 * Layout Library — semantic layouts, not templates.
 *
 * Each layout carries rich metadata (density, hierarchy, emphasis, whitespace,
 * visual rhythm, image ratio, content capacity) and a deterministic `place()`
 * function that assigns canvas frames to a slide's semantic elements.
 * Layout Intelligence selects layouts by scoring metadata against slide
 * semantics — never by hardcoded template IDs.
 */

import type {
  SemanticSlide,
  SemanticElement,
  Frame,
  SlideType,
} from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import {
  safeFrame,
  splitColumns,
  splitRows,
  splitGrid,
  canvasFrame,
} from "../constraints/geometry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LayoutMetadata {
  /** how much content this layout comfortably holds: 0 (sparse) – 1 (dense) */
  density: number;
  /** strength of visual hierarchy: 0 (flat) – 1 (strong focal point) */
  hierarchy: number;
  /** which element category the layout emphasizes */
  emphasis: "text" | "media" | "data" | "structure" | "balanced";
  /** proportion of canvas intentionally left empty: 0–1 */
  whitespace: number;
  /** repetition pattern of the layout */
  visualRhythm: "single-focus" | "columns" | "grid" | "flow" | "asymmetric";
  /** portion of canvas given to imagery: 0–1 */
  imageRatio: number;
  /** rough element-count capacity {min, max} */
  contentCapacity: { min: number; max: number };
}

export interface PlacedElement {
  elementId: string;
  frame: Frame;
  /** semantic region name, e.g. "title", "media", "item-2" */
  region: string;
}

export interface LayoutResult {
  placements: PlacedElement[];
}

export interface SlideLayout {
  id: string;
  name: string;
  suitedTypes: SlideType[];
  metadata: LayoutMetadata;
  place(slide: SemanticSlide, tokens: DesignTokens): LayoutResult;
}

// ---------------------------------------------------------------------------
// Element categorization helpers
// ---------------------------------------------------------------------------

export interface CategorizedElements {
  kicker?: SemanticElement;
  title?: SemanticElement;
  subtitle?: SemanticElement;
  texts: SemanticElement[]; // headings, body, bullets, captions
  media: SemanticElement[]; // images
  icons: SemanticElement[];
  metrics: SemanticElement[];
  charts: SemanticElement[];
  diagrams: SemanticElement[];
  tables: SemanticElement[];
  code: SemanticElement[];
  callouts: SemanticElement[];
}

export function categorize(slide: SemanticSlide): CategorizedElements {
  const out: CategorizedElements = {
    texts: [],
    media: [],
    icons: [],
    metrics: [],
    charts: [],
    diagrams: [],
    tables: [],
    code: [],
    callouts: [],
  };
  for (const el of slide.elements) {
    switch (el.kind) {
      case "text":
        if (el.role === "kicker" && !out.kicker) out.kicker = el;
        else if (el.role === "title" && !out.title) out.title = el;
        else if (el.role === "subtitle" && !out.subtitle) out.subtitle = el;
        else out.texts.push(el);
        break;
      case "image":
        out.media.push(el);
        break;
      case "icon":
        out.icons.push(el);
        break;
      case "metric":
        out.metrics.push(el);
        break;
      case "chart":
        out.charts.push(el);
        break;
      case "diagram":
        out.diagrams.push(el);
        break;
      case "table":
        out.tables.push(el);
        break;
      case "code":
        out.code.push(el);
        break;
      case "callout":
        out.callouts.push(el);
        break;
    }
  }
  return out;
}

/** items = everything that is not header material or full-bleed media */
function bodyItems(c: CategorizedElements): SemanticElement[] {
  return [
    ...c.metrics,
    ...c.charts,
    ...c.diagrams,
    ...c.tables,
    ...c.code,
    ...c.callouts,
    ...c.texts,
    ...c.icons,
  ];
}

/** Place the standard header stack (kicker, title, subtitle); returns content area below. */
function placeHeader(
  c: CategorizedElements,
  frame: Frame,
  tokens: DesignTokens,
  placements: PlacedElement[],
): Frame {
  let y = frame.y;
  const gap = tokens.spacing.unit;
  if (c.kicker) {
    placements.push({
      elementId: c.kicker.id,
      region: "kicker",
      frame: { x: frame.x, y, w: frame.w, h: 24 },
    });
    y += 24 + gap;
  }
  if (c.title) {
    const h = 64;
    placements.push({
      elementId: c.title.id,
      region: "title",
      frame: { x: frame.x, y, w: frame.w, h },
    });
    y += h + gap;
  }
  if (c.subtitle) {
    const h = 40;
    placements.push({
      elementId: c.subtitle.id,
      region: "subtitle",
      frame: { x: frame.x, y, w: frame.w, h },
    });
    y += h;
  }
  const consumed = y - frame.y;
  const contentY =
    frame.y + consumed + (consumed > 0 ? tokens.spacing.sectionGap : 0);
  return {
    x: frame.x,
    y: contentY,
    w: frame.w,
    h: Math.max(1, frame.y + frame.h - contentY),
  };
}

/** Distribute items into the frame: 1 item fills, 2-4 columns, 5+ grid. */
function placeItems(
  items: SemanticElement[],
  frame: Frame,
  tokens: DesignTokens,
  placements: PlacedElement[],
): void {
  if (items.length === 0) return;
  const gap = tokens.spacing.itemGap;
  let frames: Frame[];
  if (items.length === 1) {
    frames = [frame];
  } else if (items.length <= 4) {
    frames = splitColumns(frame, items.length, gap);
  } else {
    const cols = items.length <= 6 ? 3 : 4;
    const rows = Math.ceil(items.length / cols);
    frames = splitGrid(frame, rows, cols, gap);
  }
  items.forEach((el, i) => {
    placements.push({
      elementId: el.id,
      region: `item-${i + 1}`,
      frame: frames[i],
    });
  });
}

// ---------------------------------------------------------------------------
// The Layout Library
// ---------------------------------------------------------------------------

export const LAYOUT_LIBRARY: SlideLayout[] = [
  {
    id: "hero-centered",
    name: "Hero — Centered Statement",
    suitedTypes: ["hero", "section", "closing"],
    metadata: {
      density: 0.1,
      hierarchy: 1,
      emphasis: "text",
      whitespace: 0.7,
      visualRhythm: "single-focus",
      imageRatio: 0,
      contentCapacity: { min: 1, max: 4 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const gap = tokens.spacing.unit * 2;
      // vertically centered stack
      const stack: Array<{ el: SemanticElement; h: number; region: string }> =
        [];
      if (c.kicker) stack.push({ el: c.kicker, h: 24, region: "kicker" });
      if (c.title) stack.push({ el: c.title, h: 170, region: "title" });
      if (c.subtitle) stack.push({ el: c.subtitle, h: 70, region: "subtitle" });
      for (const t of c.texts.slice(0, 1))
        stack.push({ el: t, h: 56, region: "supporting" });
      const totalH =
        stack.reduce((s, e) => s + e.h, 0) +
        gap * Math.max(0, stack.length - 1);
      let y = safe.y + (safe.h - totalH) / 2;
      for (const entry of stack) {
        placements.push({
          elementId: entry.el.id,
          region: entry.region,
          frame: { x: safe.x, y, w: safe.w, h: entry.h },
        });
        y += entry.h + gap;
      }
      return { placements };
    },
  },
  {
    id: "hero-split",
    name: "Hero — Text / Media Split",
    suitedTypes: ["hero", "section", "content", "closing"],
    metadata: {
      density: 0.3,
      hierarchy: 0.9,
      emphasis: "media",
      whitespace: 0.4,
      visualRhythm: "asymmetric",
      imageRatio: 0.45,
      contentCapacity: { min: 2, max: 6 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const canvas = canvasFrame();
      const m = tokens.spacing.safeMargin;
      // media bleeds to the right edge
      const mediaW = canvas.w * 0.42;
      const textFrame: Frame = {
        x: m,
        y: m,
        w: canvas.w - mediaW - m - tokens.spacing.sectionGap,
        h: canvas.h - m * 2,
      };
      if (c.media[0]) {
        placements.push({
          elementId: c.media[0].id,
          region: "media",
          frame: { x: canvas.w - mediaW, y: 0, w: mediaW, h: canvas.h },
        });
      }
      const content = placeHeader(c, textFrame, tokens, placements);
      const rest = bodyItems(c).filter((e) => e !== c.media[0]);
      if (rest.length > 0) {
        const gap = tokens.spacing.itemGap;
        const rows = splitRows(content, Math.min(rest.length, 3), gap);
        rest.slice(0, 3).forEach((el, i) => {
          placements.push({
            elementId: el.id,
            region: `item-${i + 1}`,
            frame: rows[i],
          });
        });
      }
      return { placements };
    },
  },
  {
    id: "kpi-row",
    name: "KPI — Metric Row",
    suitedTypes: ["kpi", "dashboard", "content"],
    metadata: {
      density: 0.45,
      hierarchy: 0.7,
      emphasis: "data",
      whitespace: 0.45,
      visualRhythm: "columns",
      imageRatio: 0,
      contentCapacity: { min: 2, max: 6 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const metrics = c.metrics.slice(0, 5);
      const metricH = Math.min(200, content.h * 0.55);
      if (metrics.length > 0) {
        const row: Frame = {
          x: content.x,
          y: content.y,
          w: content.w,
          h: metricH,
        };
        const cols = splitColumns(row, metrics.length, tokens.spacing.itemGap);
        metrics.forEach((el, i) => {
          placements.push({
            elementId: el.id,
            region: `metric-${i + 1}`,
            frame: cols[i],
          });
        });
      }
      const rest = bodyItems(c).filter((e) => !metrics.includes(e));
      if (rest.length > 0) {
        const below: Frame = {
          x: content.x,
          y: content.y + metricH + tokens.spacing.sectionGap,
          w: content.w,
          h: Math.max(1, content.h - metricH - tokens.spacing.sectionGap),
        };
        placeItems(rest, below, tokens, placements);
      }
      return { placements };
    },
  },
  {
    id: "timeline-horizontal",
    name: "Timeline — Horizontal Flow",
    suitedTypes: ["timeline", "process", "roadmap"],
    metadata: {
      density: 0.5,
      hierarchy: 0.6,
      emphasis: "structure",
      whitespace: 0.4,
      visualRhythm: "flow",
      imageRatio: 0,
      contentCapacity: { min: 2, max: 8 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const structure = [...c.diagrams, ...c.tables];
      if (structure[0]) {
        placements.push({
          elementId: structure[0].id,
          region: "diagram",
          frame: content,
        });
      }
      const rest = bodyItems(c).filter((e) => e !== structure[0]);
      if (rest.length > 0 && structure[0]) {
        // squeeze diagram to 70%, rest below
        const diagramH = content.h * 0.68;
        placements[placements.length - 1].frame = { ...content, h: diagramH };
        const below: Frame = {
          x: content.x,
          y: content.y + diagramH + tokens.spacing.sectionGap,
          w: content.w,
          h: Math.max(1, content.h - diagramH - tokens.spacing.sectionGap),
        };
        placeItems(rest, below, tokens, placements);
      } else if (rest.length > 0) {
        placeItems(rest, content, tokens, placements);
      }
      return { placements };
    },
  },
  {
    id: "comparison-two-col",
    name: "Comparison — Two Columns",
    suitedTypes: ["comparison", "content", "swot"],
    metadata: {
      density: 0.55,
      hierarchy: 0.5,
      emphasis: "balanced",
      whitespace: 0.35,
      visualRhythm: "columns",
      imageRatio: 0.1,
      contentCapacity: { min: 2, max: 8 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const items = bodyItems(c);
      const gap = tokens.spacing.itemGap;
      if (items.length <= 2) {
        placeItems(items, content, tokens, placements);
      } else {
        // two columns, items stacked inside
        const cols = splitColumns(content, 2, tokens.spacing.sectionGap);
        const left = items.filter((_, i) => i % 2 === 0);
        const right = items.filter((_, i) => i % 2 === 1);
        const stack = (
          colItems: SemanticElement[],
          col: Frame,
          prefix: string,
        ) => {
          const rows = splitRows(col, Math.max(1, colItems.length), gap);
          colItems.forEach((el, i) => {
            placements.push({
              elementId: el.id,
              region: `${prefix}-${i + 1}`,
              frame: rows[i],
            });
          });
        };
        stack(left, cols[0], "left");
        stack(right, cols[1], "right");
      }
      return { placements };
    },
  },
  {
    id: "process-flow",
    name: "Process — Stepped Flow",
    suitedTypes: [
      "process",
      "timeline",
      "architecture",
      "flowchart",
      "funnel",
      "pyramid",
    ],
    metadata: {
      density: 0.5,
      hierarchy: 0.6,
      emphasis: "structure",
      whitespace: 0.4,
      visualRhythm: "flow",
      imageRatio: 0,
      contentCapacity: { min: 2, max: 7 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const structure = [...c.diagrams];
      if (structure[0]) {
        placements.push({
          elementId: structure[0].id,
          region: "diagram",
          frame: content,
        });
        const rest = bodyItems(c).filter((e) => e !== structure[0]);
        if (rest.length > 0) {
          const diagramH = content.h * 0.62;
          placements[placements.length - 1].frame = { ...content, h: diagramH };
          const below: Frame = {
            x: content.x,
            y: content.y + diagramH + tokens.spacing.sectionGap,
            w: content.w,
            h: Math.max(1, content.h - diagramH - tokens.spacing.sectionGap),
          };
          placeItems(rest, below, tokens, placements);
        }
      } else {
        placeItems(bodyItems(c), content, tokens, placements);
      }
      return { placements };
    },
  },
  {
    id: "architecture-canvas",
    name: "Architecture — Full Canvas Diagram",
    suitedTypes: [
      "architecture",
      "process",
      "flowchart",
      "orgchart",
      "swot",
      "funnel",
      "pyramid",
      "roadmap",
    ],
    metadata: {
      density: 0.65,
      hierarchy: 0.5,
      emphasis: "structure",
      whitespace: 0.3,
      visualRhythm: "grid",
      imageRatio: 0,
      contentCapacity: { min: 1, max: 4 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const structure = [...c.diagrams, ...c.charts, ...c.tables, ...c.code];
      if (structure[0]) {
        placements.push({
          elementId: structure[0].id,
          region: "diagram",
          frame: content,
        });
      }
      const rest = bodyItems(c).filter((e) => e !== structure[0]);
      // captions/callouts pinned to bottom strip
      if (rest.length > 0) {
        const stripH = 72;
        if (structure[0]) {
          placements[placements.length - 1].frame = {
            ...content,
            h: Math.max(1, content.h - stripH - tokens.spacing.sectionGap),
          };
        }
        const strip: Frame = {
          x: content.x,
          y: content.y + content.h - stripH,
          w: content.w,
          h: stripH,
        };
        placeItems(rest.slice(0, 3), strip, tokens, placements);
      }
      return { placements };
    },
  },
  {
    id: "gallery-grid",
    name: "Gallery — Media Grid",
    suitedTypes: ["gallery", "content"],
    metadata: {
      density: 0.6,
      hierarchy: 0.4,
      emphasis: "media",
      whitespace: 0.25,
      visualRhythm: "grid",
      imageRatio: 0.7,
      contentCapacity: { min: 2, max: 9 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const media = c.media;
      const gap = tokens.spacing.itemGap;
      if (media.length > 0) {
        let frames: Frame[];
        if (media.length === 1) frames = [content];
        else if (media.length === 2) frames = splitColumns(content, 2, gap);
        else if (media.length <= 4) frames = splitGrid(content, 2, 2, gap);
        else frames = splitGrid(content, 2, 3, gap);
        media.slice(0, frames.length).forEach((el, i) => {
          placements.push({
            elementId: el.id,
            region: `media-${i + 1}`,
            frame: frames[i],
          });
        });
      }
      return { placements };
    },
  },
  {
    id: "quote-centered",
    name: "Quote — Centered Statement",
    suitedTypes: ["quote", "section"],
    metadata: {
      density: 0.1,
      hierarchy: 1,
      emphasis: "text",
      whitespace: 0.75,
      visualRhythm: "single-focus",
      imageRatio: 0,
      contentCapacity: { min: 1, max: 3 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const quote = c.title ?? c.texts[0] ?? slide.elements[0];
      const attribution = c.subtitle ?? c.texts.find((t) => t !== quote);
      const quoteH = 220;
      const attrH = 40;
      const gap = tokens.spacing.unit * 3;
      const totalH = quoteH + (attribution ? attrH + gap : 0);
      const y = safe.y + (safe.h - totalH) / 2;
      const quoteInsetX = safe.x + safe.w * 0.08;
      const quoteW = safe.w * 0.84;
      if (quote) {
        placements.push({
          elementId: quote.id,
          region: "quote",
          frame: { x: quoteInsetX, y, w: quoteW, h: quoteH },
        });
      }
      if (attribution) {
        placements.push({
          elementId: attribution.id,
          region: "attribution",
          frame: { x: quoteInsetX, y: y + quoteH + gap, w: quoteW, h: attrH },
        });
      }
      return { placements };
    },
  },
  {
    id: "dashboard-grid",
    name: "Dashboard — Data Grid",
    suitedTypes: ["dashboard", "kpi", "content"],
    metadata: {
      density: 0.75,
      hierarchy: 0.5,
      emphasis: "data",
      whitespace: 0.2,
      visualRhythm: "grid",
      imageRatio: 0,
      contentCapacity: { min: 3, max: 9 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const gap = tokens.spacing.itemGap;
      const charts = [...c.charts, ...c.tables, ...c.diagrams];
      const small = [...c.metrics, ...c.callouts, ...c.texts];
      if (charts.length > 0 && small.length > 0) {
        // primary chart left (60%), small items stacked right
        const chartW = content.w * 0.6;
        placements.push({
          elementId: charts[0].id,
          region: "primary-chart",
          frame: { x: content.x, y: content.y, w: chartW, h: content.h },
        });
        const rightCol: Frame = {
          x: content.x + chartW + gap,
          y: content.y,
          w: content.w - chartW - gap,
          h: content.h,
        };
        const stackItems = [...charts.slice(1), ...small].slice(0, 4);
        const rows = splitRows(rightCol, Math.max(1, stackItems.length), gap);
        stackItems.forEach((el, i) => {
          placements.push({
            elementId: el.id,
            region: `side-${i + 1}`,
            frame: rows[i],
          });
        });
      } else {
        placeItems(bodyItems(c), content, tokens, placements);
      }
      return { placements };
    },
  },
  {
    id: "content-single",
    name: "Content — Single Column",
    suitedTypes: ["content", "agenda", "closing"],
    metadata: {
      density: 0.4,
      hierarchy: 0.6,
      emphasis: "text",
      whitespace: 0.5,
      visualRhythm: "flow",
      imageRatio: 0,
      contentCapacity: { min: 1, max: 6 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const items = bodyItems(c);
      if (items.length > 0) {
        // readable measure: cap width at 72% of content
        const colW = Math.min(content.w, content.w * 0.72 + 200);
        const col: Frame = { ...content, w: colW };
        const rows = splitRows(
          col,
          Math.max(1, items.length),
          tokens.spacing.itemGap,
        );
        items.forEach((el, i) => {
          placements.push({
            elementId: el.id,
            region: `row-${i + 1}`,
            frame: rows[i],
          });
        });
      }
      return { placements };
    },
  },
  {
    id: "content-media-right",
    name: "Content — Text Left, Media Right",
    suitedTypes: ["content", "comparison"],
    metadata: {
      density: 0.5,
      hierarchy: 0.6,
      emphasis: "balanced",
      whitespace: 0.35,
      visualRhythm: "asymmetric",
      imageRatio: 0.4,
      contentCapacity: { min: 2, max: 7 },
    },
    place(slide, tokens) {
      const placements: PlacedElement[] = [];
      const c = categorize(slide);
      const safe = safeFrame(tokens.spacing.safeMargin);
      const content = placeHeader(c, safe, tokens, placements);
      const gap = tokens.spacing.sectionGap;
      const cols = splitColumns(content, 2, gap);
      const media = c.media[0] ?? c.charts[0] ?? c.diagrams[0];
      if (media) {
        placements.push({
          elementId: media.id,
          region: "media",
          frame: cols[1],
        });
      }
      const items = bodyItems(c).filter((e) => e !== media);
      if (items.length > 0) {
        const target = media ? cols[0] : content;
        const rows = splitRows(
          target,
          Math.max(1, items.length),
          tokens.spacing.itemGap,
        );
        items.forEach((el, i) => {
          placements.push({
            elementId: el.id,
            region: `row-${i + 1}`,
            frame: rows[i],
          });
        });
      }
      return { placements };
    },
  },
];

export function getLayout(id: string): SlideLayout | undefined {
  return LAYOUT_LIBRARY.find((l) => l.id === id);
}
