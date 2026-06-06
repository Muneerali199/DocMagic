import { logger } from "@/lib/logger";
import {
  getWorkspaceMemberRole,
  logWorkspaceActivity,
} from "@/lib/workspace-server";
import { roleMeetsMinimum } from "@/lib/workspace-permissions";
import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    const { data: entries, error } = await supabase
      .from("workspace_templates")
      .select(
        "*, template:templates(id, title, description, type, is_public, created_at, user_id)",
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(entries);
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/templates/route.ts" },
      "Error listing workspace templates",
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

    const role = await getWorkspaceMemberRole(supabase, workspaceId, user.id);
    if (!role || !roleMeetsMinimum(role, "editor")) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { templateId } = await request.json();
    if (!templateId) {
      return new NextResponse("templateId is required", { status: 400 });
    }

    const { data: template } = await supabase
      .from("templates")
      .select("id, user_id, title")
      .eq("id", templateId)
      .single();

    if (!template) {
      return new NextResponse("Template not found", { status: 404 });
    }

    if (template.user_id !== user.id) {
      return new NextResponse("You can only share templates you own", {
        status: 403,
      });
    }

    const { data: existing } = await supabase
      .from("workspace_templates")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("template_id", templateId)
      .maybeSingle();

    if (existing) {
      return new NextResponse("Template already in workspace library", {
        status: 400,
      });
    }

    const { data: entry, error } = await supabase
      .from("workspace_templates")
      .insert({
        workspace_id: workspaceId,
        template_id: templateId,
        added_by: user.id,
      })
      .select(
        "*, template:templates(id, title, description, type, is_public, created_at)",
      )
      .single();

    if (error) throw error;

    await supabase
      .from("templates")
      .update({ workspace_id: workspaceId })
      .eq("id", templateId);

    await logWorkspaceActivity(
      supabase,
      workspaceId,
      user.id,
      "template.added",
      "template",
      templateId,
      { title: template.title },
    );

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/[id]/templates/route.ts" },
      "Error adding workspace template",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
