"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { workspaceApi } from "@/lib/workspace-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateWorkspaceDialogProps {
  onCreated?: () => void;
}

export function CreateWorkspaceDialog({
  onCreated,
}: CreateWorkspaceDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    setLoading(true);
    try {
      const workspace = await workspaceApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Workspace created");
      setOpen(false);
      setName("");
      setDescription("");
      onCreated?.();
      router.push(`/workspaces/${workspace.id}`);
    } catch {
      toast.error("Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team workspace</DialogTitle>
          <DialogDescription>
            Collaborate with your team using shared templates and real-time
            editing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ws-name">Name</Label>
            <Input
              id="ws-name"
              placeholder="Marketing team"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ws-desc">Description (optional)</Label>
            <Textarea
              id="ws-desc"
              placeholder="Shared resumes and presentations for the team"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create workspace"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
