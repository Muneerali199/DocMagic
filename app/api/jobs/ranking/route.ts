import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { computeFinalScore, defaultEngagement } from "@/lib/showcase/ranking";
import type { EngagementRaw } from "@/lib/showcase/ranking";
import { BURST_LIKE_THRESHOLD, BURST_WINDOW_MINUTES } from "@/lib/showcase/ranking.config";


function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorised(req)) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const startedAt = Date.now();
  const supabase = createSupabaseAdmin();

  try {
    // ── 1. Load all posts that need scoring ───────────────────────────────
    const { data: posts, error: postsError } = await supabase
      .from("showcase_posts")
      .select("id, quality_score, role, status, visibility, created_at")
      .in("status", ["published", "under_review", "hidden"]);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) {
      return Response.json({ processed: 0, elapsed_ms: Date.now() - startedAt });
    }

    const postIds = posts.map((p: { id: string }) => p.id);

    // ── 2. Aggregate engagement for all posts in one query ────────────────
    const { data: engRows, error: engError } = await supabase
      .from("showcase_engagement_events")
      .select("post_id, event_type, dwell_ms")
      .in("post_id", postIds)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString());
    // Only count last 30 days of engagement — older signals fade naturally via freshness

    if (engError) throw engError;

    // Build engagement map
    const engMap = new Map<string, EngagementRaw>();
    for (const row of engRows ?? []) {
      if (!engMap.has(row.post_id)) {
        engMap.set(row.post_id, defaultEngagement());
      }
      const e = engMap.get(row.post_id)!;
      switch (row.event_type) {
        case "like":  e.likes++;  break;
        case "save":  e.saves++;  break;
        case "share": e.shares++; break;
        case "view":  e.views++;  break;
        case "dwell":
          e.dwell_sum_ms += row.dwell_ms ?? 0;
          e.dwell_count++;
          break;
      }
    }

    // ── 3. Detect burst flags via recent like count ───────────────────────
    const burstWindow = new Date(
      Date.now() - BURST_WINDOW_MINUTES * 60_000
    ).toISOString();

    const { data: burstRows, error: burstError } = await supabase
      .from("showcase_engagement_events")
      .select("post_id")
      .in("post_id", postIds)
      .eq("event_type", "like")
      .gte("created_at", burstWindow);

    if (burstError) {
      logger.error({ route: 'app/api/jobs/ranking/route.ts' }, "[ranking-job] burst detection query failed:", burstError);
      throw burstError;
    }

    // Count likes per post in burst window
    const burstCounts = new Map<string, number>();
    for (const row of burstRows ?? []) {
      burstCounts.set(row.post_id, (burstCounts.get(row.post_id) ?? 0) + 1);
    }

    // Flag posts that exceeded the threshold
    for (const [postId, count] of burstCounts) {
      if (count >= BURST_LIKE_THRESHOLD) {
        const eng = engMap.get(postId) ?? defaultEngagement();
        eng.burst_flagged = true;
        engMap.set(postId, eng);
      }
    }

    // ── 4. Compute final scores ───────────────────────────────────────────
    const scoreUpserts = posts.map((post: any) => {
      const engagement = engMap.get(post.id) ?? defaultEngagement();

      const breakdown = computeFinalScore({
        quality_score: post.quality_score,
        engagement,
        created_at:    new Date(post.created_at),
        // relevance is viewer-specific — not stored globally
      });

      return {
        post_id:          post.id,
        quality_score:    post.quality_score,
        engagement_score: breakdown.engagement.score,
        freshness_score:  breakdown.freshness.score,
        relevance_score:  null,
        final_score:      breakdown.final_score,
        score_breakdown:  breakdown,
        updated_at:       new Date().toISOString(),
      };
    });

    // ── 5. Upsert scores to Postgres ──────────────────────────────────────
    // Process in batches of 100 to avoid payload limits
    const BATCH = 100;
    for (let i = 0; i < scoreUpserts.length; i += BATCH) {
      const batch = scoreUpserts.slice(i, i + BATCH);
      const { error: upsertError } = await supabase
        .from("showcase_post_scores")
        .upsert(batch as any , { onConflict: "post_id" });

      if (upsertError) throw upsertError;
    }

    const elapsed_ms = Date.now() - startedAt;
    // console.log(`[ranking-job] processed ${posts.length} posts in ${elapsed_ms}ms`);

    return Response.json({ processed: posts.length, elapsed_ms });

  } catch (err) {
    logger.error({ route: 'app/api/jobs/ranking/route.ts' }, "[ranking-job] error:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}