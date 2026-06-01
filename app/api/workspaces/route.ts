import { logger } from "@/lib/logger";
import { slugifyWorkspaceName } from "@/lib/workspace-permissions";
import { createRoute } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createRoute();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: memberships, error } = await supabase
      .from("workspace_members")
      .select("role, workspace_id")
      .eq("user_id", user.id);

    if (error) throw error;

    const workspaceIds = (memberships ?? []).map((m) => m.workspace_id);
    if (workspaceIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: workspaceRows, error: workspacesError } = await supabase
      .from("workspaces")
      .select("*")
      .in("id", workspaceIds);

    if (workspacesError) throw workspacesError;

    const roleByWorkspace = new Map(
      (memberships ?? []).map((m) => [m.workspace_id, m.role]),
    );

    const workspaces = (workspaceRows ?? []).map((ws) => ({
      ...ws,
      role: roleByWorkspace.get(ws.id),
    }));

    return NextResponse.json(workspaces);
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/route.ts" },
      "Error listing workspaces",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createRoute();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description } = await request.json();
    if (!name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const slug = slugifyWorkspaceName(name);

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .insert({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        owner_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    logger.error(
      { route: "app/api/workspaces/route.ts" },
      "Error creating workspace",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
