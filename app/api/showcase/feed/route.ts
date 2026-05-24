import { NextRequest } from "next/server";
import { createRoute } from "@/lib/supabase/server";
import { computeRelevanceScore } from "@/lib/showcase/ranking";
import {
  encodeCursor, decodeCursor,
  encodeTimeCursor, decodeTimeCursor,
} from "@/lib/showcase/cursor";
import { FEED_DEFAULT_LIMIT, FEED_MAX_LIMIT, RANKING_WEIGHTS } from "@/lib/showcase/ranking.config";
import type { FeedItem, FeedResponse, FeedType } from "@/types/showcase";

export async function GET(req: NextRequest) {
  const supabase = await createRoute();
  const { searchParams } = new URL(req.url);

  const feedType    = (searchParams.get("type") ?? "trending") as FeedType;
  const cursorParam = searchParams.get("cursor");
  const limitParam  = parseInt(searchParams.get("limit") ?? String(FEED_DEFAULT_LIMIT));
  const limit       = Math.min(limitParam, FEED_MAX_LIMIT);

  if (!["trending", "latest", "for-you"].includes(feedType)) {
    return Response.json({ error: "Invalid feed type" }, { status: 400 });
  }

  // ── Viewer auth (optional — For You degrades to trending without it) ───────
  const { data: { user } } = await supabase.auth.getUser();

  try {
    let items: FeedItem[] = [];
    let next_cursor: string | null = null;

    if (feedType === "latest") {
      ({ items, next_cursor } = await fetchLatest(supabase, cursorParam, limit));
    } else if (feedType === "trending") {
      ({ items, next_cursor } = await fetchTrending(supabase, cursorParam, limit));
    } else {
      ({ items, next_cursor } = await fetchForYou(supabase, cursorParam, limit, user?.id));
    }

    return Response.json({ items, next_cursor, total_hint: null });
  } catch (err) {
    console.error("[showcase/feed] error:", err);
    return Response.json({ error: "Failed to load feed" }, { status: 500 });
  }
}

// Latest feed
// Simple time-ordered query from Postgres. No score needed.

async function fetchLatest(
  supabase: any,
  cursorParam: string | null,
  limit: number
): Promise<{ items: FeedItem[]; next_cursor: string | null }> {
  let query = supabase
    .from("showcase_posts")
    .select(`
      *,
      showcase_post_tags ( tag ),
      showcase_post_scores ( final_score, score_breakdown )
    `)
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursorParam) {
    const decoded = decodeTimeCursor(cursorParam);
    if (decoded) query = query.lt("created_at", decoded.created_at);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  const items = rows.map(mapToFeedItem);
  const next_cursor =
    hasMore && items.length > 0
      ? encodeTimeCursor(items[items.length - 1].created_at, items[items.length - 1].id)
      : null;

  return { items, next_cursor };
}

// Trending feed
// Ordered by final_score from showcase_post_scores.
// Freshness is already baked into final_score by the ranking job.

async function fetchTrending(
  supabase: any,
  cursorParam: string | null,
  limit: number
): Promise<{ items: FeedItem[]; next_cursor: string | null }> {
  let query = supabase
    .from("showcase_post_scores")
    .select(`
      final_score,
      score_breakdown,
      showcase_posts!inner (
        *,
        showcase_post_tags ( tag )
      )
    `)
    .eq("showcase_posts.visibility", "public")
    .eq("showcase_posts.status", "published")
    .order("final_score", { ascending: false })
    .limit(limit + 1);

  // Composite cursor — stable pagination even with identical scores
  if (cursorParam) {
    const decoded = decodeCursor(cursorParam);
    if (decoded) {
      query = query.or(
        `final_score.lt.${decoded.score},and(final_score.eq.${decoded.score},post_id.gt.${decoded.post_id})`
      );
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  const items = rows.map((row: any) => ({
    ...row.showcase_posts,
    tags:            row.showcase_posts.showcase_post_tags?.map((t: any) => t.tag) ?? [],
    score_breakdown: row.score_breakdown,
    final_score:     row.final_score,
    author_name:     null,
    author_avatar:   null,
  })) as FeedItem[];

  const next_cursor =
    hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].final_score, items[items.length - 1].id)
      : null;

  return { items, next_cursor };
}

