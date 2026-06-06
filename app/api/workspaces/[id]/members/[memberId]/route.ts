import { logger } from "@/lib/logger";
import {
  getWorkspaceMemberRole,
  logWorkspaceActivity,
} from "@/lib/workspace-server";
import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { WorkspaceRole } from "@/types/workspace";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; memberId: string } },
) {
  const supabase = await createRoute();
  const { id: workspaceId, memberId } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const callerRole = await getWorkspaceMemberRole(
      supabase,
      workspaceId,
      user.id,
    );
    if (callerRole !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { role } = (await request.json()) as { role: WorkspaceRole };
    if (!["admin", "editor", "viewer"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const { data: member, error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId)
      .eq("workspace_id", workspaceId)
      .select("*")
      .single();

    if (error || !member) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await logWorkspaceActivity(
      supabase,
      workspaceId,
      user.id,
      "member.role_updated",
      "member",
      memberId,
      { role },
    );

    return NextResponse.json(member);
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/members/[memberId]/route.ts" },
      "Error updating member",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; memberId: string } },
) {
  const supabase = await createRoute();
  const { id: workspaceId, memberId } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const callerRole = await getWorkspaceMemberRole(
      supabase,
      workspaceId,
      user.id,
    );

    const { data: target } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("id", memberId)
      .eq("workspace_id", workspaceId)
      .single();

    if (!target) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const isSelf = target.user_id === user.id;
    if (callerRole !== "admin" && !isSelf) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId)
      .eq("workspace_id", workspaceId);

    if (error) throw error;

    await logWorkspaceActivity(
      supabase,
      workspaceId,
      user.id,
      isSelf ? "member.left" : "member.removed",
      "member",
      memberId,
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/members/[memberId]/route.ts" },
      "Error removing member",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
