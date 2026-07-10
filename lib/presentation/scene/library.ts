/**
 * Scene Library — 14 presentation scenes, each with 5+ composition variants.
 *
 * Variants within a scene differ significantly in structure, hierarchy,
 * whitespace, and element placement strategy. All metadata is semantic:
 * there are NO coordinates anywhere in this file.
 */

import type {
  CompositionStructure,
  CompositionVariant,
  FocalStrategy,
  SceneDefinition,
  SceneId,
} from "./types";
import type { LayoutMetadata } from "../layout/library";

type Rhythm = LayoutMetadata["visualRhythm"];
type Emphasis = LayoutMetadata["emphasis"];

/** compact variant constructor */
function v(
  sceneId: SceneId,
  key: string,
  name: string,
  structure: CompositionStructure,
  focal: FocalStrategy,
  hierarchy: number,
  whitespace: number,
  density: number,
  zones: string[],
  rhythmAffinity: Rhythm,
  emphasisAffinity: Emphasis,
): CompositionVariant {
  return {
    id: `${sceneId}/${key}`,
    name,
    structure,
    focal,
    hierarchy,
    whitespace,
    density,
    zones,
    rhythmAffinity,
    emphasisAffinity,
  };
}

export const SCENE_LIBRARY: SceneDefinition[] = [
  {
    id: "hero",
    name: "Hero",
    purpose: "Open the deck with one commanding statement.",
    variants: [
      v("hero", "monolith", "Monolith Statement", "single-focus", "statement", 1.0, 0.75, 0.1, ["statement", "kicker"], "single-focus", "text"),
      v("hero", "offset-axis", "Offset Axis", "asymmetric", "statement", 0.9, 0.65, 0.2, ["kicker", "statement", "supporting"], "asymmetric", "text"),
      v("hero", "split-canvas", "Split Canvas", "split", "media", 0.8, 0.5, 0.3, ["statement", "media"], "asymmetric", "media"),
      v("hero", "immersive-field", "Immersive Field", "single-focus", "media", 0.85, 0.4, 0.25, ["media", "statement"], "single-focus", "media"),
      v("hero", "descending-stack", "Descending Stack", "stacked", "statement", 0.75, 0.6, 0.25, ["kicker", "statement", "subtitle", "supporting"], "single-focus", "text"),
    ],
  },
  {
    id: "product-demo",
    name: "Product Demo",
    purpose: "Show the product itself as the protagonist.",
    variants: [
      v("product-demo", "stage-center", "Center Stage", "single-focus", "media", 0.9, 0.45, 0.35, ["media", "caption"], "single-focus", "media"),
      v("product-demo", "narrated-split", "Narrated Split", "split", "media", 0.7, 0.4, 0.5, ["narrative", "media"], "asymmetric", "media"),
      v("product-demo", "feature-orbit", "Feature Orbit", "radial", "media", 0.65, 0.35, 0.55, ["media", "callout", "callout", "callout"], "grid", "balanced"),
      v("product-demo", "walkthrough-flow", "Walkthrough Flow", "flow", "media", 0.55, 0.3, 0.6, ["heading", "step", "step", "step"], "flow", "structure"),
      v("product-demo", "detail-asym", "Asymmetric Detail", "asymmetric", "media", 0.8, 0.5, 0.4, ["media", "heading", "supporting"], "asymmetric", "media"),
    ],
  },
  {
    id: "dashboard-showcase",
    name: "Dashboard Showcase",
    purpose: "Present a live-feeling data surface.",
    variants: [
      v("dashboard-showcase", "command-grid", "Command Grid", "grid", "data", 0.4, 0.2, 0.85, ["heading", "panel", "panel", "panel", "panel"], "grid", "data"),
      v("dashboard-showcase", "primary-panel", "Primary Panel", "asymmetric", "data", 0.75, 0.3, 0.65, ["heading", "hero-chart", "side-metrics"], "asymmetric", "data"),
      v("dashboard-showcase", "metric-band", "Metric Band", "stacked", "data", 0.6, 0.35, 0.6, ["heading", "metric-strip", "chart"], "columns", "data"),
      v("dashboard-showcase", "dual-lens", "Dual Lens", "split", "data", 0.55, 0.3, 0.7, ["heading", "chart", "chart"], "columns", "data"),
      v("dashboard-showcase", "insight-first", "Insight First", "stacked", "narrative", 0.7, 0.4, 0.55, ["insight", "evidence-charts"], "single-focus", "data"),
    ],
  },
  {
    id: "technical-architecture",
    name: "Technical Architecture",
    purpose: "Explain how a system fits together.",
    variants: [
      v("technical-architecture", "blueprint", "Full Blueprint", "single-focus", "structure", 0.8, 0.3, 0.6, ["heading", "diagram"], "single-focus", "structure"),
      v("technical-architecture", "layered-stack", "Layered Stack", "stacked", "structure", 0.6, 0.3, 0.65, ["heading", "tier", "tier", "tier"], "flow", "structure"),
      v("technical-architecture", "annotated-system", "Annotated System", "split", "structure", 0.65, 0.35, 0.6, ["diagram", "annotations"], "asymmetric", "structure"),
      v("technical-architecture", "component-grid", "Component Grid", "grid", "structure", 0.45, 0.25, 0.7, ["heading", "component", "component", "component"], "grid", "structure"),
      v("technical-architecture", "data-path", "Data Path", "flow", "structure", 0.7, 0.35, 0.55, ["heading", "flow-diagram", "caption"], "flow", "structure"),
    ],
  },
  {
    id: "workflow",
    name: "Workflow",
    purpose: "Walk through a process step by step.",
    variants: [
      v("workflow", "conveyor", "Conveyor", "flow", "structure", 0.6, 0.35, 0.55, ["heading", "process-flow"], "flow", "structure"),
      v("workflow", "numbered-descent", "Numbered Descent", "stacked", "structure", 0.55, 0.3, 0.6, ["heading", "step", "step", "step"], "flow", "structure"),
      v("workflow", "stage-columns", "Stage Columns", "columns", "structure", 0.5, 0.3, 0.65, ["heading", "stage", "stage", "stage"], "columns", "structure"),
      v("workflow", "loop-cycle", "Loop Cycle", "radial", "structure", 0.7, 0.4, 0.5, ["heading", "cycle-diagram"], "single-focus", "structure"),
      v("workflow", "before-during-after", "Before / During / After", "split", "structure", 0.65, 0.35, 0.55, ["heading", "before", "transition", "after"], "columns", "balanced"),
    ],
  },
  {
    id: "timeline",
    name: "Timeline",
    purpose: "Show progression over time.",
    variants: [
      v("timeline", "horizon-line", "Horizon Line", "flow", "structure", 0.6, 0.4, 0.5, ["heading", "timeline"], "flow", "structure"),
      v("timeline", "milestone-stack", "Milestone Stack", "stacked", "structure", 0.5, 0.3, 0.6, ["heading", "milestone", "milestone", "milestone"], "flow", "structure"),
      v("timeline", "era-columns", "Era Columns", "columns", "structure", 0.45, 0.3, 0.65, ["heading", "era", "era", "era"], "columns", "balanced"),
      v("timeline", "spotlight-moment", "Spotlight Moment", "asymmetric", "statement", 0.85, 0.5, 0.4, ["featured-milestone", "context-timeline"], "asymmetric", "structure"),
      v("timeline", "roadmap-lanes", "Roadmap Lanes", "grid", "structure", 0.4, 0.25, 0.7, ["heading", "lane", "lane", "lane"], "grid", "structure"),
    ],
  },
  {
    id: "kpi-reveal",
    name: "KPI Reveal",
    purpose: "Land the numbers with maximum impact.",
    variants: [
      v("kpi-reveal", "single-number", "The One Number", "single-focus", "data", 1.0, 0.7, 0.15, ["hero-metric", "context"], "single-focus", "data"),
      v("kpi-reveal", "metric-trio", "Metric Trio", "columns", "data", 0.6, 0.45, 0.4, ["heading", "metric", "metric", "metric"], "columns", "data"),
      v("kpi-reveal", "scoreboard", "Scoreboard", "grid", "data", 0.45, 0.3, 0.6, ["heading", "metric", "metric", "metric", "metric"], "grid", "data"),
      v("kpi-reveal", "headline-proof", "Headline + Proof", "split", "data", 0.8, 0.5, 0.4, ["claim", "supporting-metrics"], "asymmetric", "data"),
      v("kpi-reveal", "trend-story", "Trend Story", "stacked", "data", 0.7, 0.4, 0.5, ["heading", "trend-chart", "metric-strip"], "single-focus", "data"),
    ],
  },
  {
    id: "comparison",
    name: "Comparison",
    purpose: "Contrast options, states, or competitors.",
    variants: [
      v("comparison", "versus-split", "Versus Split", "split", "structure", 0.6, 0.35, 0.55, ["heading", "option-a", "option-b"], "columns", "balanced"),
      v("comparison", "criteria-matrix", "Criteria Matrix", "grid", "data", 0.4, 0.25, 0.75, ["heading", "matrix"], "grid", "data"),
      v("comparison", "winner-spotlight", "Winner Spotlight", "asymmetric", "statement", 0.8, 0.45, 0.5, ["winner", "alternatives"], "asymmetric", "balanced"),
      v("comparison", "before-after", "Before / After", "split", "narrative", 0.65, 0.4, 0.5, ["before", "after"], "columns", "balanced"),
      v("comparison", "tradeoff-columns", "Trade-off Columns", "columns", "structure", 0.5, 0.3, 0.6, ["heading", "column", "column", "column"], "columns", "structure"),
    ],
  },
  {
    id: "feature-showcase",
    name: "Feature Showcase",
    purpose: "Present a set of capabilities.",
    variants: [
      v("feature-showcase", "capability-grid", "Capability Grid", "grid", "narrative", 0.4, 0.3, 0.7, ["heading", "feature", "feature", "feature", "feature"], "grid", "balanced"),
      v("feature-showcase", "flagship-first", "Flagship First", "asymmetric", "statement", 0.8, 0.4, 0.5, ["flagship-feature", "secondary-features"], "asymmetric", "text"),
      v("feature-showcase", "triple-column", "Triple Column", "columns", "narrative", 0.5, 0.35, 0.55, ["heading", "feature", "feature", "feature"], "columns", "balanced"),
      v("feature-showcase", "icon-rhythm", "Icon Rhythm", "flow", "narrative", 0.45, 0.4, 0.5, ["heading", "icon-feature", "icon-feature", "icon-feature"], "flow", "balanced"),
      v("feature-showcase", "narrative-ladder", "Narrative Ladder", "stacked", "narrative", 0.6, 0.35, 0.55, ["heading", "feature-row", "feature-row", "feature-row"], "single-focus", "text"),
    ],
  },
  {
    id: "case-study",
    name: "Case Study",
    purpose: "Tell one concrete customer or project story.",
    variants: [
      v("case-study", "story-arc", "Story Arc", "stacked", "narrative", 0.6, 0.4, 0.55, ["context", "challenge", "outcome"], "single-focus", "text"),
      v("case-study", "evidence-split", "Evidence Split", "split", "data", 0.65, 0.35, 0.55, ["narrative", "result-metrics"], "asymmetric", "data"),
      v("case-study", "portrait-lead", "Portrait Lead", "asymmetric", "media", 0.7, 0.4, 0.5, ["subject-media", "story"], "asymmetric", "media"),
      v("case-study", "quote-anchor", "Quote Anchor", "single-focus", "statement", 0.85, 0.55, 0.35, ["customer-quote", "supporting-facts"], "single-focus", "text"),
      v("case-study", "chapter-columns", "Chapter Columns", "columns", "narrative", 0.45, 0.3, 0.6, ["heading", "chapter", "chapter", "chapter"], "columns", "balanced"),
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    purpose: "Present plans and cost structure.",
    variants: [
      v("pricing", "tier-columns", "Tier Columns", "columns", "data", 0.5, 0.3, 0.6, ["heading", "tier", "tier", "tier"], "columns", "balanced"),
      v("pricing", "recommended-spotlight", "Recommended Spotlight", "asymmetric", "statement", 0.75, 0.35, 0.55, ["recommended-tier", "other-tiers"], "asymmetric", "balanced"),
      v("pricing", "value-ledger", "Value Ledger", "grid", "data", 0.4, 0.25, 0.7, ["heading", "comparison-table"], "grid", "data"),
      v("pricing", "single-offer", "Single Offer", "single-focus", "statement", 0.9, 0.6, 0.3, ["price-statement", "inclusions"], "single-focus", "text"),
      v("pricing", "cost-story", "Cost Story", "split", "narrative", 0.6, 0.4, 0.5, ["value-narrative", "price-breakdown"], "asymmetric", "data"),
    ],
  },
  {
    id: "team",
    name: "Team",
    purpose: "Introduce the people behind the work.",
    variants: [
      v("team", "portrait-grid", "Portrait Grid", "grid", "media", 0.35, 0.3, 0.65, ["heading", "member", "member", "member", "member"], "grid", "media"),
      v("team", "founder-spotlight", "Founder Spotlight", "asymmetric", "media", 0.8, 0.45, 0.4, ["featured-member", "rest-of-team"], "asymmetric", "media"),
      v("team", "row-of-peers", "Row of Peers", "columns", "media", 0.4, 0.4, 0.5, ["heading", "member", "member", "member"], "columns", "balanced"),
      v("team", "credentials-ledger", "Credentials Ledger", "stacked", "narrative", 0.5, 0.35, 0.55, ["heading", "member-row", "member-row"], "single-focus", "text"),
      v("team", "culture-collage", "Culture Collage", "grid", "media", 0.45, 0.25, 0.7, ["statement", "media", "media", "media"], "grid", "media"),
    ],
  },
  {
    id: "quote",
    name: "Quote",
    purpose: "Let one voice carry the slide.",
    variants: [
      v("quote", "vast-silence", "Vast Silence", "single-focus", "statement", 1.0, 0.8, 0.1, ["quote", "attribution"], "single-focus", "text"),
      v("quote", "offset-voice", "Offset Voice", "asymmetric", "statement", 0.85, 0.65, 0.2, ["quote", "attribution", "context"], "asymmetric", "text"),
      v("quote", "portrait-testimony", "Portrait Testimony", "split", "media", 0.7, 0.5, 0.35, ["speaker-media", "quote"], "asymmetric", "media"),
      v("quote", "stacked-emphasis", "Stacked Emphasis", "stacked", "statement", 0.8, 0.6, 0.25, ["kicker", "quote", "attribution"], "single-focus", "text"),
      v("quote", "evidence-backed", "Evidence Backed", "split", "statement", 0.7, 0.5, 0.4, ["quote", "supporting-metric"], "asymmetric", "data"),
    ],
  },
  {
    id: "closing-cta",
    name: "Closing CTA",
    purpose: "End with a clear, memorable next step.",
    variants: [
      v("closing-cta", "final-word", "Final Word", "single-focus", "statement", 1.0, 0.75, 0.1, ["cta-statement"], "single-focus", "text"),
      v("closing-cta", "recap-and-ask", "Recap and Ask", "split", "narrative", 0.7, 0.45, 0.45, ["recap", "cta"], "asymmetric", "text"),
      v("closing-cta", "next-steps-ladder", "Next Steps Ladder", "stacked", "narrative", 0.6, 0.4, 0.5, ["cta-statement", "step", "step", "step"], "flow", "structure"),
      v("closing-cta", "contact-panel", "Contact Panel", "asymmetric", "statement", 0.8, 0.55, 0.3, ["cta-statement", "contact-details"], "asymmetric", "text"),
      v("closing-cta", "proof-then-ask", "Proof Then Ask", "stacked", "data", 0.75, 0.5, 0.4, ["closing-metric", "cta-statement"], "single-focus", "data"),
    ],
  },
];

const SCENE_MAP = new Map<SceneId, SceneDefinition>(
  SCENE_LIBRARY.map((s) => [s.id, s]),
);

export function getScene(id: SceneId): SceneDefinition {
  const scene = SCENE_MAP.get(id);
  if (!scene) throw new Error(`Unknown scene: ${id}`);
  return scene;
}
