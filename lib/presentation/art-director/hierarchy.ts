/**
 * Visual hierarchy model — deterministic per-object art direction.
 *
 * Real designers never give every object equal weight. This module scores each
 * semantic object for focal candidacy (from the composition's focal strategy,
 * the object's kind, its declared emphasis, and — for text — its role), elects
 * exactly one dominant object, and then assigns strictly decaying scale,
 * spacing, whitespace, grouping and reading-order intents down the ranking.
 *
 * Determinism: scoring is pure; ties break by original element order then id.
 * No slide can come out with uniform weights — scale strictly decreases by
 * emphasis tier, so a single focal point always emerges.
 */

import type { SemanticElement } from "../ir/schema";
import type { CompositionPlan, GroupingStrategy } from "../composer/types";
import type {
  EmotionalIntent,
  HierarchyEmphasis,
  VisualHierarchyEntry,
} from "./types";

/** Descriptor used for dominant/recede/secondary reporting. */
export function descriptorOf(element: SemanticElement): string {
  return element.kind === "text" ? element.role : element.kind;
}

/** Base salience per element kind — used even without composition signals. */
const KIND_SALIENCE: Record<SemanticElement["kind"], number> = {
  metric: 7,
  diagram: 7,
  chart: 7,
  image: 6,
  code: 6,
  table: 5,
  callout: 5,
  text: 4,
  icon: 3,
};

/** How each focal strategy rewards specific kinds. */
function focalBonus(focal: CompositionPlan["focal"], element: SemanticElement): number {
  switch (focal) {
    case "data":
      if (element.kind === "metric") return 10;
      if (element.kind === "chart") return 9;
      if (element.kind === "table") return 6;
      return 0;
    case "structure":
      if (element.kind === "diagram") return 10;
      if (element.kind === "code") return 5;
      return 0;
    case "media":
      if (element.kind === "image") return 10;
      if (element.kind === "icon") return 3;
      return 0;
    case "statement":
      if (element.kind === "text" && (element.role === "title" || element.role === "heading")) return 10;
      if (element.kind === "callout") return 6;
      return 0;
    case "narrative":
      if (element.kind === "text" && (element.role === "body" || element.role === "bullet")) return 8;
      if (element.kind === "text" && (element.role === "title" || element.role === "heading")) return 6;
      return 0;
    default:
      return 0;
  }
}

const EMPHASIS_BONUS: Record<SemanticElement["emphasis"], number> = {
  primary: 4,
  secondary: 1,
  tertiary: 0,
};

function textRoleBonus(element: SemanticElement): number {
  if (element.kind !== "text") return 0;
  switch (element.role) {
    case "title":
      return 4;
    case "heading":
      return 3;
    case "subtitle":
      return 2;
    case "kicker":
      return 1;
    case "caption":
    case "label":
      return -1;
    default:
      return 0;
  }
}

/** Intent sharpening — makes the hero of a reveal/explain slide stand out more. */
function intentBonus(intent: EmotionalIntent, element: SemanticElement): number {
  if ((intent === "reveal" || intent === "convince") && element.kind === "metric") return 4;
  if (intent === "explain" && element.kind === "diagram") return 4;
  if (intent === "compare" && (element.kind === "table" || element.kind === "chart")) return 3;
  if (intent === "inspire" && element.kind === "image") return 3;
  return 0;
}

const GROUPING_BASE: Record<GroupingStrategy, number> = {
  unified: 0.2,
  paired: 0.5,
  clustered: 0.7,
  sequential: 0.6,
  nested: 0.65,
  layered: 0.55,
};

/** Scale intent per emphasis tier, sharpened for the dominant object's kind. */
function heroScale(intent: EmotionalIntent, element: SemanticElement): number {
  if (element.kind === "metric") return 2.3;
  if (element.kind === "text" && (element.role === "title" || element.role === "heading")) {
    return intent === "inspire" || intent === "urgency" ? 2.0 : 1.85;
  }
  if (element.kind === "diagram" || element.kind === "chart" || element.kind === "image") return 1.6;
  return 1.5;
}

