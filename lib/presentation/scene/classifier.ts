/**
 * Scene Classifier — deterministic, content-semantics-based scene selection.
 *
 * Classification is driven by what the slide IS, not by keyword string
 * matching on titles:
 *
 *   1. Structural evidence — the element mix (diagram types, metric counts,
 *      chart presence, table shape, media weight) is the strongest signal.
 *      A slide with a process diagram IS explaining a process regardless of
 *      what its title says.
 *   2. Declared semantic type — the Narrative Planner's SlideType is a
 *      trusted semantic classification (it is not free text).
 *   3. Intent concepts — the slide's `intent` sentence is reduced to
 *      normalized concept signals (groups of surface forms mapped to one
 *      abstract concept such as "process", "contrast", "evidence") rather
 *      than raw keyword hits.
 *   4. Deck position — opening and closing slides carry positional priors.
 *
 * Pure and deterministic: same slide + same deck position → same scene.
 */

import type { SemanticSlide } from "../ir/schema";
import { categorize } from "../layout/library";
import { SCENE_IDS, type SceneId } from "./types";

export interface SceneClassification {
  scene: SceneId;
  score: number;
  /** every scored scene, best first — used by the engine for fallbacks */
  ranking: { scene: SceneId; score: number }[];
  rationale: string[];
}

