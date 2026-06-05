"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2, Copy, Check, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { workspaceApi } from "@/lib/workspace-api";
import { canEditContent } from "@/lib/workspace-permissions";
import type { WorkspaceWithRole } from "@/types/workspace";

type ShareTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateTitle: string;
};

export function ShareTemplateDialog({
  open,
  onOpenChange,
  templateId,
  templateTitle,
}: ShareTemplateDialogProps) {
  const [email, setEmail] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [isAddingToWorkspace, setIsAddingToWorkspace] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!open) return;
    workspaceApi
      .list()
      .then((list) =>
        setWorkspaces(list.filter((ws) => canEditContent(ws.role))),
      )
      .catch(() => setWorkspaces([]));
  }, [open]);

  const shareableLink = origin
    ? `${origin}/templates/${templateId}/shared`
    : "";

  const handleShare = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/templates/${templateId}/shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          canEdit,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to share template");
      }

      toast({
        title: "Template shared successfully",
        description: `${templateTitle} has been shared with ${email}.`,
      });
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing template:", error);
      toast({
        title: "Error sharing template",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWorkspace = async () => {
    if (!selectedWorkspaceId) return;
    setIsAddingToWorkspace(true);
    try {
      await workspaceApi.addTemplate(selectedWorkspaceId, templateId);
      toast({
        title: "Added to workspace",
        description: `${templateTitle} is now in your team template library.`,
      });
      setSelectedWorkspaceId("");
    } catch {
      toast({
        title: "Could not add to workspace",
        description: "You must be an editor or admin in the workspace.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWorkspace(false);
    }
  };

  const copyToClipboard = () => {
    if (!shareableLink) return;
    navigator.clipboard.writeText(shareableLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);

    toast({
      title: "Link copied to clipboard",
      description: "Share this link with others to give them access.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share "{templateTitle}"</DialogTitle>
          <DialogDescription>
            Share this template with others by entering their email address
            below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="person@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleShare}
                disabled={isLoading || !email}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="can-edit"
              checked={canEdit}
              onCheckedChange={(checked: boolean) => setCanEdit(checked)}
            />
            <label
              htmlFor="can-edit"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Allow editing
            </label>
          </div>

          {workspaces.length > 0 && (
            <div className="relative pt-4 border-t space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team workspace library
              </Label>
              <p className="text-xs text-muted-foreground">
                Share with your whole team via a workspace template library.
              </p>
              <div className="flex gap-2">
                <Select
                  value={selectedWorkspaceId}
                  onValueChange={setSelectedWorkspaceId}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddToWorkspace}
                  disabled={!selectedWorkspaceId || isAddingToWorkspace}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="relative mt-4 pt-4 border-t">
            <Label>Shareable link</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={shareableLink}
                readOnly
                className="flex-1 text-xs truncate"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={isCopied || !shareableLink}
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Anyone with this link can view this template.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
