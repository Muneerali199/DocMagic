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

/** Stage 2a — a lightweight outline: fast to generate, sets the narrative. */
const OutlineSchema = z.object({
  title: z.string(),
  slides: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        intent: z.string(),
        headline: z.string(),
        keyPoints: z.array(z.string()).default([]),
      }),
    )
    .min(1),
});

/** Stage 2b — one fully-detailed slide, expanded in parallel per slide. */
const SlideOutputSchema = z.object({
  slide: SemanticSlideSchema,
});

const OUTLINE_SYSTEM = `You are a narrative planner inside a presentation compiler. You design the story arc of a deck as a compact outline.

Slide types (pick the most specific): hero, kpi, timeline, comparison, process, flowchart, architecture, orgchart, swot, funnel, pyramid, roadmap, gallery, quote, dashboard, content, agenda, section, closing.

Rules:
- First slide is "hero", last is "closing". Vary types; never more than two consecutive "content" slides.
- headline: max 6 words, punchy and concrete. intent: one sentence — what the slide must communicate.
- keyPoints: 2-4 short phrases of the facts/numbers/entities the slide should contain (consistent across the deck).
- Follow the storytelling strategy's arc.

Return ONLY JSON: { "title": string, "slides": [{ "id": "slug", "type": string, "intent": string, "headline": string, "keyPoints": string[] }] }`;

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

/** Run async tasks with a concurrency cap so we don't hammer the provider. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

export async function runNarrativePlanner(
  userPrompt: string,
  strategy: PresentationStrategy,
): Promise<SemanticIR> {
  const strategyBlock = `Presentation request: ${userPrompt}

Strategy (follow it exactly):
- Intent: ${strategy.intent}
- Audience: ${strategy.audience}
- Goal: ${strategy.goal}
- Storytelling strategy: ${strategy.storytellingStrategy}
- Deck length: exactly ${strategy.deckLength} slides
- Tone: ${strategy.tone}`;

  // Stage 2a: fast outline (small completion, sets the whole narrative)
  const outline = await structuredCall(OutlineSchema, {
    system: OUTLINE_SYSTEM,
    user: `${strategyBlock}\n\nProduce the outline JSON with exactly ${strategy.deckLength} slides.`,
    temperature: 0.6,
    maxTokens: 3000,
  });

  // Stage 2b: expand every slide in parallel — wall time ≈ one slide, not N
  const deckContext = outline.slides
    .map((s, i) => `${i + 1}. [${s.type}] ${s.headline} — ${s.intent}`)
    .join("\n");

  const slides = await mapWithConcurrency(outline.slides, 6, (o, i) =>
    structuredCall(SlideOutputSchema, {
      system: SYSTEM,
      user: `${strategyBlock}

Full deck outline (for consistency — numbers and entities must match across slides):
${deckContext}

Expand ONLY slide ${i + 1} into a complete Semantic IR slide:
- id: "${o.id}", type: "${o.type}", intent: "${o.intent}"
- headline: "${o.headline}"
- key points to cover: ${(o.keyPoints ?? []).join("; ") || "planner's choice"}

Return ONLY JSON: { "slide": { ...complete slide object... } }`,
      temperature: 0.5,
      maxTokens: 4000,
    }).then((out) => out.slide),
  );

  return SemanticIRSchema.parse({
    version: "2.0.0",
    stage: "semantic",
    title: outline.title,
    strategy,
    slides,
  });
}
