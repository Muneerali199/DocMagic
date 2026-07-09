/**
 * Vision Design Critic — Kimi K2.6 (vision) reviews RENDERED slides.
 *
 * The deck is rasterized server-side (Resolved IR → SVG → PNG) and
 * representative slides are shown to the vision model, which judges
 * hierarchy, spacing, typography, and balance the way a human reviewer
 * would. It returns:
 *   - a score + human-readable issues/recommendations, and
 *   - a small set of STRUCTURED repair actions from a fixed vocabulary.
 *
 * Repairs are style-level knobs (density, type scale, contrast, corners).
 * The Repair Loop applies them by adjusting the Design IR and re-running
 * the deterministic compiler — the model never edits geometry, so
 * diagrams, charts, and layouts stay deterministic and fully editable.
 */

import { z } from "zod";
import type { ResolvedIR } from "../ir/schema";
import { visionCall } from "../brain/client";
import { rasterizeSlides, representativeSlideIndices } from "../render/svg";

export const RepairActionSchema = z.enum([
  "increase-whitespace",
  "reduce-type-scale",
  "increase-type-scale",
  "increase-contrast",
  "soften-corners",
  "sharpen-corners",
]);
export type RepairAction = z.infer<typeof RepairActionSchema>;

export const VisionCritiqueSchema = z.object({
  overallScore: z.number().min(0).max(100),
  hierarchy: z.number().min(0).max(100),
  spacing: z.number().min(0).max(100),
  typography: z.number().min(0).max(100),
  balance: z.number().min(0).max(100),
  issues: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),
  /** structured, deterministic-applicable fixes (max 2 applied) */
  repairs: z.array(RepairActionSchema).optional().default([]),
});
export type VisionCritique = z.infer<typeof VisionCritiqueSchema>;

const SYSTEM = `You are a senior presentation design critic. You are shown rendered slides from a generated deck (first slide, densest content slide, closing slide). Review them like an art director.

Evaluate ONLY visual design: hierarchy (is the eye guided correctly?), spacing (breathing room, margins, crowding), typography (scale relationships, readability), and balance (visual weight distribution).

Do NOT critique content, wording, or data accuracy. Images appear as gray placeholders — ignore their content, judge only their placement.

Return ONLY JSON:
{
  "overallScore": 0-100,
  "hierarchy": 0-100, "spacing": 0-100, "typography": 0-100, "balance": 0-100,
  "issues": string[],            // specific, e.g. "Slide 2: cards nearly touch the bottom edge"
  "recommendations": string[],   // targeted fixes a designer would make
  "repairs": string[]            // 0-2 items from EXACTLY this vocabulary:
                                 // "increase-whitespace", "reduce-type-scale",
                                 // "increase-type-scale", "increase-contrast",
                                 // "soften-corners", "sharpen-corners"
}

Only suggest repairs for real problems. A well-designed deck should return an empty repairs array. Score honestly: 85+ means ship-ready.`;

export async function runVisionCritic(
  ir: ResolvedIR,
  tokens: any,
): Promise<VisionCritique> {
  const indices = representativeSlideIndices(ir, 3);
  const images = await rasterizeSlides(ir, indices);

  const slideList = indices
    .map(
      (i) =>
        `- Image ${indices.indexOf(i) + 1}: slide ${i + 1} of ${ir.slides.length} ("${ir.slides[i].type}")`,
    )
    .join("\n");

  const raw = await visionCall(VisionCritiqueSchema, {
    system: SYSTEM,
    user: `Deck: "${ir.title}" — ${ir.slides.length} slides, design language "${ir.designLanguage}".

Rendered slides attached:
${slideList}

Review the visual design and return the critique JSON.`,
    images,
    temperature: 0.2,
    maxTokens: 2000,
  });

  // Ensure all arrays are present
  const result: VisionCritique = {
    overallScore: raw.overallScore,
    hierarchy: raw.hierarchy,
    spacing: raw.spacing,
    typography: raw.typography,
    balance: raw.balance,
    issues: raw.issues ?? [],
    recommendations: raw.recommendations ?? [],
    repairs: raw.repairs ?? [],
  };
  return result;
}
