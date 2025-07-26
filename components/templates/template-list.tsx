'use client';

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "./template-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { TEMPLATE_TYPES } from "@/lib/templates";
import { Template } from "@/types";

interface TemplateListProps {
  type?: Template['type'];
  title?: string;
  showCreateButton?: boolean;
  limit?: number;
  initialTemplates?: Template[];
}

export function TemplateList({ 
  type, 
  title = "Templates",
  showCreateButton = true,
  limit,
  initialTemplates = []
}: TemplateListProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: templates = initialTemplates, isLoading, error, refetch } = useQuery<Template[]>({
    queryKey: ["templates", type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`/api/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    initialData: initialTemplates,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      
      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted.",
      });
      
      await refetch();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublic = async (id: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !isPublic,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      
      toast({
        title: isPublic ? "Template made private" : "Template made public",
        description: isPublic 
          ? "This template is now private and only you can see it." 
          : "This template is now public and can be viewed by anyone with the link.",
      });
      
      await refetch();
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load templates. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {showCreateButton && (
          <Button onClick={() => router.push('/templates/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((template) => {
            // Ensure type is one of the allowed values, default to 'document' if not valid
            const validTypes = ['resume', 'presentation', 'letter', 'cv'] as const;
            type ValidTemplateType = typeof validTypes[number];
            const templateType = validTypes.includes(template.type as ValidTemplateType)
              ? template.type as ValidTemplateType
              : 'resume'; // Default to 'resume' if type is not valid
              
            return (
              <TemplateCard
                key={template.id}
                id={template.id}
                title={template.title}
                description={template.description || ''}
                type={templateType}
                isPublic={template.is_public}
                isOwner={true} // This should be determined by the current user
                onDelete={handleDelete}
                onTogglePublic={handleTogglePublic}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You don't have any templates yet. Start by creating a new one.
            </p>
            <Button onClick={() => router.push('/templates/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
