import { NextRequest, NextResponse } from "next/server";
import { createRoute } from "@/lib/supabase/server";
import { hashIp, getClientIp } from "@/lib/showcase/ip";
import { VIEW_DEDUP_MINUTES } from "@/lib/showcase/ranking.config";

interface RouteParams {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const supabase = await createRoute();
  const { id: postId } = params;

  // ── Fetch post ────────────────────────────────────────────────────────────
  const { data: post, error } = await supabase
    .from("showcase_posts")
    .select(`
      *,
      showcase_post_tags ( tag ),
      showcase_post_scores ( final_score, score_breakdown ),
      profiles ( full_name, avatar_url )
    `)
    .eq("id", postId)
    .single() as any;

  if (error || !post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  // ── Visibility enforcement ────────────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser();

  // Private — only the owner can see it
  if (post.visibility === "private" && post.user_id !== user?.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Hidden / under review — only the owner can see it
  if (post.status !== "published" && post.user_id !== user?.id) {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  // ── Fire view event (deduped, fire-and-forget) ────────────────────────────
  recordView(supabase, postId, user?.id ?? null, req.headers).catch((e) =>
    console.error("[showcase/:id] view error:", e)
  );

  return Response.json({
    ...post,
    tags:            post.showcase_post_tags?.map((t: { tag: string }) => t.tag) ?? [],
    score_breakdown: post.showcase_post_scores?.[0]?.score_breakdown ?? null,
    final_score:     post.showcase_post_scores?.[0]?.final_score ?? 0,
    author_name:     post.profiles?.full_name ?? null,
    author_avatar:   post.profiles?.avatar_url ?? null,
  });
}

async function recordView(
  supabase: any,
  postId: string,
  userId: string | null,
  headers: Headers
) {
  const ip     = getClientIp(headers);
  const ipHash = hashIp(ip);

   let query = supabase
    .from("showcase_engagement_events")
    .select("id")
    .eq("post_id", postId)
    .eq("event_type", "view")
    .gte("created_at", new Date(Date.now() - VIEW_DEDUP_MINUTES * 60_000).toISOString());

     query = userId
      ? query.eq("user_id", userId)
      : query.eq("ip_hash", ipHash);

  const { data: existing } = await query.limit(1);

  if (existing && existing.length > 0) return; // Already counted

  await supabase.from("showcase_engagement_events").insert({
    post_id:    postId,
    user_id:    userId,
    ip_hash:    ipHash,
    event_type: "view",
    dwell_ms:   null,
  });
}