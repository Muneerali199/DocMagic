import { NextRequest, NextResponse } from "next/server";
import { createRoute } from "@/lib/supabase/server";
import { REPORT_AUTO_HIDE_THRESHOLD } from "@/lib/showcase/ranking.config";
import type { ReportRequest } from "@/types/showcase";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const supabase = await createRoute();
  const { id: postId } = params;

  // ── Auth required ─────────────────────────────────────────────────────────
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: ReportRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { reason } = body;

  if (!reason || reason.trim().length < 5) {
    return Response.json(
      { error: "Reason must be at least 5 characters" },
      { status: 400 }
    );
  }

  // ── Verify post exists ────────────────────────────────────────────────────
  const { data: post, error: postError } = await supabase
    .from("showcase_posts")
    .select("id, user_id, status, report_count")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return Response.json({ error: "Post not found" }, { status: 404 });
  }

  // Cannot report your own post
  if (post.user_id === user.id) {
    return Response.json({ error: "Cannot report your own post" }, { status: 422 });
  }

  // ── Insert report ─────────────────────────────────────────────────────────
  const { error: reportError } = await supabase
    .from("showcase_reports")
    .insert({
      post_id:     postId,
      reporter_id: user.id,
      reason:      reason.trim(),
      status:      "pending",
    });

  if (reportError) {
    // 23505 = unique_violation (user already reported this post)
    if (reportError.code === "23505") {
      return Response.json(
        { error: "You have already reported this post" },
        { status: 409 }
      );
    }
    console.error("[showcase/report] insert error:", reportError);
    return Response.json({ error: "Failed to submit report" }, { status: 500 });
  }

  // ── Increment report counter ──────────────────────────────────────────────
  const newCount = (post.report_count ?? 0) + 1;

  const updatePayload: Record<string, unknown> = {
    report_count: newCount,
  };

  // Auto-flip to under_review when threshold is crossed
  if (newCount >= REPORT_AUTO_HIDE_THRESHOLD && post.status === "published") {
    updatePayload.status = "under_review";
  }

  const { error: updateError } = await supabase
    .from("showcase_posts")
    .update(updatePayload as any)
    .eq("id", postId);

  if (updateError) {
    console.error("[showcase/report] update error:", updateError);
    // Non-fatal — report was submitted, counter update failed
  }

  return Response.json({ success: true }, { status: 201 });
}