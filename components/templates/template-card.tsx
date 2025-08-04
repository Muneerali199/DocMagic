import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Share2, Trash2, Edit2, Star, Users, Eye, Lock } from "lucide-react";
import Image from "next/image";
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
import { TemplatePreviewModal } from "./template-preview-modal";
import { Template } from "@/types/templates";
import { AuthButton, EditTemplateButton } from "@/components/ui/auth-button";

type TemplateCardProps = {
  id: string;
  title: string;
  description?: string;
  type: 'resume' | 'presentation' | 'letter' | 'cv';
  content?: any;
  isPublic: boolean;
  isOwner: boolean;
  onDelete: (id: string) => Promise<void>;
  onTogglePublic?: (id: string, isPublic: boolean) => Promise<void>;
  viewMode?: 'grid' | 'list';
  // Enhanced metadata
  tags?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  usage_count?: number;
  rating?: number;
  preview_image?: string;
  color_scheme?: string;
  industry?: string;
};

export function TemplateCard({
  id,
  title,
  description,
  type,
  content,
  isPublic,
  isOwner,
  onDelete,
  onTogglePublic,
  viewMode = 'grid',
  tags = [],
  difficulty_level,
  usage_count,
  rating,
  preview_image,
  color_scheme,
  industry,
}: TemplateCardProps) {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const typeLabels = {
    resume: 'Resume',
    presentation: 'Presentation',
    letter: 'Letter',
    cv: 'CV',
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const formatUsageCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
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

  // Create a template object for the preview modal
  // If we have actual content, use it; otherwise create sample content
  const templateForPreview: Template = {
    id,
    title,
    description: description || '',
    type,
    content: content || {
      // Add some sample content based on type if no content exists
      ...(type === 'resume' && {
        personalInfo: {
          name: '[Your Name]',
          email: '[your.email@example.com]',
          phone: '[Your Phone]',
          location: '[Your Location]',
          summary: 'Professional summary showcasing your experience and skills...'
        },
        sections: [
          { id: 'experience', title: 'Professional Experience', items: [] },
          { id: 'education', title: 'Education', items: [] },
          { id: 'skills', title: 'Skills', items: [] }
        ]
      }),
      ...(type === 'presentation' && {
        title: title,
        slides: [
          { id: '1', type: 'title', content: { title: title, subtitle: 'Professional Presentation' } },
          { id: '2', type: 'content', content: { title: 'Overview', bullets: ['Key point 1', 'Key point 2', 'Key point 3'] } }
        ]
      }),
      ...(type === 'letter' && {
        recipient: { name: '[Recipient Name]', company: '[Company Name]' },
        content: {
          greeting: 'Dear [Name],',
          body: 'Professional letter content...',
          closing: 'Sincerely,',
          signature: '[Your Name]'
        }
      }),
      ...(type === 'cv' && {
        personalInfo: {
          name: '[Your Name]',
          email: '[your.email@example.com]',
          phone: '[Your Phone]',
          summary: 'Academic and professional summary...'
        },
        sections: [
          { id: 'education', title: 'Education', items: [] },
          { id: 'experience', title: 'Professional Experience', items: [] },
          { id: 'publications', title: 'Publications', items: [] }
        ]
      })
    },
    is_public: isPublic,
    is_default: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'current-user'
  };

  if (viewMode === 'list') {
    return (
      <>
        <Card className="w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-base sm:text-lg font-semibold truncate">{title}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">{typeLabels[type]}</Badge>
                    {isPublic && <Badge variant="secondary" className="text-xs">Public</Badge>}
                    {difficulty_level && (
                      <Badge className={`text-xs ${difficultyColors[difficulty_level]}`}>
                        {difficulty_level}
                      </Badge>
                    )}
                  </div>
                </div>
                {description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {description}
                  </p>
                )}
                {/* Stats for mobile */}
                {(rating || usage_count) && (
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground sm:hidden">
                    {rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )}
                    {usage_count && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{formatUsageCount(usage_count)} uses</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreviewModal(true)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Preview</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                  <AuthButton
                    activity="edit_template"
                    onAuthenticatedClick={() => router.push(`/templates/${id}/use`)}
                    variant="default"
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                    authPromptTitle="Sign in to use templates"
                    authPromptDescription="Use this template to create your document."
                  >
                    <span className="hidden sm:inline">Use Template</span>
                    <span className="sm:hidden">Use</span>
                  </AuthButton>
                </div>
                <div className="flex justify-between sm:justify-end items-center">
                  {/* Stats for desktop */}
                  {(rating || usage_count) && (
                    <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground mr-2">
                      {rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{rating.toFixed(1)}</span>
                        </div>
                      )}
                      {usage_count && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{formatUsageCount(usage_count)} uses</span>
                        </div>
                      )}
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
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
                {/* Make Private/Public button for mobile */}
                {isOwner && onTogglePublic && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTogglePublic}
                    disabled={isToggling}
                    className="w-full sm:hidden text-xs"
                  >
                    {isToggling ? 'Updating...' : (isPublic ? 'Make Private' : 'Make Public')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
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

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 group">
        {/* Preview Image */}
        {preview_image && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={preview_image}
              alt={`${title} preview`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
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
            {/* Rating and Usage Stats Overlay */}
            <div className="absolute bottom-2 left-2 flex gap-2">
              {rating && (
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {rating.toFixed(1)}
                </Badge>
              )}
              {usage_count && (
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  <Users className="w-3 h-3 mr-1" />
                  {formatUsageCount(usage_count)}
                </Badge>
              )}
            </div>
          </div>
        )}

        <CardHeader className="pb-2 p-3 sm:p-6">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1 min-w-0">{title}</CardTitle>
            {!preview_image && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1 flex-shrink-0">
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
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap mt-2">
            <Badge variant="outline" className="text-xs">{typeLabels[type]}</Badge>
            {isPublic && <Badge variant="secondary" className="text-xs">Public</Badge>}
            {difficulty_level && (
              <Badge className={`text-xs ${difficultyColors[difficulty_level]}`}>
                {difficulty_level}
              </Badge>
            )}
            {industry && (
              <Badge variant="outline" className="text-xs">
                {industry}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 sm:p-6 pt-0">
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 mb-3">
              {description}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          {!preview_image && (rating || usage_count) && (
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              {rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
              {usage_count && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{formatUsageCount(usage_count)} uses</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 p-3 sm:p-6 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreviewModal(true)}
                className="flex-1 text-xs flex items-center justify-center p-1"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Preview</span>
                <span className="sm:hidden">View</span>
              </Button>
              <AuthButton
                activity="edit_template"
                onAuthenticatedClick={() => router.push(`/templates/${id}/use`)}
                variant="default"
                size="sm"
                className="flex-1 text-xs flex items-center justify-center p-1"
                authPromptTitle="Sign in to use templates"
                authPromptDescription="Use this template to create your document."
                showAuthIcon={true}
              >
                <span className="hidden sm:inline">Use Template</span>
                <span className="sm:hidden">Use</span>
              </AuthButton>
            </div>
            {isOwner && onTogglePublic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePublic}
                disabled={isToggling}
                className="w-full text-xs sm:text-sm flex items-center justify-center"
              >
                {isToggling ? 'Updating...' : (isPublic ? 'Make Private' : 'Make Public')}
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

      <TemplatePreviewModal
        template={templateForPreview}
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        onUseTemplate={() => router.push(`/templates/${id}/use`)}
      />
    </>
  );
}
