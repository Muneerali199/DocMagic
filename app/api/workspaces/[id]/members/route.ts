import { logger } from "@/lib/logger";
import {
  getWorkspaceMemberRole,
  logWorkspaceActivity,
} from "@/lib/workspace-server";
import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { WorkspaceRole } from "@/types/workspace";

export async function GET(
  _request: Request,
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

    const { data: members, error } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });

    if (error) throw error;

    const userIds = [...new Set((members ?? []).map((m) => m.user_id))];
    const { data: users } = userIds.length
      ? await supabase.from("users").select("id, email, name").in("id", userIds)
      : { data: [] };

    const userMap = new Map((users ?? []).map((u) => [u.id, u]));
    const enriched = (members ?? []).map((m) => ({
      ...m,
      user: userMap.get(m.user_id) ?? null,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/members/route.ts" },
      "Error listing members",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
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

    const callerRole = await getWorkspaceMemberRole(
      supabase,
      workspaceId,
      user.id,
    );
    if (callerRole !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { email, role } = (await request.json()) as {
      email: string;
      role?: WorkspaceRole;
    };

    if (!email?.trim()) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const memberRole: WorkspaceRole = role ?? "viewer";
    if (!["admin", "editor", "viewer"].includes(memberRole)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    const { data: targetUser, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (userError || !targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (targetUser.id === user.id) {
      return new NextResponse("Cannot invite yourself", { status: 400 });
    }

    const { data: existing } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", targetUser.id)
      .maybeSingle();

    if (existing) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    const { data: member, error } = await supabase
      .from("workspace_members")
      .insert({
        workspace_id: workspaceId,
        user_id: targetUser.id,
        role: memberRole,
        invited_by: user.id,
      })
      .select("*")
      .single();

    if (error) throw error;

    const enriched = { ...member, user: targetUser };

    await logWorkspaceActivity(
      supabase,
      workspaceId,
      user.id,
      "member.invited",
      "member",
      member.id,
      { email: targetUser.email, role: memberRole },
    );

    return NextResponse.json(enriched, { status: 201 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/members/route.ts" },
      "Error inviting member",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
