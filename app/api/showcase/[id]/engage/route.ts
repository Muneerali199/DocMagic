import { NextRequest } from "next/server";
import { createRoute } from "@/lib/supabase/server";
import { hashIp, getClientIp } from "@/lib/showcase/ip";
import {
  VIEW_DEDUP_MINUTES,
  BURST_WINDOW_MINUTES,
  BURST_LIKE_THRESHOLD
} from "@/lib/showcase/ranking.config";
import type { EngageRequest } from "@/types/showcase";

interface RouteParams {
  params: { id: string };
}

const VALID_EVENTS = ["view", "like", "save", "share", "dwell"];

export async function POST(req: NextRequest, { params }: RouteParams) {
  const supabase = await createRoute();
  const { id: postId } = params;

  // Auth 
  const { data: { user } } = await supabase.auth.getUser();

  // Parse body 
  let body: EngageRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event_type, dwell_ms } = body;

  if (!VALID_EVENTS.includes(event_type)) {
    return Response.json({ error: "Invalid event_type" }, { status: 400 });
  }

  // Auth required for everything except view
  if (event_type !== "view" && !user) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Verify post exists and is public
  const { data: post, error: postError } = await supabase
    .from("showcase_posts")
    .select("id, user_id, visibility, status")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.visibility !== "public" || post.status !== "published") {
    return Response.json({ error: "Post not available" }, { status: 404 });
  }

  // Self-engagement guard
  if (user && post.user_id === user.id) {
    return Response.json(
      { error: "Cannot engage with your own post" },
      { status: 422 }
    );
  }

  const ip     = getClientIp(req.headers);
  const ipHash = hashIp(ip);

  // View dedup
  if (event_type === "view") {
    const windowStart = new Date(Date.now() - VIEW_DEDUP_MINUTES * 60_000).toISOString();

    const { data: existing } = await supabase
      .from("showcase_engagement_events")
      .select("id")
      .eq("post_id", postId)
      .eq("event_type", "view")
      .gte("created_at", windowStart)
      .or(
        user
          ? `user_id.eq.${user.id},ip_hash.eq.${ipHash}`
          : `ip_hash.eq.${ipHash}`
      )
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(null, { status: 204 }); // Already counted silently
    }
  }

  // Burst detection (likes only) 
  // If >50 likes in 5 minutes, flag the post. The ranking job will de-weight it.
  if (event_type === "like") {
    const burstWindow = new Date(Date.now() - BURST_WINDOW_MINUTES * 60_000).toISOString();

    const { count , error: burstCountError } = await supabase
      .from("showcase_engagement_events")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("event_type", "like")
      .gte("created_at", burstWindow);

    if (burstCountError) {
  console.error("[showcase/engage] burst count error:", burstCountError);
}

if ((count ?? 0) >= BURST_LIKE_THRESHOLD) {
  console.warn(`[showcase/engage] burst detected on post ${postId} — ${count} likes in ${BURST_WINDOW_MINUTES} minutes`);
  // Ranking job will de-weight this post on next run via like count check
}
  }

  // Insert event
  const { error: insertError } = await supabase
    .from("showcase_engagement_events")
    .insert({
      post_id:    postId,
      user_id:    user?.id ?? null,
      ip_hash:    ipHash,
      event_type,
      dwell_ms:   event_type === "dwell" && typeof dwell_ms === "number"
                    ? Math.round(dwell_ms)
                    : null,
    });

  if (insertError) {
    console.error("[showcase/engage] insert error:", insertError);
    return Response.json({ error: "Failed to record event" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}