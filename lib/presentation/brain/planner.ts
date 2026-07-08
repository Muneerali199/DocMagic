/**
 * Narrative Planner — stage 2 of the two-stage brain.
 *
 * Converts a PresentationStrategy into a full Semantic IR: slide sequence,
 * semantic slide types, and semantic elements. It NEVER emits coordinates,
 * colors, font sizes, or layout ids — meaning only. The deterministic
 * pipeline (Design Engine, Layout Intelligence, Constraint Solver,
 * Optimization Pipeline) turns this into a Resolved IR.
 */

import { z } from "zod";
import {
  SemanticIRSchema,
  SemanticSlideSchema,
  type PresentationStrategy,
  type SemanticIR,
} from "../ir/schema";
import { structuredCall } from "./client";

/** What the planner returns (strategy is injected by us, not the model). */
const PlannerOutputSchema = z.object({
  title: z.string(),
  slides: z.array(SemanticSlideSchema).min(1),
});

const SYSTEM = `You are a narrative planner inside a presentation compiler. You convert a presentation strategy into a structured slide plan (Semantic IR).

CRITICAL RULES:
- You describe MEANING only. NEVER output coordinates, pixel values, colors, font names, font sizes, or layout instructions.
- You NEVER draw. You classify semantic intent and emit structured JSON. Specialized deterministic engines construct all charts, diagrams, timelines, flowcharts, org charts, and layouts as native editable objects.
- Every slide needs: id (slug), type, intent (one sentence: what this slide must communicate), elements, speakerNotes.
- Slide types (this is the layoutIntent — pick the most specific one): hero, kpi, timeline, comparison, process, flowchart, architecture, orgchart, swot, funnel, pyramid, roadmap, gallery, quote, dashboard, content, agenda, section, closing.
- Element kinds and their JSON shapes:
  - text:    { "id", "kind": "text", "role": "title"|"subtitle"|"heading"|"body"|"bullet"|"caption"|"label"|"kicker", "content", "items"?: string[], "emphasis": "primary"|"secondary"|"tertiary" }
             (for role "bullet", put bullet points in "items" and keep "content" as an optional lead-in, may be "")
  - metric:  { "id", "kind": "metric", "value": "42%", "label": "Growth", "delta"?: "+12%", "trend"?: "up"|"down"|"flat", "emphasis" }
  - chart:   { "id", "kind": "chart", "chartType": "bar"|"line"|"area"|"pie"|"doughnut"|"radar"|"scatter", "title"?, "categories": string[], "series": [{ "name", "data": number[] }], "emphasis" }
  - diagram: { "id", "kind": "diagram", "diagramType": "flow"|"flowchart"|"timeline"|"comparison"|"pyramid"|"process"|"funnel"|"cycle"|"swot"|"architecture"|"orgchart"|"roadmap", "nodes": [{ "id", "label", "sublabel"?, "group"?, "emphasis" }], "edges": [{ "from", "to", "label"? }], "emphasis" }
  - image:   { "id", "kind": "image", "query": "descriptive search phrase", "alt": "accessible description", "aspect": "wide"|"square"|"tall"|"auto", "emphasis" }
  - icon:    { "id", "kind": "icon", "name": "lucide-icon-name", "label"?, "emphasis" }
  - table:   { "id", "kind": "table", "headers": string[], "rows": string[][], "emphasis" }
  - callout: { "id", "kind": "callout", "tone": "info"|"success"|"warning"|"insight", "title"?, "content", "emphasis" }
  - code:    { "id", "kind": "code", "language", "code", "caption"?, "emphasis" }

DIAGRAM RULES (structured graphs only — engines draw everything):
- flowchart: use edges to express branching/merging; add edge "label" for decision outcomes (e.g. "Yes"/"No").
- orgchart: edges go parent -> child; exactly one root node; use "group" for team names.
- roadmap: use node "group" as the swim-lane/track name (e.g. "Q1", "Platform", "Growth"); order nodes left-to-right within each lane.
- architecture: edges express dependencies between layers/services; nodes at the same depth become a tier.
- swot: exactly 4 nodes in order: Strengths, Weaknesses, Opportunities, Threats (points in sublabel).
- funnel/pyramid: nodes ordered top-to-bottom; no edges needed.

IMAGE POLICY (strict):
- NEVER use image elements for informational graphics: charts, diagrams, timelines, architecture, flowcharts, org charts, SWOT, funnels, pyramids, processes, roadmaps, or dashboards. Those MUST be chart/diagram/metric/table elements so they stay native and editable.
- image elements are ONLY for creative visual assets: hero illustrations, artistic backgrounds, conceptual artwork, decorative imagery, marketing visuals.

CONTENT QUALITY RULES:
- Exactly ONE element per slide should have emphasis "primary" (usually the title).
- 6 words max for titles; punchy, concrete, no generic filler.
- Max ~5 bullets per slide, each under 12 words.
- Use real, plausible numbers in metrics/charts (invent reasonable data when the user gives none, consistent across slides).
- kpi slides: 3-4 metric elements + a title. timeline slides: a timeline diagram. process slides: a flow/process diagram. comparison slides: comparison diagram or table. flowchart slides: a flowchart diagram. orgchart slides: an orgchart diagram. swot slides: a swot diagram. funnel/pyramid slides: a funnel/pyramid diagram. roadmap slides: a roadmap diagram with grouped nodes.
- hero slide: kicker + title + subtitle (+ optional image with a strong query). closing slide: title + a clear call to action as body text.
- Vary slide types; never more than two consecutive "content" slides.
- Each slide's speakerNotes: 2-3 spoken sentences.
- Follow the storytelling strategy's arc across the deck.

Return ONLY JSON: { "title": string, "slides": [ ... ] }`;

export async function runNarrativePlanner(
  userPrompt: string,
  strategy: PresentationStrategy,
): Promise<SemanticIR> {
  const user = `Presentation request: ${userPrompt}

Strategy (follow it exactly):
- Intent: ${strategy.intent}
- Audience: ${strategy.audience}
- Goal: ${strategy.goal}
- Storytelling strategy: ${strategy.storytellingStrategy}
- Deck length: exactly ${strategy.deckLength} slides
- Tone: ${strategy.tone}

Produce the Semantic IR JSON with exactly ${strategy.deckLength} slides.`;

  const output = await structuredCall(PlannerOutputSchema, {
    system: SYSTEM,
    user,
    temperature: 0.6,
    maxTokens: 16000,
  });

  return SemanticIRSchema.parse({
    version: "2.0.0",
    stage: "semantic",
    title: output.title,
    strategy,
    slides: output.slides,
  });
}
