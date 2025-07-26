import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Share2, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShareTemplateDialog } from "./share-template-dialog";
import { DeleteDialog } from "@/components/delete-dialog";

type TemplateCardProps = {
  id: string;
  title: string;
  description?: string;
  type: 'resume' | 'presentation' | 'letter' | 'cv';
  isPublic: boolean;
  isOwner: boolean;
  onDelete: (id: string) => Promise<void>;
  onTogglePublic?: (id: string, isPublic: boolean) => Promise<void>;
};

export function TemplateCard({
  id,
  title,
  description,
  type,
  isPublic,
  isOwner,
  onDelete,
  onTogglePublic,
}: TemplateCardProps) {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const typeLabels = {
    resume: 'Resume',
    presentation: 'Presentation',
    letter: 'Letter',
    cv: 'CV',
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!onTogglePublic) return;
    
    try {
      setIsToggling(true);
      await onTogglePublic(id, !isPublic);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/templates/${id}/edit`)}
                  className="cursor-pointer"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem
                    onClick={() => setIsShareOpen(true)}
                    className="cursor-pointer"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-destructive cursor-pointer focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{typeLabels[type]}</Badge>
            {isPublic && <Badge variant="secondary">Public</Badge>}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {description}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/templates/${id}/use`)}
          >
            Use Template
          </Button>
          {isOwner && onTogglePublic && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePublic}
              disabled={isToggling}
            >
              {isPublic ? 'Make Private' : 'Make Public'}
            </Button>
          )}
        </CardFooter>
      </Card>

      <ShareTemplateDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        templateId={id}
        templateTitle={title}
      />

      <DeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete Template"
        description={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
      />
    </>
  );
}
