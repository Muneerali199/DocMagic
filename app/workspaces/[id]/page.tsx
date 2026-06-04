"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { WorkspaceMembersPanel } from "@/components/workspace/workspace-members-panel";
import { WorkspaceTemplatesPanel } from "@/components/workspace/workspace-templates-panel";
import { WorkspaceActivityFeed } from "@/components/workspace/workspace-activity-feed";
import { workspaceApi } from "@/lib/workspace-api";
import type { WorkspaceWithRole } from "@/types/workspace";
import { ROLE_LABELS } from "@/types/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [workspace, setWorkspace] = useState<WorkspaceWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    workspaceApi
      .get(id)
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <CreateDocumentGuard>
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl py-10 px-4">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/workspaces">
              <ArrowLeft className="h-4 w-4 mr-1" />
              All workspaces
            </Link>
          </Button>

          {loading ? (
            <p className="text-muted-foreground">Loading workspace...</p>
          ) : !workspace ? (
            <p className="text-muted-foreground">
              Workspace not found or access denied.
            </p>
          ) : (
            <>
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Users className="h-8 w-8" />
                    {workspace.name}
                  </h1>
                  <Badge>{ROLE_LABELS[workspace.role]}</Badge>
                  {workspace.member_count != null && (
                    <span className="text-sm text-muted-foreground">
                      {workspace.member_count} member
                      {workspace.member_count === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                {workspace.description && (
                  <p className="text-muted-foreground mt-2">
                    {workspace.description}
                  </p>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <WorkspaceMembersPanel
                  workspaceId={workspace.id}
                  currentUserRole={workspace.role}
                />
                <WorkspaceTemplatesPanel
                  workspaceId={workspace.id}
                  currentUserRole={workspace.role}
                />
                <div className="lg:col-span-2">
                  <WorkspaceActivityFeed workspaceId={workspace.id} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </CreateDocumentGuard>
  );
}
