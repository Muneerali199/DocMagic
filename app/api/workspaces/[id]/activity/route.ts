import { logger } from "@/lib/logger";
import { getWorkspaceMemberRole } from "@/lib/workspace-server";
import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createRoute();
  const workspaceId = params.id;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getWorkspaceMemberRole(supabase, workspaceId, user.id);
    if (!role) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100,
    );

    const { data: activity, error } = await supabase
      .from("workspace_activity")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const actorIds = [
      ...new Set((activity ?? []).map((a) => a.actor_id).filter(Boolean)),
    ] as string[];
    const { data: actors } = actorIds.length
      ? await supabase
          .from("users")
          .select("id, email, name")
          .in("id", actorIds)
      : { data: [] };
    const actorMap = new Map((actors ?? []).map((u) => [u.id, u]));

    const enriched = (activity ?? []).map((a) => ({
      ...a,
      actor: a.actor_id ? (actorMap.get(a.actor_id) ?? null) : null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/activity/route.ts" },
      "Error fetching activity",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
