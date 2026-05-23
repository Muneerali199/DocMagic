import {
  RANKING_WEIGHTS,
  ENGAGEMENT_WEIGHTS,
  ENGAGEMENT_MAX_RAW,
  FRESHNESS_LAMBDA,
  RELEVANCE_TAG_WEIGHT,
  RELEVANCE_ROLE_WEIGHT,
  BURST_ENGAGEMENT_PENALTY,
} from "./ranking.config";
import type { ScoreBreakdown } from "@/types/showcase";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface EngagementRaw {
  likes:        number;
  saves:        number;
  shares:       number;
  views:        number;
  dwell_sum_ms: number;
  dwell_count:  number;
  burst_flagged: boolean;
}

export interface RelevanceInput {
  post_tags:        string[];
  post_role:        string;
  viewer_pref_tags: string[];
  viewer_pref_role: string | null;
}

// ─── Quality ──────────────────────────────────────────────────────────────────
// quality_score is computed once at publish time and stored on the post row.
// This function just clamps it to [0, 1].

export function computeQualityScore(stored: number): number {
  return Math.min(1, Math.max(0, stored));
}

// ─── Engagement ───────────────────────────────────────────────────────────────

export function computeEngagementScore(raw: EngagementRaw): {
  score:         number;
  dwell_score:   number;
  burst_penalised: boolean;
} {
  // Average dwell normalised to [0, 1] where 1 = 60 seconds
  const dwell_score =
    raw.dwell_count > 0
      ? Math.min(raw.dwell_sum_ms / raw.dwell_count / 60_000, 1)
      : 0;

  const rawTotal =
    raw.likes  * ENGAGEMENT_WEIGHTS.LIKE  +
    raw.saves  * ENGAGEMENT_WEIGHTS.SAVE  +
    raw.shares * ENGAGEMENT_WEIGHTS.SHARE +
    raw.views  * ENGAGEMENT_WEIGHTS.VIEW  +
    dwell_score * ENGAGEMENT_WEIGHTS.DWELL;

  // log1p normalisation stops viral posts from dominating the feed
  let score = Math.log1p(rawTotal) / Math.log1p(ENGAGEMENT_MAX_RAW);
  score = Math.min(1, score);

  if (raw.burst_flagged) score *= BURST_ENGAGEMENT_PENALTY;

  return { score, dwell_score, burst_penalised: raw.burst_flagged };
}

// ─── Freshness ────────────────────────────────────────────────────────────────

export function computeFreshnessScore(createdAt: Date): {
  score:     number;
  age_hours: number;
} {
  const age_hours = (Date.now() - createdAt.getTime()) / 3_600_000;
  const score = Math.exp(-FRESHNESS_LAMBDA * age_hours);
  return { score, age_hours };
}

// ─── Relevance (For You feed only) ───────────────────────────────────────────

export function computeRelevanceScore(input: RelevanceInput): {
  score:       number;
  tag_overlap: number;
  role_match:  boolean;
} {
  const postSet = new Set(input.post_tags);
  const prefSet = new Set(input.viewer_pref_tags);

  // Jaccard similarity: intersection / union
  const intersection = [...postSet].filter((t) => prefSet.has(t)).length;
  const union = new Set([...postSet, ...prefSet]).size;
  const tag_overlap = union === 0 ? 0 : intersection / union;

  const role_match =
    !!input.viewer_pref_role &&
    input.post_role.toLowerCase() === input.viewer_pref_role.toLowerCase();

  const score =
    RELEVANCE_TAG_WEIGHT  * tag_overlap +
    RELEVANCE_ROLE_WEIGHT * (role_match ? 1 : 0);

  return { score, tag_overlap, role_match };
}

// ─── Final score assembly ─────────────────────────────────────────────────────

export interface ComputeFinalScoreInput {
  quality_score: number;
  engagement:    EngagementRaw;
  created_at:    Date;
  relevance?:    RelevanceInput; // omit for trending/latest
}

export function computeFinalScore(input: ComputeFinalScoreInput): ScoreBreakdown {
  const quality = computeQualityScore(input.quality_score);

  const { score: engagement_score, dwell_score, burst_penalised } =
    computeEngagementScore(input.engagement);

  const { score: freshness_score, age_hours } =
    computeFreshnessScore(input.created_at);

  const rel = input.relevance
    ? computeRelevanceScore(input.relevance)
    : null;

  const w = RANKING_WEIGHTS;

  const final_score =
    w.QUALITY    * quality          +
    w.ENGAGEMENT * engagement_score +
    w.FRESHNESS  * freshness_score  +
    w.RELEVANCE  * (rel?.score ?? 0);

  return {
    quality: {
      score:        quality,
      weight:       w.QUALITY,
      contribution: w.QUALITY * quality,
    },
    engagement: {
      score:        engagement_score,
      weight:       w.ENGAGEMENT,
      contribution: w.ENGAGEMENT * engagement_score,
      raw: {
        likes:       input.engagement.likes,
        saves:       input.engagement.saves,
        shares:      input.engagement.shares,
        views:       input.engagement.views,
        dwell_score,
      },
      burst_penalised,
    },
    freshness: {
      score:        freshness_score,
      weight:       w.FRESHNESS,
      contribution: w.FRESHNESS * freshness_score,
      age_hours,
    },
    relevance: rel
      ? {
          score:        rel.score,
          weight:       w.RELEVANCE,
          contribution: w.RELEVANCE * rel.score,
          tag_overlap:  rel.tag_overlap,
          role_match:   rel.role_match,
        }
      : null,
    final_score,
    computed_at: new Date().toISOString(),
  };
}

export function defaultEngagement(): EngagementRaw {
  return {
    likes: 0, saves: 0, shares: 0, views: 0,
    dwell_sum_ms: 0, dwell_count: 0, burst_flagged: false,
  };
}