/**
 * Presentation IR — the single source of truth for the v2 compiler pipeline.
 *
 * Two stages:
 *  1. Semantic IR  — produced by the Narrative Planner (LLM). Carries meaning,
 *     content, and intent. NO coordinates, NO colors, NO font sizes.
 *  2. Resolved IR  — produced by the deterministic pipeline. Every element has
 *     a frame on the 1280x720 canvas and fully resolved style tokens.
 *
 * Renderer targets (Presentation Compiler) consume ONLY Resolved IR.
 */

import { z } from "zod";

export const IR_VERSION = "2.0.0";

export const CANVAS = {
  width: 1280,
  height: 720,
} as const;

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const EmphasisSchema = z.enum(["primary", "secondary", "tertiary"]);
export type Emphasis = z.infer<typeof EmphasisSchema>;

export const SlideTypeSchema = z.enum([
  "hero",
  "kpi",
  "timeline",
  "comparison",
  "process",
  "flowchart",
  "architecture",
  "orgchart",
  "swot",
  "funnel",
  "pyramid",
  "roadmap",
  "gallery",
  "quote",
  "dashboard",
  "content",
  "agenda",
  "section",
  "closing",
]);
export type SlideType = z.infer<typeof SlideTypeSchema>;

export const TextRoleSchema = z.enum([
  "title",
  "subtitle",
  "heading",
  "body",
  "bullet",
  "caption",
  "label",
  "kicker",
]);
export type TextRole = z.infer<typeof TextRoleSchema>;

// ---------------------------------------------------------------------------
// Semantic elements (discriminated union) — NO positions
// ---------------------------------------------------------------------------

const baseElement = {
  id: z.string(),
  emphasis: EmphasisSchema.default("secondary"),
};

export const SemanticTextSchema = z.object({
  ...baseElement,
  kind: z.literal("text"),
  role: TextRoleSchema,
  content: z.string(),
  /** Optional bullet items when role === "bullet" */
  items: z.array(z.string()).optional(),
});

export const SemanticImageSchema = z.object({
  ...baseElement,
  kind: z.literal("image"),
  /** semantic description used by Asset Intelligence to find/rank an asset */
  query: z.string(),
  alt: z.string(),
  /** resolved asset url may be attached before layout */
  src: z.string().optional(),
  aspect: z.enum(["wide", "square", "tall", "auto"]).default("auto"),
});

export const SemanticIconSchema = z.object({
  ...baseElement,
  kind: z.literal("icon"),
  /** lucide icon name or semantic query */
  name: z.string(),
  label: z.string().optional(),
});

export const ChartSeriesSchema = z.object({
  name: z.string(),
  data: z.array(z.number()),
});

export const SemanticChartSchema = z.object({
  ...baseElement,
  kind: z.literal("chart"),
  chartType: z.enum([
    "bar",
    "line",
    "area",
    "pie",
    "doughnut",
    "radar",
    "scatter",
  ]),
  title: z.string().optional(),
  categories: z.array(z.string()),
  series: z.array(ChartSeriesSchema).min(1),
});

export const DiagramNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  sublabel: z.string().optional(),
  /** semantic grouping — swim-lane / track name (roadmap), team (orgchart), tier (architecture) */
  group: z.string().optional(),
  emphasis: EmphasisSchema.default("secondary"),
});

export const DiagramEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});

export const SemanticDiagramSchema = z.object({
  ...baseElement,
  kind: z.literal("diagram"),
  diagramType: z.enum([
    "flow",
    "flowchart",
    "timeline",
    "comparison",
    "pyramid",
    "process",
    "funnel",
    "cycle",
    "swot",
    "architecture",
    "orgchart",
    "roadmap",
  ]),
  nodes: z.array(DiagramNodeSchema).min(1),
  edges: z.array(DiagramEdgeSchema).default([]),
});

export const SemanticCodeSchema = z.object({
  ...baseElement,
  kind: z.literal("code"),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
});