//  For You feed
// Trending score + relevance boost based on viewer's tag/role preferences.
// Falls back to trending if user has no preferences set.

async function fetchForYou(
  supabase: any,
  cursorParam: string | null,
  limit: number,
  userId?: string
): Promise<{ items: FeedItem[]; next_cursor: string | null }> {
  // Load viewer preferences
  let viewerPrefTags: string[] = [];
  let viewerPrefRole: string | null = null;

  if (userId) {
    const { data: prefs } = await supabase
      .from("user_showcase_preferences")
      .select("pref_tags, pref_role")
      .eq("user_id", userId)
      .single();

    viewerPrefTags = prefs?.pref_tags ?? [];
    viewerPrefRole = prefs?.pref_role ?? null;
  }

  // No preferences → fall back to trending
  if (viewerPrefTags.length === 0 && !viewerPrefRole) {
    return fetchTrending(supabase, cursorParam, limit);
  }

  // Fetch a larger batch so we can re-sort by personalised score
  const { data, error } = await supabase
    .from("showcase_post_scores")
    .select(`
      final_score,
      score_breakdown,
      showcase_posts!inner (
        *,
        showcase_post_tags ( tag ),
        profiles ( full_name, avatar_url )
      )
    `)
    .eq("showcase_posts.visibility", "public")
    .eq("showcase_posts.status", "published")
    .order("final_score", { ascending: false })
    .limit((limit + 1) * 3); // Fetch 3× so re-ranking has enough candidates

  if (error) throw error;

  const rows = data ?? [];

  // Re-score each post with relevance contribution
  const scored = rows.map((row: any) => {
    const tags: string[] = row.showcase_posts.showcase_post_tags?.map((t: any) => t.tag) ?? [];
    const rel = computeRelevanceScore({
      post_tags:        tags,
      post_role:        row.showcase_posts.role,
      viewer_pref_tags: viewerPrefTags,
      viewer_pref_role: viewerPrefRole,
    });

    const personalised_score =
      row.final_score + RANKING_WEIGHTS.RELEVANCE * rel.score;

    return {
      post: row.showcase_posts,
      tags,
      score_breakdown: row.score_breakdown,
      final_score: personalised_score,
      relevance: rel,
      profiles: row.showcase_posts.profiles,
    };
  });

  // Sort by personalised score
  scored.sort((a: any, b: any) => b.final_score - a.final_score);

  // Apply cursor
  let sliced = scored;
  if (cursorParam) {
    const decoded = decodeCursor(cursorParam);
    if (decoded) {
      sliced = scored.filter((r: any) => r.final_score < decoded.score);
    }
  }

  const page = sliced.slice(0, limit + 1);
  const hasMore = page.length > limit;
  if (hasMore) page.pop();

  const items: FeedItem[] = page.map((r: any) => ({
    ...r.post,
    tags:            r.tags,
    score_breakdown: r.score_breakdown,
    final_score:     r.final_score,
    author_name:     r.profiles?.full_name ?? null,
    author_avatar:   r.profiles?.avatar_url ?? null,
  }));

  const next_cursor =
    hasMore && items.length > 0
      ? encodeCursor(items[items.length - 1].final_score, items[items.length - 1].id)
      : null;

  return { items, next_cursor };
}

// Helper

function mapToFeedItem(row: any): FeedItem {
  return {
    ...row,
    tags:            row.showcase_post_tags?.map((t: any) => t.tag) ?? [],
    score_breakdown: row.showcase_post_scores?.[0]?.score_breakdown ?? null,
    final_score:     row.showcase_post_scores?.[0]?.final_score ?? 0,
    author_name:     row.profiles?.full_name ?? null,
    author_avatar:   row.profiles?.avatar_url ?? null,
  };
}

