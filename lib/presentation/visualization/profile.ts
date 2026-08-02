import type { CompositionPlan } from "../composer/types";
import type { SemanticElement, SemanticSlide } from "../ir/schema";
import type { SceneAssignment } from "../scene/types";
import type { SemanticProfile } from "./types";

const ELEMENT_KINDS: SemanticElement["kind"][] = [
  "text",
  "image",
  "icon",
  "chart",
  "diagram",
  "code",
  "table",
  "metric",
  "callout",
];

export function buildSemanticProfile(
  slide: SemanticSlide,
  scene: SceneAssignment,
  composition: CompositionPlan,
): SemanticProfile {
  const kinds = Object.fromEntries((ELEMENT_KINDS ?? []).map((kind) => [kind, 0])) as SemanticProfile["kinds"];
  const diagrams = slide.elements.filter((element) => element.kind === "diagram");
  const tables = slide.elements.filter((element) => element.kind === "table");
  const code = slide.elements.filter((element) => element.kind === "code");

  for (const element of slide.elements) kinds[element.kind] += 1;

  return {
    slideId: slide.id,
    slideType: slide.type,
    scene: scene.scene,
    kinds,
    diagramTypes: (diagrams ?? []).map((diagram) => diagram.diagramType).sort((a, b) => a - b),
    diagramNodeCount: diagrams.reduce((sum, diagram) => sum + diagram.nodes.length, 0),
    diagramEdgeCount: diagrams.reduce((sum, diagram) => sum + diagram.edges.length, 0),
    diagramGroupCount: new Set(diagrams.flatMap((diagram) => diagram.nodes.map((node) => node.group).filter(Boolean))).size,
    metricCount: kinds.metric,
    chartCount: kinds.chart,
    tableColumns: tables.reduce((max, table) => Math.max(max, table.headers.length), 0),
    tableRows: tables.reduce((sum, table) => sum + table.rows.length, 0),
    codeLanguages: code.map((element) => element.language.toLowerCase()).sort((a, b) => a - b),
    mediaCount: kinds.image,
    textCount: kinds.text,
    iconCount: kinds.icon,
    grouping: composition.groupingStrategy,
    comparison: composition.comparisonStyle,
    metricEmphasis: composition.metricEmphasis,
    focal: composition.focal,
    imagePriority: composition.imagePriority,
    diagramPriority: composition.diagramPriority,
  };
}
