import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceRole } from "@/types/workspace";
import { roleMeetsMinimum } from "@/lib/workspace-permissions";

export async function getWorkspaceMemberRole(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) return null;
  if (workspace.owner_id === userId) return "admin";

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();

  return (member?.role as WorkspaceRole) ?? null;
}

export async function requireWorkspaceRole(
  supabase: SupabaseClient,
  workspaceId: string,
  userId: string,
  minimum: WorkspaceRole,
): Promise<WorkspaceRole | null> {
  const role = await getWorkspaceMemberRole(supabase, workspaceId, userId);
  if (!role || !roleMeetsMinimum(role, minimum)) return null;
  return role;
}

export async function logWorkspaceActivity(
  supabase: SupabaseClient,
  workspaceId: string,
  actorId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from("workspace_activity").insert({
    workspace_id: workspaceId,
    actor_id: actorId,
    action,
    resource_type: resourceType,
    resource_id: resourceId ?? null,
    metadata: metadata ?? {},
  });
}
