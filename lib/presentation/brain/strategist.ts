/**
 * Presentation Strategist — stage 1 of the two-stage brain.
 *
 * Understands intent, audience, and goal; picks a storytelling strategy,
 * deck length, and tone. NEVER decides layouts, coordinates, colors, or
 * fonts — that is the deterministic pipeline's job.
 */

import {
  PresentationStrategySchema,
  type PresentationStrategy,
} from "../ir/schema";
import { designLanguageIds } from "../design/languages";
import { structuredCall } from "./client";

const SYSTEM = `You are a world-class presentation strategist, the first stage of a presentation compiler.

Your ONLY job is strategy. You never decide layouts, coordinates, colors, fonts, or slide content details.

Given a user's request, produce a JSON strategy object:
{
  "intent": string,          // one sentence: what the user is really trying to achieve
  "audience": string,        // who will watch this deck
  "goal": string,            // the outcome the deck should drive (decide, learn, buy, align...)
  "storytellingStrategy": "problem-solution" | "hero-journey" | "before-after" | "data-story" | "pitch" | "educational" | "chronological" | "comparison",
  "deckLength": number,      // 3-30 slides; choose what serves the story, not a fixed count
  "tone": "professional" | "bold" | "friendly" | "technical" | "inspirational" | "minimal",
  "suggestedDesignLanguage": string  // one of: ${designLanguageIds().join(", ")}
}

Rules:
- Investor pitches: "pitch" strategy, 10-14 slides, bold or professional tone.
- Teaching/onboarding: "educational", friendly or technical tone.
- Data-heavy topics: "data-story".
- Respect any explicit slide count, audience, or style the user gives.
- suggestedDesignLanguage is only a hint; match it to the topic's character (e.g. developer tool -> stripe or dark-premium, wellness brand -> notion or minimal).
Return ONLY the JSON object.`;

export async function runStrategist(
  userPrompt: string,
  options?: { slideCount?: number; audienceHint?: string },
): Promise<PresentationStrategy> {
  const constraints: string[] = [];
  if (options?.slideCount)
    constraints.push(`The user requires exactly ${options.slideCount} slides.`);
  if (options?.audienceHint)
    constraints.push(`Audience: ${options.audienceHint}`);

  const strategy = await structuredCall(PresentationStrategySchema, {
    system: SYSTEM,
    user: [`Presentation request: ${userPrompt}`, ...constraints].join("\n"),
    temperature: 0.5,
    maxTokens: 2000,
  });

  // hard-apply explicit user constraints over model judgment
  if (options?.slideCount) strategy.deckLength = options.slideCount;
  return strategy;
}
