/**
 * Design Engine — deterministic.
 *
 * Sits above typography, color, spacing, and layout. Selects the visual
 * design language for a presentation (from strategy or an explicit request)
 * and hands the composed DesignTokens to every downstream engine.
 */

import type { PresentationStrategy } from "../ir/schema";
import {
  DESIGN_LANGUAGES,
  getDesignLanguage,
  type DesignLanguage,
} from "./languages";
import type { DesignTokens } from "./tokens";

export interface DesignResolution {
  language: DesignLanguage;
  tokens: DesignTokens;
}

/**
 * Score a design language against a strategy. Pure and deterministic:
 * same strategy always produces the same language.
 */
function scoreLanguage(
  language: DesignLanguage,
  strategy: PresentationStrategy,
): number {
  let score = 0;
  if (language.affinity.tones.includes(strategy.tone)) score += 10;

  const haystack = [strategy.intent, strategy.goal, strategy.audience]
    .join(" ")
    .toLowerCase();
  for (const keyword of language.affinity.keywords) {
    if (haystack.includes(keyword)) score += 6;
  }

  // storytelling strategy nudges
  if (strategy.storytellingStrategy === "pitch" && language.id === "startup")
    score += 4;
  if (
    strategy.storytellingStrategy === "data-story" &&
    language.id === "corporate"
  )
    score += 3;
  if (
    strategy.storytellingStrategy === "educational" &&
    language.id === "google"
  )
    score += 3;

  return score;
}

export function resolveDesign(
  strategy: PresentationStrategy,
  explicitLanguageId?: string,
): DesignResolution {
  // 1. explicit user request wins
  if (explicitLanguageId) {
    const explicit = getDesignLanguage(explicitLanguageId);
    if (explicit) return { language: explicit, tokens: explicit.tokens };
  }

  // 2. strategist hint
  if (strategy.suggestedDesignLanguage) {
    const hinted = getDesignLanguage(strategy.suggestedDesignLanguage);
    if (hinted) return { language: hinted, tokens: hinted.tokens };
  }

  // 3. deterministic scoring
  let best = DESIGN_LANGUAGES[0];
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const language of DESIGN_LANGUAGES) {
    const s = scoreLanguage(language, strategy);
    if (s > bestScore) {
      best = language;
      bestScore = s;
    }
  }

  // 4. sensible fallback when nothing matched
  if (bestScore <= 0) {
    best = getDesignLanguage("stripe") ?? DESIGN_LANGUAGES[0];
  }

  return { language: best, tokens: best.tokens };
}
