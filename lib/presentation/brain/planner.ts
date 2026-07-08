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
- Every slide needs: id (slug), type, intent (one sentence: what this slide must communicate), elements, speakerNotes.
- Slide types: hero, kpi, timeline, comparison, process, architecture, gallery, quote, dashboard, content, agenda, section, closing.
- Element kinds and their JSON shapes:
  - text:    { "id", "kind": "text", "role": "title"|"subtitle"|"heading"|"body"|"bullet"|"caption"|"label"|"kicker", "content", "items"?: string[], "emphasis": "primary"|"secondary"|"tertiary" }
             (for role "bullet", put bullet points in "items" and keep "content" as an optional lead-in, may be "")
  - metric:  { "id", "kind": "metric", "value": "42%", "label": "Growth", "delta"?: "+12%", "trend"?: "up"|"down"|"flat", "emphasis" }
  - chart:   { "id", "kind": "chart", "chartType": "bar"|"line"|"area"|"pie"|"doughnut"|"radar"|"scatter", "title"?, "categories": string[], "series": [{ "name", "data": number[] }], "emphasis" }
  - diagram: { "id", "kind": "diagram", "diagramType": "flow"|"timeline"|"comparison"|"pyramid"|"process"|"funnel"|"cycle"|"swot"|"architecture", "nodes": [{ "id", "label", "sublabel"?, "emphasis" }], "edges": [{ "from", "to", "label"? }], "emphasis" }
  - image:   { "id", "kind": "image", "query": "descriptive search phrase", "alt": "accessible description", "aspect": "wide"|"square"|"tall"|"auto", "emphasis" }
  - icon:    { "id", "kind": "icon", "name": "lucide-icon-name", "label"?, "emphasis" }
  - table:   { "id", "kind": "table", "headers": string[], "rows": string[][], "emphasis" }
  - callout: { "id", "kind": "callout", "tone": "info"|"success"|"warning"|"insight", "title"?, "content", "emphasis" }
  - code:    { "id", "kind": "code", "language", "code", "caption"?, "emphasis" }

CONTENT QUALITY RULES:
- Exactly ONE element per slide should have emphasis "primary" (usually the title).
- 6 words max for titles; punchy, concrete, no generic filler.
- Max ~5 bullets per slide, each under 12 words.
- Use real, plausible numbers in metrics/charts (invent reasonable data when the user gives none, consistent across slides).
- kpi slides: 3-4 metric elements + a title. timeline slides: a timeline diagram. process slides: a flow/process diagram. comparison slides: comparison diagram or table.
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
