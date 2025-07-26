import { User } from '@supabase/supabase-js';

export interface Template {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  content: any;
  type: 'resume' | 'presentation' | 'letter' | 'cv';
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface TemplateShare {
  id: string;
  template_id: string;
  shared_by: string;
  shared_with: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type TemplateType = 'resume' | 'presentation' | 'letter' | 'cv';

export interface TemplateFormValues {
  title: string;
  description: string;
  type: TemplateType;
  isPublic: boolean;
  content: any;
}
