/**
 * Diagram Intelligence Engine — semantic-stage analysis that detects when
 * slide content REPRESENTS a process, workflow, pipeline, timeline,
 * hierarchy, comparison, or system flow but was authored as plain text
 * (bullets), and converts it into a native SemanticDiagram element.
 *
 * The result flows through the diagram layout library (multiple variants,
 * scored per structure/frame) and every compiler target renders it as
 * editable shapes + connectors. Never images, never rasterized.
 *
 * Fully deterministic — no LLM.
 */

import type {
  SemanticIR,
  SemanticSlide,
  SemanticElement,
} from "../ir/schema";
import type { SemanticDiagram } from "./types";

type DiagramType = SemanticDiagram["diagramType"];

// ---------------------------------------------------------------------------
// Detection heuristics
// ---------------------------------------------------------------------------

/** Slide types whose bullet content is inherently diagrammatic. */
const SLIDE_TYPE_TO_DIAGRAM: Partial<Record<SemanticSlide["type"], DiagramType>> = {
  process: "process",
  timeline: "timeline",
  flowchart: "flowchart",
  architecture: "architecture",
  orgchart: "orgchart",
  swot: "swot",
  funnel: "funnel",
  pyramid: "pyramid",
  roadmap: "roadmap",
  comparison: "comparison",
};

const SEQUENCE_MARKERS =
  /^(step\s*\d|phase\s*\d|\d+[.):]|stage\s*\d)|(^|\s)(first|then|next|after that|finally)[,:\s]/i;
const ARROW_MARKER = /(->|→|⇒|=>)/;
const DATE_MARKER =
  /\b(q[1-4]\b|20\d{2}\b|jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(t|tember)?|oct(ober)?|nov(ember)?|dec(ember)?\b|week\s*\d|month\s*\d|day\s*\d)/i;
const COMPARISON_MARKER = /\b(vs\.?|versus|before\/after|pros?\b|cons?\b)\b/i;
const FLOW_INTENT =
  /\b(process|workflow|pipeline|flow|lifecycle|journey|steps?|stages?|phases?|procedure|sequence)\b/i;
const TIMELINE_INTENT =
  /\b(timeline|roadmap|milestones?|schedule|history|evolution|over time)\b/i;
const HIERARCHY_INTENT =
  /\b(hierarchy|org(anization)? (chart|structure)|reporting|team structure|layers?|tiers?)\b/i;
const SYSTEM_INTENT =
  /\b(architecture|system|infrastructure|stack|components?|services?|integration)\b/i;
const COMPARISON_INTENT = /\b(compar|versus|vs\.?|trade-?offs?|options?)\b/i;

interface Detection {
  type: DiagramType;
  confidence: number;
}

