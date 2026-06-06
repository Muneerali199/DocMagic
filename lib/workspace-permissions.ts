import type { WorkspaceRole } from "@/types/workspace";

const ROLE_LEVEL: Record<WorkspaceRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

export function roleMeetsMinimum(
  userRole: WorkspaceRole,
  required: WorkspaceRole,
): boolean {
  return ROLE_LEVEL[userRole] >= ROLE_LEVEL[required];
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return roleMeetsMinimum(role, "admin");
}

export function canEditContent(role: WorkspaceRole): boolean {
  return roleMeetsMinimum(role, "editor");
}

export function slugifyWorkspaceName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `workspace-${suffix}`;
}
