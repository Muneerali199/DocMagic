"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workspaceApi } from "@/lib/workspace-api";
import type { WorkspaceWithRole } from "@/types/workspace";
import { ROLE_LABELS } from "@/types/workspace";
import { Users, ChevronRight } from "lucide-react";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    workspaceApi
      .list()
      .then(setWorkspaces)
      .catch(() => setWorkspaces([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CreateDocumentGuard>
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl py-10 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8" />
                Team workspaces
              </h1>
              <p className="text-muted-foreground mt-1">
                Collaborate with shared templates, role-based access, and
                activity feeds.
              </p>
            </div>
            <CreateWorkspaceDialog onCreated={load} />
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading workspaces...</p>
          ) : workspaces.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No workspaces yet</CardTitle>
                <CardDescription>
                  Create a workspace to invite teammates and share template
                  libraries.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <ul className="space-y-3">
              {workspaces.map((ws) => (
                <li key={ws.id}>
                  <Link href={`/workspaces/${ws.id}`}>
                    <Card className="hover:border-primary/50 transition-colors">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold">{ws.name}</p>
                          {ws.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {ws.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {ROLE_LABELS[ws.role]}
                          </Badge>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </CreateDocumentGuard>
  );
}
