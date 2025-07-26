import { User } from '@supabase/supabase-js';

export type TemplateType = 'document' | 'email' | 'presentation' | 'spreadsheet' | 'form' | 'other';

export interface Template {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content: Record<string, unknown>;
  type: TemplateType;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateShare {
  id: string;
  template_id: string;
  user_id: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  name?: string;
  avatar_url?: string;
}

export interface TemplateWithShares extends Template {
  shares: Array<{
    id: string;
    email: string;
    can_edit: boolean;
  }>;
}

// Component Props
export interface TemplatePreviewProps {
  template: Template;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onTogglePublic?: (isPublic: boolean) => void;
  className?: string;
  isOwner?: boolean;
}

export interface TemplateGalleryProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
  onEditTemplate: (template: Template) => void;
  loading?: boolean;
  error?: Error | null;
}

export interface TemplateSharingSettingsProps {
  template: TemplateWithShares;
  onUpdate: (updates: Partial<TemplateWithShares>) => void;
  className?: string;
}