export const SemanticTableSchema = z.object({
  ...baseElement,
  kind: z.literal("table"),
  headers: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

export const SemanticMetricSchema = z.object({
  ...baseElement,
  kind: z.literal("metric"),
  value: z.string(),
  label: z.string(),
  delta: z.string().optional(),
  trend: z.enum(["up", "down", "flat"]).optional(),
});

export const SemanticCalloutSchema = z.object({
  ...baseElement,
  kind: z.literal("callout"),
  tone: z.enum(["info", "success", "warning", "insight"]).default("info"),
  title: z.string().optional(),
  content: z.string(),
});

export const SemanticElementSchema = z.discriminatedUnion("kind", [
  SemanticTextSchema,
  SemanticImageSchema,
  SemanticIconSchema,
  SemanticChartSchema,
  SemanticDiagramSchema,
  SemanticCodeSchema,
  SemanticTableSchema,
  SemanticMetricSchema,
  SemanticCalloutSchema,
]);
export type SemanticElement = z.infer<typeof SemanticElementSchema>;

// ---------------------------------------------------------------------------
// Semantic IR
// ---------------------------------------------------------------------------

export const SemanticSlideSchema = z.object({
  id: z.string(),
  type: SlideTypeSchema,
  /** what this slide is trying to communicate — used by Layout Intelligence */
  intent: z.string(),
  elements: z.array(SemanticElementSchema).min(1),
  speakerNotes: z.string().optional(),
});
export type SemanticSlide = z.infer<typeof SemanticSlideSchema>;

export const PresentationStrategySchema = z.object({
  intent: z.string(),
  audience: z.string(),
  goal: z.string(),
  storytellingStrategy: z.enum([
    "problem-solution",
    "hero-journey",
    "before-after",
    "data-story",
    "pitch",
    "educational",
    "chronological",
    "comparison",
  ]),
  deckLength: z.number().int().min(3).max(30),
  tone: z.enum([
    "professional",
    "bold",
    "friendly",
    "technical",
    "inspirational",
    "minimal",
  ]),
  /** hint only — Design Engine makes the final call */
  suggestedDesignLanguage: z.string().optional(),
});
export type PresentationStrategy = z.infer<typeof PresentationStrategySchema>;

export const SemanticIRSchema = z.object({
  version: z.literal(IR_VERSION).default(IR_VERSION),
  stage: z.literal("semantic").default("semantic"),
  title: z.string(),
  strategy: PresentationStrategySchema,
  slides: z.array(SemanticSlideSchema).min(1),
});
export type SemanticIR = z.infer<typeof SemanticIRSchema>;

// ---------------------------------------------------------------------------
// Resolved IR — every element positioned + styled via resolved tokens
// ---------------------------------------------------------------------------

export const FrameSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
});
export type Frame = z.infer<typeof FrameSchema>;

/** Fully resolved text style — actual values, resolved FROM design tokens. */
export const ResolvedTextStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.number(),
  lineHeight: z.number(),
  letterSpacing: z.number().default(0),
  color: z.string(),
  align: z.enum(["left", "center", "right"]).default("left"),
  textTransform: z.enum(["none", "uppercase"]).default("none"),
});
export type ResolvedTextStyle = z.infer<typeof ResolvedTextStyleSchema>;

export const ResolvedBoxStyleSchema = z.object({
  fill: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
  radius: z.number().default(0),
  shadow: z.enum(["none", "sm", "md", "lg"]).default("none"),
});
export type ResolvedBoxStyle = z.infer<typeof ResolvedBoxStyleSchema>;

const resolvedBase = {
  id: z.string(),
  frame: FrameSchema,
  emphasis: EmphasisSchema,
  /** z-order, higher renders on top */
  z: z.number().int().default(0),
};

export const ResolvedTextSchema = z.object({
  ...resolvedBase,
  kind: z.literal("text"),
  role: TextRoleSchema,
  content: z.string(),
  items: z.array(z.string()).optional(),
  style: ResolvedTextStyleSchema,
  box: ResolvedBoxStyleSchema.optional(),
});

