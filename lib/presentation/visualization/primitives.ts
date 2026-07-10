import type { SemanticElement, SemanticSlide } from "../ir/schema";
import type { PrimitiveBuildResult, SemanticProfile, VisualizationFamily, VisualizationPrimitive } from "./types";

function stableId(slideId: string, primitiveId: string, role: string, index = 0) {
  return `${slideId}__viz__${primitiveId}__${role}__${index}`;
}

function titleElements(slide: SemanticSlide): SemanticElement[] {
  const texts = slide.elements.filter(
    (element): element is Extract<SemanticElement, { kind: "text" }> =>
      element.kind === "text",
  );
  const out: SemanticElement[] = [];
  const kicker = texts.find((element) => element.role === "kicker");
  // A single title tier only: prefer an explicit title, else the lead heading.
  // Keeping both a title AND a heading is what produced repeated headlines.
  const lead =
    texts.find((element) => element.role === "title") ??
    texts.find((element) => element.role === "heading");
  const subtitle = texts.find((element) => element.role === "subtitle");
  if (kicker) out.push(kicker);
  if (lead) out.push(lead);
  if (subtitle) out.push(subtitle);
  return out;
}

function preserve(slide: SemanticSlide, kinds: SemanticElement["kind"][]): SemanticElement[] {
  return slide.elements.filter((element) => kinds.includes(element.kind));
}

function labels(slide: SemanticSlide, limit = 6): string[] {
  const fromDiagram = slide.elements.flatMap((element) =>
    element.kind === "diagram" ? element.nodes.map((node) => node.label) : [],
  );
  const fromTable = slide.elements.flatMap((element) =>
    element.kind === "table" ? element.rows.map((row) => row[0]).filter(Boolean) : [],
  );
  const fromBullets = slide.elements.flatMap((element) =>
    element.kind === "text" && element.items ? element.items : [],
  );
  return [...fromDiagram, ...fromTable, ...fromBullets].filter(Boolean).slice(0, limit);
}

function nativeDiagram(slide: SemanticSlide, id: string, diagramType: "flow" | "architecture" | "timeline" | "comparison" | "funnel" | "orgchart", variant: string): PrimitiveBuildResult {
  const existing = slide.elements.find((element) => element.kind === "diagram");
  const sourceLabels = labels(slide, 7);
  const nodeLabels = existing?.kind === "diagram"
    ? existing.nodes.map((node) => ({ label: node.label, sublabel: node.sublabel, group: node.group, emphasis: node.emphasis }))
    : (sourceLabels.length ? sourceLabels : ["Primary", "Supporting", "Outcome"]).map((label) => ({ label, emphasis: "secondary" as const }));
  const nodes = nodeLabels.map((node, index) => ({ ...node, id: stableId(slide.id, id, "node", index), emphasis: index === 0 ? "primary" as const : node.emphasis }));
  const edges = existing?.kind === "diagram" && existing.edges.length
    ? existing.edges.map((edge) => {
        const fromIndex = existing.nodes.findIndex((node) => node.id === edge.from);
        const toIndex = existing.nodes.findIndex((node) => node.id === edge.to);
        return { from: nodes[Math.max(0, fromIndex)]?.id ?? nodes[0].id, to: nodes[Math.max(0, toIndex)]?.id ?? nodes[nodes.length - 1].id, label: edge.label };
      })
    : nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id }));
  const diagram: SemanticElement = { id: stableId(slide.id, id, "visual"), kind: "diagram", diagramType, nodes, edges, emphasis: "primary" };
  return {
    elements: [...titleElements(slide), diagram],
    variant,
    blueprint: { family: familyFor(id), variant, dominantRole: "semantic-diagram", supportingRoles: ["title"], nativeKinds: ["text", "diagram"], editable: true },
  };
}

