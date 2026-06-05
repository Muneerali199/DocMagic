"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workspaceApi } from "@/lib/workspace-api";
import type { WorkspaceActivity } from "@/types/workspace";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function describeActivity(item: WorkspaceActivity): string {
  const meta = item.metadata as Record<string, string>;
  switch (item.action) {
    case "workspace.created":
      return "created this workspace";
    case "workspace.updated":
      return "updated workspace settings";
    case "member.invited":
      return `invited ${meta.email ?? "a member"} as ${meta.role ?? "member"}`;
    case "member.role_updated":
      return `changed a member role to ${meta.role}`;
    case "member.removed":
      return "removed a member";
    case "member.left":
      return "left the workspace";
    case "template.added":
      return `added template "${meta.title ?? "Untitled"}" to the library`;
    case "template.removed":
      return "removed a template from the library";
    default:
      return item.action.replace(/\./g, " ");
  }
}

interface WorkspaceActivityFeedProps {
  workspaceId: string;
}

export function WorkspaceActivityFeed({
  workspaceId,
}: WorkspaceActivityFeedProps) {
  const [items, setItems] = useState<WorkspaceActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workspaceApi
      .getActivity(workspaceId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="text-sm border-b border-border/50 pb-3 last:border-0"
              >
                <span className="font-medium">
                  {(item.actor as { name?: string; email?: string })?.name ||
                    (item.actor as { email?: string })?.email ||
                    "Someone"}
                </span>{" "}
                <span className="text-muted-foreground">
                  {describeActivity(item)}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
