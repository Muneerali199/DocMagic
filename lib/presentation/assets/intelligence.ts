/**
 * Asset Intelligence Engine — multi-factor ranking of image candidates.
 *
 * Providers supply candidates with whatever metadata they have; the ranker
 * scores each candidate against the semantic request AND the active design
 * language so the chosen asset fits the deck, not just the keyword.
 *
 * Deterministic given the same candidates: scoring is pure math over
 * candidate metadata.
 */

import type { DesignTokens } from "../design/tokens";
import { parseColor, luminance } from "../color/engine";

export interface AssetRequest {
  /** semantic query from the Semantic IR image element */
  query: string;
  /** slide intent, for extra relevance terms */
  context?: string;
  aspect: "wide" | "square" | "tall" | "auto";
}

export interface AssetCandidate {
  id: string;
  url: string;
  thumbUrl?: string;
  description: string | null;
  width?: number;
  height?: number;
  /** dominant color as hex, if the provider exposes it */
  dominantColor?: string;
  /** provider-reported relevance rank (0 = best) */
  providerRank: number;
  license: "free" | "attribution" | "unknown";
  attribution?: string;
}

export interface RankedAsset extends AssetCandidate {
  score: number;
  factors: Record<string, number>;
}

export interface AssetProvider {
  id: string;
  search(request: AssetRequest, limit: number): Promise<AssetCandidate[]>;
}

// ---------------------------------------------------------------------------
// Scoring factors — each returns 0..1
// ---------------------------------------------------------------------------

function semanticRelevance(c: AssetCandidate, req: AssetRequest): number {
  // provider rank is the strongest signal we have without a vision model
  const rankScore = Math.max(0, 1 - c.providerRank * 0.15);
  if (!c.description) return rankScore * 0.85;
  const desc = c.description.toLowerCase();
  const terms = `${req.query} ${req.context ?? ""}`
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 3);
  if (terms.length === 0) return rankScore;
  const hits = terms.filter((t) => desc.includes(t)).length;
  return Math.min(1, rankScore * 0.7 + (hits / terms.length) * 0.3 + 0.05);
}

function aspectFit(c: AssetCandidate, req: AssetRequest): number {
  if (!c.width || !c.height || req.aspect === "auto") return 0.7;
  const ratio = c.width / c.height;
  const target =
    req.aspect === "wide" ? 16 / 9 : req.aspect === "square" ? 1 : 3 / 4;
  const diff = Math.abs(ratio - target) / target;
  return Math.max(0, 1 - diff);
}

/**
 * Color compatibility: how well the candidate's dominant color sits in the
 * design language. Dark themes prefer darker imagery and vice versa.
 */
function colorCompatibility(c: AssetCandidate, tokens: DesignTokens): number {
  if (!c.dominantColor) return 0.6;
  const dom = parseColor(c.dominantColor);
  const bg = parseColor(tokens.colors.background);
  if (!dom || !bg) return 0.6;
  const domLum = luminance(dom);
  const bgLum = luminance(bg);
  // closer luminance = smoother blend with the deck
  return Math.max(0, 1 - Math.abs(domLum - bgLum) * 1.2);
}

function resolutionQuality(c: AssetCandidate): number {
  if (!c.width || !c.height) return 0.6;
  const px = c.width * c.height;
  if (px >= 1920 * 1080) return 1;
  if (px >= 1280 * 720) return 0.8;
  if (px >= 640 * 480) return 0.5;
  return 0.2;
}

function licensingScore(c: AssetCandidate): number {
  if (c.license === "free") return 1;
  if (c.license === "attribution") return 0.85;
  return 0.5;
}

function accessibilityScore(c: AssetCandidate): number {
  // candidates with real descriptions produce meaningful alt text
  return c.description && c.description.length > 8 ? 1 : 0.6;
}

const WEIGHTS = {
  relevance: 0.34,
  aspect: 0.16,
  color: 0.16,
  resolution: 0.14,
  license: 0.1,
  accessibility: 0.1,
} as const;

export function rankAssets(
  candidates: AssetCandidate[],
  request: AssetRequest,
  tokens: DesignTokens,
): RankedAsset[] {
  return candidates
    .map((c) => {
      const factors = {
        relevance: semanticRelevance(c, request),
        aspect: aspectFit(c, request),
        color: colorCompatibility(c, tokens),
        resolution: resolutionQuality(c),
        license: licensingScore(c),
        accessibility: accessibilityScore(c),
      };
      const score = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce(
        (sum, k) => sum + factors[k] * WEIGHTS[k],
        0,
      );
      return { ...c, score: Math.round(score * 1000) / 1000, factors };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

/** Search all providers, rank, and return the best asset (or null). */
export async function selectAsset(
  request: AssetRequest,
  tokens: DesignTokens,
  providers: AssetProvider[],
  limit = 8,
): Promise<RankedAsset | null> {
  const results = await Promise.allSettled(
    providers.map((p) => p.search(request, limit)),
  );
  const candidates = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );
  if (candidates.length === 0) return null;
  return rankAssets(candidates, request, tokens)[0] ?? null;
}
