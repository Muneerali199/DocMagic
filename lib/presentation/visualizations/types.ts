import type { SemanticElement } from "../ir/schema";
import type {
  PrimitiveBuildResult,
  VisualizationContext,
  VisualizationFamily,
} from "../visualization/types";

export const VISUALIZATION_CATEGORIES = [
  "market",
  "workflow",
  "architecture",
  "dashboard",
  "comparison",
  "timeline",
  "kpi",
  "pricing",
  "team",
  "quote",
  "gallery",
  "code",
] as const;

export type VisualizationCategory = (typeof VISUALIZATION_CATEGORIES)[number];
export type PresentationStyle =
  | "editorial"
  | "technical"
  | "executive"
  | "cinematic"
  | "product";
export type AspectPreference = "wide" | "balanced" | "tall";

export interface VisualizationPluginMetadata {
  label: string;
  description: string;
  readability: number;
  density: number;
  whitespace: number;
  hierarchy: number;
  presentationStyles: PresentationStyle[];
  supportedScenes: string[];
  preferredAspectRatio: AspectPreference;
  nativeKinds: SemanticElement["kind"][];
  editable: true;
}

export interface VisualizationPlugin {
  id: string;
  category: VisualizationCategory;
  family: VisualizationFamily;
  metadata: VisualizationPluginMetadata;
  supports(context: VisualizationContext): boolean;
  score(context: VisualizationContext): number;
  compose(context: VisualizationContext): PrimitiveBuildResult;
}

export interface RankedVisualizationPlugin {
  plugin: VisualizationPlugin;
  score: number;
  rationale: string[];
}

export const RENDERER_NATIVE_KINDS: ReadonlySet<SemanticElement["kind"]> =
  new Set([
    "text",
    "image",
    "icon",
    "chart",
    "diagram",
    "code",
    "table",
    "metric",
    "callout",
  ]);
