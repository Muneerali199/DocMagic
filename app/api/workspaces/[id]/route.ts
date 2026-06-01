import { logger } from "@/lib/logger";
import {
  getWorkspaceMemberRole,
  logWorkspaceActivity,
} from "@/lib/workspace-server";
import { createRoute } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { NextResponse } from "next/server";

type WorkspaceUpdate = Database["public"]["Tables"]["workspaces"]["Update"];

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createRoute();
  const { id } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getWorkspaceMemberRole(supabase, id, user.id);
    if (!role) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !workspace) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { count } = await supabase
      .from("workspace_members")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", id);

    return NextResponse.json({ ...workspace, role, member_count: count ?? 0 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/route.ts" },
      "Error fetching workspace",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createRoute();
  const { id } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getWorkspaceMemberRole(supabase, id, user.id);
    if (role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const updates: WorkspaceUpdate = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined) {
      updates.description = body.description
        ? String(body.description).trim()
        : null;
    }

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logWorkspaceActivity(
      supabase,
      id,
      user.id,
      "workspace.updated",
      "workspace",
      id,
      updates,
    );

    return NextResponse.json(workspace);
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/route.ts" },
      "Error updating workspace",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createRoute();
  const { id } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: workspace } = await supabase
      .from("workspaces")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (!workspace || workspace.owner_id !== user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/route.ts" },
      "Error deleting workspace",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