const TIER_SCALE: Record<Exclude<HierarchyEmphasis, "dominant">, number> = {
  primary: 1.05,
  secondary: 0.9,
  tertiary: 0.7,
  muted: 0.5,
};

const TIER_SPACING: Record<HierarchyEmphasis, number> = {
  dominant: 0.9,
  primary: 0.6,
  secondary: 0.4,
  tertiary: 0.25,
  muted: 0.15,
};

/** Assign an emphasis tier from a rank within the deck's ordered objects. */
function tierForRank(rank: number, count: number): HierarchyEmphasis {
  if (rank === 0) return "dominant";
  if (count <= 2) return "secondary";
  if (rank === 1) return "primary";
  const fraction = rank / (count - 1);
  if (fraction <= 0.5) return "secondary";
  if (fraction < 1) return "tertiary";
  return "muted";
}

export interface HierarchyModel {
  entries: VisualHierarchyEntry[];
  focalPoint: string;
  dominant: string;
  recede: string[];
  secondary: string[];
}

export function buildHierarchy(
  elements: SemanticElement[],
  plan: CompositionPlan | undefined,
  intent: EmotionalIntent,
  whitespace: number,
): HierarchyModel {
  const focal = plan?.focal ?? "statement";
  const grouping = plan?.groupingStrategy ?? "unified";
  const groupingBase = GROUPING_BASE[grouping];

  const scored = elements.map((element, index) => ({
    element,
    index,
    score:
      KIND_SALIENCE[element.kind] +
      focalBonus(focal, element) +
      EMPHASIS_BONUS[element.emphasis] +
      textRoleBonus(element) +
      intentBonus(intent, element),
  }));

  // Rank: highest score first; ties break deterministically by order then id.
  const ranked = [...scored].sort(
    (a, b) =>
      b.score - a.score ||
      a.index - b.index ||
      a.element.id.localeCompare(b.element.id),
  );

  const count = ranked.length;
  const entries: VisualHierarchyEntry[] = ranked.map((item, rank) => {
    const emphasis = tierForRank(rank, count);
    const scale =
      emphasis === "dominant" ? heroScale(intent, item.element) : TIER_SCALE[emphasis];
    const spacingWeight = Math.min(
      1,
      TIER_SPACING[emphasis] * (0.7 + whitespace * 0.6),
    );
    const whitespaceImportance =
      emphasis === "dominant"
        ? Math.min(1, 0.5 + whitespace * 0.5)
        : Math.max(0.05, TIER_SPACING[emphasis] * whitespace);
    const groupingStrength =
      emphasis === "dominant" ? Math.min(groupingBase, 0.3) : groupingBase;
    return {
      elementId: item.element.id,
      kind: item.element.kind,
      role: item.element.kind === "text" ? item.element.role : undefined,
      priority: rank + 1,
      emphasis,
      scale: Math.round(scale * 100) / 100,
      spacingWeight: Math.round(spacingWeight * 100) / 100,
      whitespaceImportance: Math.round(whitespaceImportance * 100) / 100,
      groupingStrength: Math.round(groupingStrength * 100) / 100,
      readingOrder: rank,
    };
  });

  const dominant = descriptorOf(ranked[0].element);
  const recede = entries
    .filter((entry) => entry.emphasis === "muted" || entry.emphasis === "tertiary")
    .map((entry) => entry.role ?? entry.kind);
  const secondary = entries
    .filter((entry) => entry.emphasis === "primary" || entry.emphasis === "secondary")
    .map((entry) => entry.role ?? entry.kind);

  return {
    entries,
    focalPoint: dominant,
    dominant,
    recede: [...new Set(recede)],
    secondary: [...new Set(secondary)],
  };
}
