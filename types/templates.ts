import { Database } from '@/types/supabase';

export type Template = Database['public']['Tables']['templates']['Row'];
export type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
export type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

export interface TemplateShare {
  id: string;
  template_id: string;
  user_id: string;
  shared_by: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface TemplateWithShares extends Template {
  shares?: TemplateShare[];
  user?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface TemplateContent {
  sections?: TemplateSection[];
  metadata?: {
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface TemplateSection {
  id: string;
  title: string;
  items?: TemplateItem[];
  [key: string]: any;
}

export interface TemplateItem {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export type TemplateType = 'resume' | 'presentation' | 'letter' | 'cv';

export interface TemplateFormValues {
  title: string;
  description?: string;
  type: TemplateType;
  isPublic: boolean;
  content: TemplateContent;
}
