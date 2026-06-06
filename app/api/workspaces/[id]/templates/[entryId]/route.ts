import { logger } from "@/lib/logger";
import {
  getWorkspaceMemberRole,
  logWorkspaceActivity,
} from "@/lib/workspace-server";
import { roleMeetsMinimum } from "@/lib/workspace-permissions";
import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; entryId: string } },
) {
  const supabase = await createRoute();
  const { id: workspaceId, entryId } = params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getWorkspaceMemberRole(supabase, workspaceId, user.id);
    if (!role || !roleMeetsMinimum(role, "editor")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { data: entry } = await supabase
      .from("workspace_templates")
      .select("template_id")
      .eq("id", entryId)
      .eq("workspace_id", workspaceId)
      .single();

    if (!entry) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { error } = await supabase
      .from("workspace_templates")
      .delete()
      .eq("id", entryId)
      .eq("workspace_id", workspaceId);

    if (error) throw error;

    await logWorkspaceActivity(
      supabase,
      workspaceId,
      user.id,
      "template.removed",
      "template",
      entry.template_id,
    );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/templates/[entryId]/route.ts" },
      "Error removing workspace template",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
