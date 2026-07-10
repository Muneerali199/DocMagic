import type { CompositionPlan } from "../composer/types";
import type { SemanticElement, SemanticSlide, SlideType } from "../ir/schema";
import type { SceneAssignment, SceneId } from "../scene/types";

export const VISUALIZATION_PRIMITIVE_IDS = [
  "market-map",
  "workflow-pipeline",
  "architecture-topology",
  "dashboard-surface",
  "cli-terminal",
  "ide-editor",
  "mobile-product",
  "browser-product",
  "hero-metrics",
  "timeline-story",
  "comparison-board",
  "pricing-matrix",
  "team-map",
  "editorial-quote",
  "gallery-showcase",
  "editable-code",
  "generic-native",
] as const;

export type VisualizationPrimitiveId = (typeof VISUALIZATION_PRIMITIVE_IDS)[number];
export type VisualizationFamily =
  | "market"
  | "process"
  | "system"
  | "product"
  | "data"
  | "story"
  | "people"
  | "content"
  | "fallback";

export interface SemanticProfile {
  slideId: string;
  slideType: SlideType;
  scene: SceneId;
  kinds: Record<SemanticElement["kind"], number>;
  diagramTypes: string[];
  diagramNodeCount: number;
  diagramEdgeCount: number;
  diagramGroupCount: number;
  metricCount: number;
  chartCount: number;
  tableColumns: number;
  tableRows: number;
  codeLanguages: string[];
  mediaCount: number;
  textCount: number;
  iconCount: number;
  grouping: CompositionPlan["groupingStrategy"];
  comparison: CompositionPlan["comparisonStyle"];
  metricEmphasis: CompositionPlan["metricEmphasis"];
  focal: CompositionPlan["focal"];
  imagePriority: number;
  diagramPriority: number;
}

/** Coordinate-free semantic description for downstream diagnostics and editors. */
export interface VisualizationBlueprint {
  family: VisualizationFamily;
  variant: string;
  dominantRole: string;
  supportingRoles: string[];
  nativeKinds: SemanticElement["kind"][];
  editable: true;
  surface?: "dashboard" | "terminal" | "editor" | "mobile" | "browser";
  chrome?: string[];
}

export interface VisualizationAssignment {
  slideId: string;
  primitiveId: VisualizationPrimitiveId | string;
  family: VisualizationFamily;
  variant: string;
  confidence: number;
  rationale: string[];
  blueprint: VisualizationBlueprint;
  generatedElementIds: string[];
}

export interface VisualizationResult {
  slides: SemanticSlide[];
  assignments: VisualizationAssignment[];
}

export interface VisualizationContext {
  slide: SemanticSlide;
  scene: SceneAssignment;
  composition: CompositionPlan;
  profile: SemanticProfile;
}

export interface PrimitiveBuildResult {
  elements: SemanticElement[];
  variant: string;
  blueprint: VisualizationBlueprint;
}

export interface VisualizationPrimitive {
  id: VisualizationPrimitiveId | string;
  family: VisualizationFamily;
  priority?: number;
  score(profile: SemanticProfile): number;
  build(context: VisualizationContext): PrimitiveBuildResult;
}

export interface VisualizationEngineOptions {
  registry?: VisualizationRegistryContract;
  /** Minimum specialized score. Lower-scoring slides retain native content. */
  minimumScore?: number;
}

export interface VisualizationRegistryContract {
  register(primitive: VisualizationPrimitive): void;
  get(id: string): VisualizationPrimitive | undefined;
  all(): VisualizationPrimitive[];
}
