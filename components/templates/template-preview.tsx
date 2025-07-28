'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Template } from "@/types/templates";
import { getTemplateTypeIcon, getTemplatePreview } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useUser } from "@/hooks/use-user";
import { Eye } from "lucide-react";
import { TemplatePreviewModal } from "./template-preview-modal";

export interface TemplatePreviewProps {
  template: Template;
  onEdit?: (template: Template) => void;
  onDelete?: (id: string) => void;
  onShare?: (template: Template) => void;
  onTogglePublic?: (template: Template) => void;
  onUseTemplate?: (template: Template) => void;
  className?: string;
  isOwner?: boolean;
}

export function TemplatePreview({
  template,
  onEdit,
  onDelete,
  onShare,
  onTogglePublic,
  onUseTemplate,
  className = "",
  isOwner = false,
}: TemplatePreviewProps) {
  const router = useRouter();
  const { user } = useUser();
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template);
    } else {
      router.push(`/templates/${template.id}/use`);
    }
  };

  return (
    <Card className={`flex flex-col h-full overflow-hidden ${className}`}>
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {getTemplateTypeIcon(template.type)}
            </span>
            <CardTitle className="text-lg font-medium line-clamp-1">
              {template.title}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {template.is_public && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
            {template.is_default && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
          </div>
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span>{user?.name || 'You'}</span>
          </div>
          <span>
            {format(new Date(template.updated_at), 'MMM d, yyyy')}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-hidden">
        <div className="h-32 p-3 bg-muted/20 rounded-md overflow-hidden text-sm text-muted-foreground">
          <p className="line-clamp-5">
            {getTemplatePreview(template)}
          </p>
        </div>
      </CardContent>
      <div className="p-4 border-t flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreviewModal(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleUseTemplate}
          >
            Use Template
          </Button>
          {isOwner && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(template)}
            >
              Edit
            </Button>
          )}
        </div>
        <div className="space-x-2">
          {isOwner && onTogglePublic && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onTogglePublic(template)}
            >
              {template.is_public ? 'Make Private' : 'Make Public'}
            </Button>
          )}
          {isOwner && onShare && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShare(template)}
            >
              Share
            </Button>
          )}
          {isOwner && onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(template.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      <TemplatePreviewModal
        template={template}
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        onUseTemplate={onUseTemplate}
      />
    </Card>
  );
}
