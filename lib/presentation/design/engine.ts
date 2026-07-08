/**
 * Design Engine — deterministic.
 *
 * Sits above typography, color, spacing, and layout. Selects the visual
 * design language for a presentation (from strategy or an explicit request)
 * and hands the composed DesignTokens to every downstream engine.
 */

import type { PresentationStrategy } from "../ir/schema";
import type { DesignIR } from "../brain/design-director";
import {
  DESIGN_LANGUAGES,
  getDesignLanguage,
  type DesignLanguage,
} from "./languages";
import type { DesignTokens, TypeScaleStep } from "./tokens";
import { readableTextColor } from "../color/engine";

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

// ---------------------------------------------------------------------------
// Design IR application — deterministic mapping of the Design Director's
// style decisions onto concrete DesignTokens. Style in, tokens out.
// ---------------------------------------------------------------------------

const DENSITY_SPACING: Record<DesignIR["density"], number> = {
  airy: 1.25,
  balanced: 1,
  compact: 0.85,
};

const TYPE_SCALE_FACTOR: Record<DesignIR["typeScale"], number> = {
  compact: 0.92,
  regular: 1,
  generous: 1.08,
};

const CORNER_RADIUS: Record<NonNullable<DesignIR["corners"]>, number> = {
  sharp: 0,
  soft: 8,
  round: 16,
};

function scaleStep(step: TypeScaleStep, f: number): TypeScaleStep {
  return { ...step, size: Math.round(step.size * f) };
}

/**
 * Resolve the design for a deck, honoring the Design Director's Design IR
 * when provided. Falls back to strategy-based selection when the IR omits
 * or mispecifies a field. Pure and deterministic.
 */
export function resolveDesignWithDirector(
  strategy: PresentationStrategy,
  designIR?: DesignIR,
  explicitLanguageId?: string,
): DesignResolution & { designIR?: DesignIR } {
  const base = resolveDesign(
    strategy,
    explicitLanguageId || designIR?.designLanguage || undefined,
  );
  if (!designIR) return base;

  const t = base.tokens;
  const spacingF = DENSITY_SPACING[designIR.density];
  const typeF = TYPE_SCALE_FACTOR[designIR.typeScale];

  const scale = Object.fromEntries(
    Object.entries(t.typography.scale).map(([k, v]) => [
      k,
      scaleStep(v, typeF),
    ]),
  ) as DesignTokens["typography"]["scale"];

  const colors = { ...t.colors };
  if (designIR.accentColor) {
    colors.primary = designIR.accentColor;
    colors.accent = designIR.accentColor;
    colors.primaryForeground = readableTextColor(
      colors.primaryForeground,
      designIR.accentColor,
      colors,
    );
  }

  const tokens: DesignTokens = {
    ...t,
    typography: { ...t.typography, scale },
    colors,
    spacing: {
      ...t.spacing,
      sectionGap: Math.round(t.spacing.sectionGap * spacingF),
      itemGap: Math.round(t.spacing.itemGap * spacingF),
      cardPadding: Math.round(t.spacing.cardPadding * spacingF),
      safeMargin: Math.round(
        t.spacing.safeMargin * (designIR.density === "airy" ? 1.1 : 1),
      ),
    },
    shape: {
      ...t.shape,
      ...(designIR.corners !== undefined
        ? {
            radius: CORNER_RADIUS[designIR.corners],
            radiusLg: CORNER_RADIUS[designIR.corners] * 1.5,
          }
        : {}),
      shadow:
        designIR.contrast === "bold"
          ? "md"
          : designIR.contrast === "subtle"
            ? "none"
            : t.shape.shadow,
    },
    illustration: {
      ...t.illustration,
      ...(designIR.imageTreatment
        ? { treatment: designIR.imageTreatment }
        : {}),
    },
  };

  return { language: base.language, tokens, designIR };
}