export interface DeckPosition {
  index: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Concept signals — abstract concepts inferred from intent text.
// Each concept groups many surface forms; matching any form yields ONE
// concept signal. Scenes score against concepts, never raw words.
// ---------------------------------------------------------------------------

const CONCEPT_FORMS: Record<string, string[]> = {
  process: ["process", "workflow", "how it works", "step", "pipeline", "procedure", "lifecycle", "sequence", "method"],
  chronology: ["timeline", "roadmap", "history", "milestone", "journey", "evolution", "over time", "phase", "quarter", "schedule"],
  evidence: ["metric", "kpi", "number", "result", "growth", "revenue", "impact", "performance", "traction", "measure"],
  contrast: ["versus", " vs ", "compare", "comparison", "alternative", "competitor", "trade-off", "tradeoff", "before and after", "pros and cons", "option"],
  system: ["architecture", "infrastructure", "system", "stack", "component", "integration", "topology", "platform design", "diagram"],
  product: ["product", "demo", "interface", "screenshot", "app", "prototype", "walkthrough", "in action", "show the"],
  monitoring: ["dashboard", "analytics", "monitoring", "real-time", "reporting", "insight", "at a glance", "overview of data"],
  capability: ["feature", "capability", "benefit", "what you get", "functionality", "offering", "highlights"],
  story: ["case study", "customer", "client", "success story", "testimonial", "real-world", "in practice"],
  cost: ["pricing", "price", "plan", "tier", "cost", "subscription", "billing", "package"],
  people: ["team", "founder", "leadership", "people", "who we are", "advisor", "staff", "expert"],
  voice: ["quote", "said", "words from", "testimony", "in their words"],
  action: ["call to action", "next step", "get started", "contact", "thank you", "join", "sign up", "reach out", "let's talk", "closing"],
  opening: ["introduce", "welcome", "opening", "title slide", "open with", "vision", "mission statement"],
};

function detectConcepts(intent: string): Set<string> {
  const text = ` ${intent.toLowerCase()} `;
  const found = new Set<string>();
  for (const [concept, forms] of Object.entries(CONCEPT_FORMS)) {
    if (forms.some((f) => text.includes(f))) found.add(concept);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Structural evidence
// ---------------------------------------------------------------------------

interface StructuralProfile {
  metrics: number;
  charts: number;
  tables: number;
  media: number;
  icons: number;
  diagrams: number;
  texts: number;
  callouts: number;
  code: number;
  diagramTypes: Set<string>;
  bulletItems: number;
  /** table looks like an option matrix (few option columns, many criteria rows) */
  comparativeTable: boolean;
}

function profile(slide: SemanticSlide): StructuralProfile {
  const c = categorize(slide);
  const diagramTypes = new Set<string>();
  for (const d of c.diagrams) {
    if (d.kind === "diagram") diagramTypes.add(d.diagramType);
  }
  let bulletItems = 0;
  for (const el of slide.elements) {
    if (el.kind === "text" && el.items) bulletItems += el.items.length;
  }
  let comparativeTable = false;
  for (const t of c.tables) {
    if (t.kind === "table" && t.headers.length >= 2 && t.headers.length <= 5) {
      comparativeTable = true;
    }
  }
  return {
    metrics: c.metrics.length,
    charts: c.charts.length,
    tables: c.tables.length,
    media: c.media.length,
    icons: c.icons.length,
    diagrams: c.diagrams.length,
    texts: c.texts.length,
    callouts: c.callouts.length,
    code: c.code.length,
    diagramTypes,
    bulletItems,
    comparativeTable,
  };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** SlideType → scene priors (the planner's own semantic classification). */
const TYPE_PRIOR: Partial<Record<SemanticSlide["type"], Partial<Record<SceneId, number>>>> = {
  hero: { hero: 30 },
  section: { hero: 10 },
  kpi: { "kpi-reveal": 30, "dashboard-showcase": 8 },
  dashboard: { "dashboard-showcase": 30, "kpi-reveal": 8 },
  timeline: { timeline: 30 },
  roadmap: { timeline: 26 },
  comparison: { comparison: 30 },
  swot: { comparison: 22 },
  process: { workflow: 30 },
  flowchart: { workflow: 26, "technical-architecture": 8 },
  funnel: { workflow: 18 },
  pyramid: { workflow: 12 },
  architecture: { "technical-architecture": 30 },
  orgchart: { team: 24 },
  gallery: { "product-demo": 18, "feature-showcase": 10, team: 4 },
  quote: { quote: 30 },
  closing: { "closing-cta": 30 },
  agenda: { "feature-showcase": 6 },
  content: {},
};

export function classifySlide(
  slide: SemanticSlide,
  position: DeckPosition,
): SceneClassification {
  const p = profile(slide);
  const concepts = detectConcepts(slide.intent);
  const rationale: string[] = [];

  const scores = new Map<SceneId, number>();
  for (const id of SCENE_IDS) scores.set(id, 0);
  const add = (scene: SceneId, amount: number, why?: string) => {
    scores.set(scene, (scores.get(scene) ?? 0) + amount);
    if (why && amount > 0) rationale.push(`${scene}: ${why} (+${amount})`);
  };

  // 1. planner's semantic slide type
  const priors = TYPE_PRIOR[slide.type];
  if (priors) {
    for (const [scene, weight] of Object.entries(priors)) {
      add(scene as SceneId, weight, `slide type "${slide.type}"`);
    }
  }

  // 2. structural evidence — the strongest content-semantic signal
  if (p.diagramTypes.has("process") || p.diagramTypes.has("flow") || p.diagramTypes.has("flowchart") || p.diagramTypes.has("cycle") || p.diagramTypes.has("funnel")) {
    add("workflow", 24, "sequential/process diagram present");
  }
  if (p.diagramTypes.has("timeline") || p.diagramTypes.has("roadmap")) {
    add("timeline", 24, "chronological diagram present");
  }
  if (p.diagramTypes.has("architecture")) {
    add("technical-architecture", 24, "architecture diagram present");
  }
  if (p.diagramTypes.has("orgchart")) {
    add("team", 20, "org chart present");
  }
  if (p.diagramTypes.has("comparison") || p.diagramTypes.has("swot")) {
    add("comparison", 22, "comparative diagram present");
  }
  if (p.code > 0) {
    add("technical-architecture", 12, "code sample present");
  }
  if (p.metrics >= 3) {
    add("kpi-reveal", 16, `${p.metrics} metrics`);
    add("dashboard-showcase", 8);
  } else if (p.metrics > 0) {
    add("kpi-reveal", 10, `${p.metrics} metric(s)`);
  }
  if (p.charts >= 2 || (p.charts >= 1 && p.metrics >= 2)) {
    add("dashboard-showcase", 18, "multi-panel data surface");
  } else if (p.charts === 1) {
    add("kpi-reveal", 6, "single chart");
    add("dashboard-showcase", 6);
  }
  if (p.comparativeTable) {
    add("comparison", 12, "option-matrix table");
    add("pricing", 6);
  }
  if (p.media >= 2) {
    add("product-demo", 10, "multiple visuals");
    add("team", 4);
    add("case-study", 4);
  } else if (p.media === 1) {
    add("product-demo", 6, "single visual");
    add("case-study", 3);
  }
  if (p.icons >= 3 || (p.bulletItems >= 3 && p.texts >= 2)) {
    add("feature-showcase", 10, "capability list structure");
  }

  // 3. intent concepts (abstract signals, not keyword identity)
  const conceptWeights: Record<string, [SceneId, number][]> = {
    process: [["workflow", 14]],
    chronology: [["timeline", 14]],
    evidence: [["kpi-reveal", 12], ["dashboard-showcase", 5], ["case-study", 3]],
    contrast: [["comparison", 14]],
    system: [["technical-architecture", 14]],
    product: [["product-demo", 12]],
    monitoring: [["dashboard-showcase", 14]],
    capability: [["feature-showcase", 12]],
    story: [["case-study", 14], ["quote", 4]],
    cost: [["pricing", 16]],
    people: [["team", 14]],
    voice: [["quote", 12]],
    action: [["closing-cta", 14]],
    opening: [["hero", 10]],
  };
  for (const concept of concepts) {
    for (const [scene, weight] of conceptWeights[concept] ?? []) {
      add(scene, weight, `intent expresses "${concept}"`);
    }
  }

  // 4. deck position priors
  if (position.index === 0) add("hero", 12, "opening slide");
  if (position.total > 1 && position.index === position.total - 1) {
    add("closing-cta", 12, "final slide");
  }

  // rank deterministically (score desc, then stable scene order)
  const ranking = SCENE_IDS.map((scene) => ({
    scene,
    score: scores.get(scene) ?? 0,
  })).sort((a, b) => b.score - a.score || SCENE_IDS.indexOf(a.scene) - SCENE_IDS.indexOf(b.scene));

  // fallback for signal-less content slides: narrative feature showcase
  let best = ranking[0];
  if (best.score <= 0) {
    best = { scene: "feature-showcase", score: 0 };
    rationale.push("feature-showcase: fallback for generic content");
  }

  return { scene: best.scene, score: best.score, ranking, rationale };
}
