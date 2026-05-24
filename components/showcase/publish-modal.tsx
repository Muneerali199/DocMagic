'use client';

import { useEffect , useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Badge }    from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";
import { normaliseTag, MAX_TAGS_PER_POST } from "@/types/showcase";
import type {
  PostType,
  Visibility,
  ExperienceLevel,
  PublishPostResponse,
} from "@/types/showcase";

interface PublishModalProps {
  open:       boolean;
  onClose:    () => void;
  defaults?: {
    type:           PostType;
    title:          string;
    content_ref:    string;
    template_used?: string;
  };
  onSuccess?: (resp: PublishPostResponse) => void;
}

export function PublishModal({
  open,
  onClose,
  defaults,
  onSuccess,
}: PublishModalProps) {
  const [title,           setTitle]           = useState(defaults?.title ?? "");
  const [role,            setRole]            = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("mid");
  const [visibility,      setVisibility]      = useState<Visibility>("public");
  const [tagInput,        setTagInput]        = useState("");
  const [tags,            setTags]            = useState<string[]>([]);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [error,           setError]           = useState<string | null>(null);

   useEffect(() => {
     if (!open) return;
     setTitle(defaults?.title ?? "");
     setRole("");
     setExperienceLevel("mid");
     setVisibility("public");
     setTagInput("");
     setTags([]);
     setError(null);
   }, [open, defaults?.title]);

  // Tag management
  const addTag = () => {
    const tag = normaliseTag(tagInput);
    if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS_PER_POST) return;
    setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Submit
  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!role.trim()) {
      setError("Target role is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const resp = await fetch("/api/showcase/publish", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type:             defaults?.type ?? "resume",
          title:            title.trim(),
          content_ref:      defaults?.content_ref ?? "",
          visibility,
          role:             role.trim(),
          experience_level: experienceLevel,
          tags,
          template_used:    defaults?.template_used,
        }),
      });

      if (!resp.ok) {
        const json = await resp.json();
        setError(json.error ?? "Failed to publish.");
        return;
      }

      const data: PublishPostResponse = await resp.json();
      onSuccess?.(data);
      onClose();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish to Showcase</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="sc-title">Title</Label>
            <Input
              id="sc-title"
              placeholder="e.g. Senior React Engineer Resume – 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="sc-role">Target role</Label>
            <Input
              id="sc-role"
              placeholder="e.g. Frontend Engineer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              maxLength={80}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Experience level */}
            <div className="space-y-1.5">
              <Label>Experience level</Label>
              <Select
                value={experienceLevel}
                onValueChange={(v) => setExperienceLevel(v as ExperienceLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select
                value={visibility}
                onValueChange={(v) => setVisibility(v as Visibility)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="sc-tag">
              Tags ({tags.length}/{MAX_TAGS_PER_POST})
            </Label>
            <div className="flex gap-2">
              <Input
                id="sc-tag"
                placeholder="e.g. react"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                maxLength={32}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={tags.length >= MAX_TAGS_PER_POST}
              >
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}