function familyFor(id: string): VisualizationFamily {
  if (id.includes("market")) return "market";
  if (id.includes("workflow")) return "process";
  if (id.includes("architecture")) return "system";
  if (["dashboard-surface", "cli-terminal", "ide-editor", "mobile-product", "browser-product"].includes(id)) return "product";
  if (["hero-metrics", "pricing-matrix", "comparison-board"].includes(id)) return "data";
  if (["timeline-story", "editorial-quote", "gallery-showcase"].includes(id)) return "story";
  if (id === "team-map") return "people";
  return "content";
}

function productSurface(id: string, surface: "dashboard" | "terminal" | "editor" | "mobile" | "browser", score: (p: SemanticProfile) => number): VisualizationPrimitive {
  return {
    id,
    family: "product",
    score,
    build: ({ slide }) => {
      const code = preserve(slide, ["code"]);
      const data = preserve(slide, ["chart", "table", "metric"]);
      const visual = code.length || data.length ? [...code, ...data] : [{ id: stableId(slide.id, id, "panel"), kind: "table" as const, headers: ["Surface", "State"], rows: [[surface, "Interactive"], ["Content", "Editable"]], emphasis: "primary" as const }];
      const variant = surface === "mobile" ? "device-frame" : `${surface}-chrome`;
      return {
        elements: [...titleElements(slide), ...visual],
        variant,
        blueprint: { family: "product", variant, dominantRole: `${surface}-surface`, supportingRoles: ["chrome", "content-panel"], nativeKinds: [...new Set(visual.map((element) => element.kind)), "text"], editable: true, surface, chrome: surface === "mobile" ? ["status", "viewport", "navigation"] : ["toolbar", "navigation", "content"] },
      };
    },
  };
}