export const ResolvedImageSchema = z.object({
  ...resolvedBase,
  kind: z.literal("image"),
  src: z.string(),
  alt: z.string(),
  fit: z.enum(["cover", "contain"]).default("cover"),
  box: ResolvedBoxStyleSchema.optional(),
});

export const ResolvedIconSchema = z.object({
  ...resolvedBase,
  kind: z.literal("icon"),
  name: z.string(),
  color: z.string(),
  box: ResolvedBoxStyleSchema.optional(),
});

export const ResolvedChartSchema = z.object({
  ...resolvedBase,
  kind: z.literal("chart"),
  chartType: z.enum([
    "bar",
    "line",
    "area",
    "pie",
    "doughnut",
    "radar",
    "scatter",
  ]),
  title: z.string().optional(),
  categories: z.array(z.string()),
  series: z.array(ChartSeriesSchema),
  palette: z.array(z.string()),
  gridColor: z.string(),
  labelStyle: ResolvedTextStyleSchema,
});

export const ResolvedShapeSchema = z.object({
  ...resolvedBase,
  kind: z.literal("shape"),
  shape: z.enum([
    "rect",
    "roundRect",
    "ellipse",
    "line",
    "arrow",
    "chevron",
    "triangle",
  ]),
  /** for line/arrow: endpoint relative to frame origin */
  points: z
    .object({ x1: z.number(), y1: z.number(), x2: z.number(), y2: z.number() })
    .optional(),
  box: ResolvedBoxStyleSchema,
  /** optional label rendered inside the shape */
  label: z.string().optional(),
  sublabel: z.string().optional(),
  labelStyle: ResolvedTextStyleSchema.optional(),
});

export const ResolvedTableSchema = z.object({
  ...resolvedBase,
  kind: z.literal("table"),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  headerStyle: ResolvedTextStyleSchema,
  cellStyle: ResolvedTextStyleSchema,
  headerFill: z.string(),
  rowFillAlt: z.string().optional(),
  borderColor: z.string(),
});

export const ResolvedCodeSchema = z.object({
  ...resolvedBase,
  kind: z.literal("code"),
  language: z.string(),
  code: z.string(),
  style: ResolvedTextStyleSchema,
  box: ResolvedBoxStyleSchema,
});

export const ResolvedElementSchema = z.discriminatedUnion("kind", [
  ResolvedTextSchema,
  ResolvedImageSchema,
  ResolvedIconSchema,
  ResolvedChartSchema,
  ResolvedShapeSchema,
  ResolvedTableSchema,
  ResolvedCodeSchema,
]);
export type ResolvedElement = z.infer<typeof ResolvedElementSchema>;

export const ResolvedSlideSchema = z.object({
  id: z.string(),
  type: SlideTypeSchema,
  intent: z.string(),
  /** layout id selected by Layout Intelligence (from the Layout Library) */
  layoutId: z.string(),
  background: z.string(),
  /** optional decorative background accent color band/blob is expressed as shapes */
  elements: z.array(ResolvedElementSchema),
  speakerNotes: z.string().optional(),
});
export type ResolvedSlide = z.infer<typeof ResolvedSlideSchema>;

export const CriticIssueSchema = z.object({
  slideId: z.string().optional(),
  elementId: z.string().optional(),
  severity: z.enum(["info", "warning", "error"]),
  code: z.string(),
  message: z.string(),
});
export type CriticIssue = z.infer<typeof CriticIssueSchema>;

export const CriticReportSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(CriticIssueSchema),
  recommendations: z.array(z.string()),
});
export type CriticReport = z.infer<typeof CriticReportSchema>;

export const ResolvedIRSchema = z.object({
  version: z.literal(IR_VERSION).default(IR_VERSION),
  stage: z.literal("resolved").default("resolved"),
  title: z.string(),
  strategy: PresentationStrategySchema,
  designLanguage: z.string(),
  canvas: z.object({ width: z.number(), height: z.number() }).default(CANVAS),
  slides: z.array(ResolvedSlideSchema).min(1),
  critic: CriticReportSchema.optional(),
});
export type ResolvedIR = z.infer<typeof ResolvedIRSchema>;
