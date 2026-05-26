import type { PostType } from "@/types/showcase";

export interface QualityInput {
  type:          PostType;
  title:         string;
  role:          string;
  tags:          string[];
  template_used: string | null;
  content_ref:   string;
}

/**
 * V1 — Deterministic heuristic quality scorer.
 * Returns a normalised score 0–1.
 *
 * No AI calls here — fast and free at publish time.
 */
export function computeQualityScore(input: QualityInput): number {
  let score    = 0;
  let maxScore = 0;

  // Signal 1 — title length and substance (10 pts)
  maxScore += 10;
  const titleLen = input.title.trim().length;
  if (titleLen >= 10 && titleLen <= 80) score += 10;
  else if (titleLen >= 5)               score += 5;

  // Signal 2 — role specificity (15 pts)
  maxScore += 15;
  if (input.role.trim().length >= 5)  score += 15;
  else if (input.role.trim().length > 0) score += 7;

  // Signal 3 — tag coverage (20 pts)
  maxScore += 20;
  if (input.tags.length >= 2)      score += 20;
  else if (input.tags.length === 1) score += 10;

  // Signal 4 — template used (15 pts)
  // Posts using a template are assumed to have better visual structure
  maxScore += 15;
  if (input.template_used) score += 15;

  // Signal 5 — type bonus (10 pts)
  maxScore += 10;
  if (input.type === "resume") score += 10;
  else score += 8; // presentation still gets most points

  // Signal 6 — content_ref present (30 pts)
  // Ensures the document was actually uploaded before publishing
  maxScore += 30;
  if (input.content_ref.trim().length > 0) score += 30;

  const normalised = maxScore > 0 ? score / maxScore : 0;
  return parseFloat(normalised.toFixed(4));
}

