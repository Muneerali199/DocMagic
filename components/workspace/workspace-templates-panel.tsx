"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { workspaceApi } from "@/lib/workspace-api";
import type { WorkspaceRole, WorkspaceTemplate } from "@/types/workspace";
import { canEditContent } from "@/lib/workspace-permissions";
import { BookOpen, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface WorkspaceTemplatesPanelProps {
  workspaceId: string;
  currentUserRole: WorkspaceRole;
}

export function WorkspaceTemplatesPanel({
  workspaceId,
  currentUserRole,
}: WorkspaceTemplatesPanelProps) {
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [loading, setLoading] = useState(false);

  const canEdit = canEditContent(currentUserRole);

  const loadTemplates = useCallback(() => {
    workspaceApi
      .listTemplates(workspaceId)
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, [workspaceId]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleAdd = async () => {
    if (!templateId.trim()) return;
    setLoading(true);
    try {
      await workspaceApi.addTemplate(workspaceId, templateId.trim());
      toast.success("Template added to workspace library");
      setTemplateId("");
      loadTemplates();
    } catch {
      toast.error("Could not add template. Use a template ID you own.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    try {
      await workspaceApi.removeTemplate(workspaceId, entryId);
      loadTemplates();
      toast.success("Template removed");
    } catch {
      toast.error("Failed to remove template");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5" />
          Shared templates ({templates.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <Label>Add template by ID</Label>
            <p className="text-xs text-muted-foreground">
              Copy the template ID from your template URL or gallery.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="uuid of your template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAdd} disabled={loading}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}

        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No shared templates yet. Editors can add templates they own.
          </p>
        ) : (
          <ul className="space-y-2">
            {templates.map((entry) => {
              const t = entry.template;
              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {t?.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {t?.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {t?.id && (
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/editor/${t.type}/${t.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