/** Classify a bullet list + its slide context into a diagram type. */
function detectDiagramType(
  items: string[],
  slide: SemanticSlide,
): Detection | null {
  if (items.length < 3 || items.length > 9) return null;

  const context = `${slide.intent} ${slide.elements
    .filter((e) => e.kind === "text" && e.role !== "bullet")
    .map((e) => (e.kind === "text" ? e.content : ""))
    .join(" ")}`;

  const seqHits = items.filter((i) => SEQUENCE_MARKERS.test(i)).length;
  const arrowHits = items.filter((i) => ARROW_MARKER.test(i)).length;
  const dateHits = items.filter((i) => DATE_MARKER.test(i)).length;

  // structural signals in the items themselves are strongest
  if (arrowHits >= 1 || seqHits >= Math.ceil(items.length * 0.6)) {
    return { type: "process", confidence: 0.9 };
  }
  if (dateHits >= Math.ceil(items.length * 0.6)) {
    return { type: "timeline", confidence: 0.9 };
  }
  if (
    items.length === 4 &&
    COMPARISON_MARKER.test(context + " " + items.join(" "))
  ) {
    return { type: "comparison", confidence: 0.7 };
  }

  // intent-level signals need corroboration from the slide's stated purpose
  if (TIMELINE_INTENT.test(context)) return { type: "timeline", confidence: 0.75 };
  if (FLOW_INTENT.test(context)) return { type: "process", confidence: 0.7 };
  if (HIERARCHY_INTENT.test(context)) return { type: "pyramid", confidence: 0.65 };
  if (SYSTEM_INTENT.test(context)) return { type: "architecture", confidence: 0.6 };
  if (COMPARISON_INTENT.test(context) && items.length >= 4) {
    return { type: "comparison", confidence: 0.6 };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Conversion: bullets → SemanticDiagram
// ---------------------------------------------------------------------------

/** "Step 1: Do the thing — details here" → { label, sublabel } */
function splitItem(raw: string): { label: string; sublabel?: string } {
  const cleaned = raw
    .replace(/^(step|phase|stage)\s*\d+\s*[-–—:.]?\s*/i, "")
    .replace(/^\d+[.):]\s*/, "")
    .trim();
  const sep = cleaned.match(/\s*[:–—]\s+/);
  if (sep && sep.index && sep.index > 2) {
    const label = cleaned.slice(0, sep.index).trim();
    const sublabel = cleaned.slice(sep.index + sep[0].length).trim();
    if (label.length <= 48 && sublabel.length > 0) return { label, sublabel };
  }
  if (cleaned.length <= 48) return { label: cleaned };
  // long single phrase: first clause becomes the label, rest the sublabel
  const cut = cleaned.slice(0, 48).lastIndexOf(" ");
  return {
    label: cleaned.slice(0, cut > 20 ? cut : 48).trim(),
    sublabel: cleaned.slice(cut > 20 ? cut : 48).trim(),
  };
}

function toDiagram(
  el: Extract<SemanticElement, { kind: "text" }>,
  items: string[],
  type: DiagramType,
): SemanticElement {
  const chainTypes: DiagramType[] = ["process", "flow", "flowchart", "architecture"];
  const nodes = items.map((item, i) => {
    const { label, sublabel } = splitItem(item);
    return {
      id: `n${i + 1}`,
      label,
      sublabel,
      emphasis: (i === 0 ? "primary" : "secondary") as "primary" | "secondary",
    };
  });
  const edges = chainTypes.includes(type)
    ? nodes.slice(0, -1).map((n, i) => ({ from: n.id, to: nodes[i + 1].id }))
    : [];
  return {
    id: `${el.id}:diagram`,
    kind: "diagram",
    diagramType: type,
    nodes,
    edges,
    emphasis: el.emphasis,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DiagramIntelligenceResult {
  ir: SemanticIR;
  /** human-readable log of what was converted, for progress/debugging */
  conversions: string[];
}

/**
 * Scan the Semantic IR and replace text bullets that represent diagrammatic
 * content with native SemanticDiagram elements. Slides that already contain
 * a diagram or chart are left untouched (the planner already did the job).
 */
export function enrichWithDiagrams(ir: SemanticIR): DiagramIntelligenceResult {
  const conversions: string[] = [];

  const slides = ir.slides.map((slide) => {
    const hasVisual = slide.elements.some(
      (e) => e.kind === "diagram" || e.kind === "chart",
    );
    if (hasVisual) return slide;

    const preferredType = SLIDE_TYPE_TO_DIAGRAM[slide.type];

    const elements = slide.elements.map((el): SemanticElement => {
      if (el.kind !== "text" || el.role !== "bullet") return el;
      const items = el.items ?? [];

      let type: DiagramType | null = null;
      if (preferredType && items.length >= 3 && items.length <= 9) {
        // slide type already declares diagrammatic intent
        type = preferredType;
      } else {
        const detected = detectDiagramType(items, slide);
        if (detected && detected.confidence >= 0.6) type = detected.type;
      }
      if (!type) return el;

      conversions.push(
        `${slide.id}: converted ${items.length} bullets → native ${type} diagram`,
      );
      return toDiagram(el, items, type);
    });

    return { ...slide, elements };
  });

  return { ir: { ...ir, slides }, conversions };
}
