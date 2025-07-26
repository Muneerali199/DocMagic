import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { Database } from "@/types/supabase";

type Template = Database['public']['Tables']['templates']['Row'];
type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

export const useTemplates = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const fetchTemplates = async (): Promise<Template[]> => {
    if (!userId) return [];
    
    const response = await fetch('/api/templates');
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  };

  const createTemplate = async (template: Omit<TemplateInsert, 'user_id'>): Promise<Template> => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create template');
    }
    
    return response.json();
  };

  const updateTemplate = async (id: string, updates: Partial<TemplateUpdate>): Promise<Template> => {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update template');
    }
    
    return response.json();
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete template');
    }
  };

  const shareTemplate = async (templateId: string, email: string, canEdit: boolean): Promise<void> => {
    const response = await fetch(`/api/templates/${templateId}/shares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, can_edit: canEdit }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to share template');
    }
  };

  const removeShare = async (templateId: string, shareId: string): Promise<void> => {
    const response = await fetch(`/api/templates/${templateId}/shares/${shareId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove share');
    }
  };

  // Queries
  const {
    data: templates = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['templates', userId],
    queryFn: fetchTemplates,
    enabled: !!userId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TemplateUpdate> }) => 
      updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: ({ templateId, email, canEdit }: { templateId: string; email: string; canEdit: boolean }) => 
      shareTemplate(templateId, email, canEdit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const removeShareMutation = useMutation({
    mutationFn: ({ templateId, shareId }: { templateId: string; shareId: string }) => 
      removeShare(templateId, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  return {
    templates,
    isLoading,
    error,
    refetch,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    shareTemplate: shareMutation.mutateAsync,
    removeShare: removeShareMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSharing: shareMutation.isPending,
  };
};
