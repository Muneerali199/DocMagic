import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import { TemplateShare, TemplateWithShares } from '@/types/templates';

export const useTemplateSharing = (templateId?: string) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const fetchTemplateShares = async (): Promise<TemplateShare[]> => {
    if (!templateId) return [];
    
    const response = await fetch(`/api/templates/${templateId}/shares`);
    if (!response.ok) {
      throw new Error('Failed to fetch template shares');
    }
    return response.json();
  };

  const shareTemplate = async (email: string, canEdit: boolean): Promise<void> => {
    if (!templateId) throw new Error('Template ID is required');
    
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

  const updateShare = async (shareId: string, canEdit: boolean): Promise<void> => {
    if (!templateId) throw new Error('Template ID is required');
    
    const response = await fetch(`/api/templates/${templateId}/shares/${shareId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ can_edit: canEdit }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update share');
    }
  };

  const removeShare = async (shareId: string): Promise<void> => {
    if (!templateId) throw new Error('Template ID is required');
    
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
    data: shares = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['templateShares', templateId],
    queryFn: fetchTemplateShares,
    enabled: !!templateId && !!userId,
  });

  // Mutations
  const shareMutation = useMutation({
    mutationFn: ({ email, canEdit }: { email: string; canEdit: boolean }) =>
      shareTemplate(email, canEdit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templateShares', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  const updateShareMutation = useMutation({
    mutationFn: ({ shareId, canEdit }: { shareId: string; canEdit: boolean }) =>
      updateShare(shareId, canEdit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templateShares', templateId] });
    },
  });

  const removeShareMutation = useMutation({
    mutationFn: (shareId: string) => removeShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templateShares', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates', userId] });
    },
  });

  // Check if a user has a specific permission on the template
  const hasPermission = (template: TemplateWithShares, permission: 'view' | 'edit'): boolean => {
    if (!userId) return false;
    
    // Owner has all permissions
    if (template.user_id === userId) return true;
    
    // Check shared permissions
    const share = template.shares?.find(s => s.user_id === userId);
    if (!share) return false;
    
    return permission === 'view' || (permission === 'edit' && share.can_edit);
  };

  return {
    shares,
    isLoading,
    error,
    refetch,
    shareTemplate: shareMutation.mutateAsync,
    updateShare: updateShareMutation.mutateAsync,
    removeShare: removeShareMutation.mutateAsync,
    isSharing: shareMutation.isPending,
    isUpdating: updateShareMutation.isPending,
    isRemoving: removeShareMutation.isPending,
    hasPermission,
  };
};
