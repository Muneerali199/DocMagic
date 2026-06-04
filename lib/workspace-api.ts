import type {
  Workspace,
  WorkspaceActivity,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceTemplate,
  WorkspaceWithRole,
} from "@/types/workspace";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const workspaceApi = {
  list(): Promise<WorkspaceWithRole[]> {
    return fetch("/api/workspaces").then((r) => parseJson(r));
  },

  create(payload: { name: string; description?: string }): Promise<Workspace> {
    return fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJson(r));
  },

  get(id: string): Promise<WorkspaceWithRole> {
    return fetch(`/api/workspaces/${id}`).then((r) => parseJson(r));
  },

  update(
    id: string,
    payload: Partial<{ name: string; description: string }>,
  ): Promise<Workspace> {
    return fetch(`/api/workspaces/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => parseJson(r));
  },

  remove(id: string): Promise<void> {
    return fetch(`/api/workspaces/${id}`, { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error("Failed to delete workspace");
    });
  },

  listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return fetch(`/api/workspaces/${workspaceId}/members`).then((r) =>
      parseJson(r),
    );
  },

  inviteMember(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    return fetch(`/api/workspaces/${workspaceId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    }).then((r) => parseJson(r));
  },

  updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    return fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }).then((r) => parseJson(r));
  },

  removeMember(workspaceId: string, memberId: string): Promise<void> {
    return fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) throw new Error("Failed to remove member");
    });
  },

  listTemplates(workspaceId: string): Promise<WorkspaceTemplate[]> {
    return fetch(`/api/workspaces/${workspaceId}/templates`).then((r) =>
      parseJson(r),
    );
  },

  addTemplate(
    workspaceId: string,
    templateId: string,
  ): Promise<WorkspaceTemplate> {
    return fetch(`/api/workspaces/${workspaceId}/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    }).then((r) => parseJson(r));
  },

  removeTemplate(workspaceId: string, entryId: string): Promise<void> {
    return fetch(`/api/workspaces/${workspaceId}/templates/${entryId}`, {
      method: "DELETE",
    }).then((r) => {
      if (!r.ok) throw new Error("Failed to remove template");
    });
  },

  getActivity(workspaceId: string, limit = 50): Promise<WorkspaceActivity[]> {
    return fetch(`/api/workspaces/${workspaceId}/activity?limit=${limit}`).then(
      (r) => parseJson(r),
    );
  },
};