export const BUILTIN_VISUALIZATION_PRIMITIVES: VisualizationPrimitive[] = [
  { id: "market-map", family: "market", score: (p) => (p.slideType === "funnel" ? 95 : 0) + (p.diagramTypes.includes("funnel") || p.diagramTypes.includes("pyramid") ? 35 : 0), build: (c) => nativeDiagram(c.slide, "market-map", "funnel", c.profile.diagramTypes.includes("pyramid") ? "concentric-tiers" : "segmentation-funnel") },
  { id: "workflow-pipeline", family: "process", score: (p) => (["process", "flowchart"].includes(p.slideType) ? 90 : 0) + (p.scene === "workflow" ? 30 : 0) + (p.grouping === "sequential" ? 10 : 0), build: (c) => nativeDiagram(c.slide, "workflow-pipeline", "flow", c.profile.diagramGroupCount > 1 ? "swimlane" : "pipeline") },
  { id: "architecture-topology", family: "system", score: (p) => (p.slideType === "architecture" ? 100 : 0) + (p.scene === "technical-architecture" ? 30 : 0), build: (c) => nativeDiagram(c.slide, "architecture-topology", "architecture", c.profile.diagramGroupCount > 1 ? "grouped-services" : "service-topology") },
  productSurface("dashboard-surface", "dashboard", (p) => (p.slideType === "dashboard" ? 105 : 0) + (p.scene === "dashboard-showcase" ? 30 : 0)),
  productSurface("cli-terminal", "terminal", (p) => p.codeLanguages.some((language) => ["shell", "bash", "sh", "console", "terminal"].includes(language)) ? 115 : 0),
  productSurface("ide-editor", "editor", (p) => p.kinds.code > 0 && p.scene === "product-demo" ? 100 : 0),
  productSurface("mobile-product", "mobile", (p) => p.scene === "product-demo" && p.imagePriority >= 0.65 && p.kinds.code === 0 ? 84 : 0),
  productSurface("browser-product", "browser", (p) => p.scene === "product-demo" ? 72 : 0),
  { id: "hero-metrics", family: "data", score: (p) => (p.slideType === "kpi" ? 100 : 0) + (p.scene === "kpi-reveal" ? 25 : 0) + (p.metricCount > 0 ? 15 : 0), build: ({ slide, profile }) => ({ elements: [...titleElements(slide), ...preserve(slide, ["metric", "chart", "callout"])], variant: profile.metricCount === 1 || profile.metricEmphasis === "dominant-one" ? "hero-number" : "metric-cluster", blueprint: { family: "data", variant: profile.metricCount === 1 ? "hero-number" : "metric-cluster", dominantRole: "primary-metric", supportingRoles: ["supporting-metrics", "evidence"], nativeKinds: ["text", "metric", "chart", "callout"], editable: true } }) },
  { id: "timeline-story", family: "story", score: (p) => (p.slideType === "timeline" || p.slideType === "roadmap" ? 100 : 0) + (p.scene === "timeline" ? 25 : 0), build: (c) => nativeDiagram(c.slide, "timeline-story", "timeline", c.profile.slideType === "roadmap" ? "roadmap-tracks" : "milestones") },
  { id: "comparison-board", family: "data", score: (p) => (p.slideType === "comparison" || p.slideType === "swot" ? 100 : 0) + (p.scene === "comparison" ? 20 : 0) + (p.comparison !== "none" ? 10 : 0), build: ({ slide, profile }) => preserve(slide, ["table", "chart"]).length ? ({ elements: [...titleElements(slide), ...preserve(slide, ["table", "chart", "metric", "callout"])], variant: profile.comparison === "before-after" ? "before-after" : "side-by-side", blueprint: { family: "data", variant: profile.comparison, dominantRole: "comparison", supportingRoles: ["evidence"], nativeKinds: ["text", "table", "chart", "metric", "callout"], editable: true } }) : nativeDiagram(slide, "comparison-board", "comparison", profile.comparison === "before-after" ? "before-after" : "side-by-side") },
  { id: "pricing-matrix", family: "data", score: (p) => (p.scene === "pricing" ? 110 : 0) + (p.tableColumns >= 2 ? 10 : 0), build: ({ slide }) => ({ elements: [...titleElements(slide), ...preserve(slide, ["table", "metric", "callout"])], variant: "plan-matrix", blueprint: { family: "data", variant: "plan-matrix", dominantRole: "pricing-table", supportingRoles: ["price", "features", "recommendation"], nativeKinds: ["text", "table", "metric", "callout"], editable: true } }) },
  { id: "team-map", family: "people", score: (p) => (p.scene === "team" || p.slideType === "orgchart" ? 105 : 0), build: (c) => nativeDiagram(c.slide, "team-map", "orgchart", c.profile.diagramGroupCount > 1 ? "organization" : "team-grid") },
  { id: "editorial-quote", family: "story", score: (p) => (p.slideType === "quote" || p.scene === "quote" ? 110 : 0), build: ({ slide }) => ({ elements: preserve(slide, ["text", "callout"]), variant: "pull-quote", blueprint: { family: "story", variant: "pull-quote", dominantRole: "quotation", supportingRoles: ["attribution"], nativeKinds: ["text", "callout"], editable: true } }) },
  { id: "gallery-showcase", family: "story", score: (p) => (p.slideType === "gallery" || p.scene === "feature-showcase" ? 95 : 0), build: ({ slide }) => ({ elements: [...titleElements(slide), ...slide.elements.filter((element) => element.kind === "text" && element.role === "caption"), ...preserve(slide, ["image", "icon", "callout"])], variant: "showcase-grid", blueprint: { family: "story", variant: "showcase-grid", dominantRole: "showcase", supportingRoles: ["caption"], nativeKinds: ["text", "image", "icon", "callout"], editable: true } }) },
  { id: "editable-code", family: "content", score: (p) => p.kinds.code > 0 ? 80 : 0, build: ({ slide }) => ({ elements: [...titleElements(slide), ...preserve(slide, ["code", "callout"])], variant: "code-focus", blueprint: { family: "content", variant: "code-focus", dominantRole: "editable-code", supportingRoles: ["caption"], nativeKinds: ["text", "code", "callout"], editable: true } }) },
];
