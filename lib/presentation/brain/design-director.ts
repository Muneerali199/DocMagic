/**
 * Design Director — LLM stage between the Narrative Planner and the
 * deterministic Design Engine.
 *
 *   Semantic IR → Design Director → Design IR → Design Engine (tokens)
 *
 * The Director makes VISUAL STYLE decisions only: design language, mood,
 * accent color, density, type scale, corner treatment, contrast level, and
 * image treatment. It NEVER outputs coordinates, sizes in px, or layout
 * instructions — those remain the deterministic engines' job. The Design
 * Engine maps the Design IR onto concrete DesignTokens.
 */

import { z } from "zod";
import type { PresentationStrategy, SemanticIR } from "../ir/schema";
import { designLanguageIds } from "../design/languages";
import { structuredCall } from "./client";

export const DesignIRSchema = z.object({
  /** one of the Design Language ids in the library */
  designLanguage: z.string(),
  /** 2-4 word description of the intended visual feeling */
  mood: z.string(),
  /** optional brand accent override, hex only (e.g. "#0F62FE") */
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  /** how much breathing room the deck should have */
  density: z.enum(["airy", "balanced", "compact"]).default("balanced"),
  /** overall type sizing posture */
  typeScale: z.enum(["compact", "regular", "generous"]).default("regular"),
  /** corner treatment posture */
  corners: z.enum(["sharp", "soft", "round"]).optional(),
  /** how strongly primary elements should stand out */
  contrast: z.enum(["subtle", "standard", "bold"]).default("standard"),
  /** preferred image treatment */
  imageTreatment: z.enum(["photo", "duotone", "geometric", "none"]).optional(),
  /** one sentence explaining the direction (for the UI) */
  rationale: z.string().default(""),
});

export type DesignIR = z.infer<typeof DesignIRSchema>;

const SYSTEM = `You are the Design Director inside a presentation compiler. You define the visual style direction for a deck — a Design IR.

You decide STYLE ONLY. You never output coordinates, pixel sizes, margins, font names, or layout instructions. Deterministic engines translate your direction into design tokens, layouts, and geometry.

Return ONLY JSON:
{
  "designLanguage": string,      // one of the available language ids
  "mood": string,                // 2-4 words, e.g. "confident, technical, warm"
  "accentColor": "#RRGGBB"?,     // only if the topic/brand strongly implies one
  "density": "airy"|"balanced"|"compact",
  "typeScale": "compact"|"regular"|"generous",
  "corners": "sharp"|"soft"|"round"?,
  "contrast": "subtle"|"standard"|"bold",
  "imageTreatment": "photo"|"duotone"|"geometric"|"none"?,
  "rationale": string            // one sentence
}

Guidance:
- Match the audience and tone: executives → restrained contrast and airy density; developers → technical languages and compact density; investors → bold contrast.
- Content-heavy decks (many diagrams/tables) need "airy" or "balanced" density and "compact"/"regular" type; short punchy decks can be "generous".
- Only set accentColor when the subject has a strong color identity. Otherwise omit it and let the language's palette stand.
- Never pick a dark language for dense data-heavy decks unless the tone demands it.`;

export async function runDesignDirector(
  userPrompt: string,
  strategy: PresentationStrategy,
  semantic: SemanticIR,
): Promise<DesignIR> {
  const contentProfile = summarizeContent(semantic);
  const languages = designLanguageIds().join(", ");

  const user = `Presentation request: ${userPrompt}

Strategy:
- Intent: ${strategy.intent}
- Audience: ${strategy.audience}
- Goal: ${strategy.goal}
- Tone: ${strategy.tone}
- Story: ${strategy.storytellingStrategy}, ${strategy.deckLength} slides

Deck content profile:
${contentProfile}

Available design language ids: ${languages}

Produce the Design IR JSON.`;

  const raw = await structuredCall(DesignIRSchema, {
    system: SYSTEM,
    user,
    temperature: 0.5,
    maxTokens: 1200,
  });

  // guard: unknown language ids fall back to the engine's own selection
  if (!designLanguageIds().includes(raw.designLanguage)) {
    return { ...raw, designLanguage: "" };
  }
  return raw;
}

/** Compact structural summary so the Director sees what it is styling. */
function summarizeContent(semantic: SemanticIR): string {
  const counts = new Map<string, number>();
  let diagrams = 0;
  let charts = 0;
  let images = 0;
  let tables = 0;
  for (const slide of semantic.slides) {
    counts.set(slide.type, (counts.get(slide.type) ?? 0) + 1);
    for (const el of slide.elements) {
      if (el.kind === "diagram") diagrams++;
      else if (el.kind === "chart") charts++;
      else if (el.kind === "image") images++;
      else if (el.kind === "table") tables++;
    }
  }
  const slideTypes = Array.from(counts.entries())
    .map(([t, n]) => `${t}×${n}`)
    .join(", ");
  return `- Slide types: ${slideTypes}
- Diagrams: ${diagrams}, charts: ${charts}, tables: ${tables}, images: ${images}
- Title: ${semantic.title}`;
}
