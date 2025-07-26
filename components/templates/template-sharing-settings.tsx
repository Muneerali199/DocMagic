'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, X, Mail, Edit, Trash2, Check, X as XIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTemplateSharing } from '@/hooks/use-template-sharing';
import { useUser } from '@/hooks/use-user';
import { TemplateWithShares } from '@/types/templates';

const shareFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  canEdit: z.boolean().default(false),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

interface TemplateSharingSettingsProps {
  template: TemplateWithShares;
  onClose?: () => void;
}

export function TemplateSharingSettings({ template, onClose }: TemplateSharingSettingsProps) {
  const router = useRouter();
  const { user } = useUser();
  const { id: templateId } = useParams<{ id: string }>();
  
  const {
    shares,
    isLoading,
    shareTemplate,
    updateShare,
    removeShare,
    isSharing,
    isUpdating,
    isRemoving,
  } = useTemplateSharing(templateId);
  
  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      email: '',
      canEdit: false,
    },
  });
  
  const onSubmit = async (data: ShareFormValues) => {
    try {
      await shareTemplate(data.email, data.canEdit);
      toast.success('Template shared successfully');
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to share template');
    }
  };
  
  const handleUpdateShare = async (shareId: string, canEdit: boolean) => {
    try {
      await updateShare({ shareId, canEdit });
      toast.success('Share permissions updated');
    } catch (error) {
      toast.error('Failed to update share permissions');
    }
  };
  
  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeShare(shareId);
      toast.success('Share removed');
    } catch (error) {
      toast.error('Failed to remove share');
    }
  };
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/templates/${templateId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };
  
  const isOwner = user?.id === template.user_id;
  const canEdit = isOwner || shares.some(s => s.user_id === user?.id && s.can_edit);
  
  if (!isOwner && !canEdit) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        You don't have permission to manage sharing for this template.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Share with others</h3>
        <p className="text-sm text-muted-foreground">
          Invite others to view or edit this template by email
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              disabled={isSharing}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="canEdit" className="text-sm font-medium">
              Can edit
            </Label>
            <Switch
              id="canEdit"
              checked={form.watch('canEdit')}
              onCheckedChange={(checked) => form.setValue('canEdit', checked)}
              disabled={isSharing}
            />
          </div>
          <Button type="submit" disabled={isSharing}>
            Share
          </Button>
        </div>
      </form>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">People with access</h4>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleCopyLink}
          >
            <Mail className="h-4 w-4 mr-2" />
            Copy sharing link
          </Button>
        </div>
        
        <div className="border rounded-md divide-y">
          {/* Template owner */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={template.user?.avatar_url} alt={template.user?.full_name} />
                <AvatarFallback>
                  {template.user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {template.user?.full_name || 'You'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {template.user?.email || 'Owner'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-muted px-2 py-1 rounded-full">
                Owner
              </span>
            </div>
          </div>
          
          {/* Shared users */}
          {shares.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No one else has access to this template
            </div>
          ) : (
            shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={share.user?.avatar_url} alt={share.user?.full_name} />
                    <AvatarFallback>
                      {share.user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {share.user?.full_name || share.user?.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {share.user?.email || 'Shared user'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateShare(share.id, !share.can_edit)}
                          disabled={isUpdating}
                        >
                          {share.can_edit ? (
                            <Edit className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {share.can_edit ? 'Can edit' : 'Can view'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveShare(share.id)}
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Remove access</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="border rounded-md p-4 space-y-2">
        <h4 className="text-sm font-medium">Public access</h4>
        <p className="text-sm text-muted-foreground">
          {template.is_public
            ? 'Anyone with the link can view this template.'
            : 'This template is private. Only you and people you invite can access it.'}
        </p>
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="public-access" className="text-sm">
              Make this template public
            </Label>
            <p className="text-xs text-muted-foreground">
              Anyone with the link can view this template
            </p>
          </div>
          <Switch
            id="public-access"
            checked={template.is_public}
            onCheckedChange={async (checked) => {
              try {
                const response = await fetch(`/api/templates/${templateId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ is_public: checked }),
                });
                
                if (!response.ok) throw new Error('Failed to update template');
                
                toast.success(
                  checked
                    ? 'Template is now public'
                    : 'Template is now private'
                );
                router.refresh();
              } catch (error) {
                toast.error('Failed to update template');
              }
            }}
            disabled={!isOwner}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}
