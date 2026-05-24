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

  //  Auth required
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Parse body 
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

  // Verify post exists
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

  // Verify post exists and user hasn't reported before, then submit atomically
  const { error: reportError } = await (supabase as any).rpc(
    "submit_report",
    {
      post_id_arg:     postId,
      reporter_id_arg: user.id,
      reason_arg:      reason.trim(),
      threshold_arg:   REPORT_AUTO_HIDE_THRESHOLD,
    }
  );

  if (reportError) {
    if (reportError.code === "23505") {
      return Response.json(
        { error: "You have already reported this post" },
        { status: 409 }
      );
    }
    console.error("[showcase/report] error:", reportError);
    return Response.json({ error: "Failed to submit report" }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 201 });
}
