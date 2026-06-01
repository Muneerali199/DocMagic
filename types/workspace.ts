export type WorkspaceRole = "admin" | "editor" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  invited_by: string | null;
  joined_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
  member_count?: number;
}

export interface WorkspaceTemplate {
  id: string;
  workspace_id: string;
  template_id: string;
  added_by: string | null;
  created_at: string;
  template?: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    is_public: boolean;
    created_at: string;
  };
}

export interface WorkspaceActivity {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  action: string;
  resource_type: "workspace" | "member" | "template" | "document" | "session";
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: {
    id: string;
    email: string;
    name?: string;
  };
}

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_PERMISSIONS: Record<WorkspaceRole, string[]> = {
  admin: [
    "manage_members",
    "manage_workspace",
    "edit_templates",
    "edit_documents",
    "view",
  ],
  editor: ["edit_templates", "edit_documents", "view"],
  viewer: ["view"],
};
