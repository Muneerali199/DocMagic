export interface Template {
  id: string;
  title: string;
  description?: string;
  type: 'resume' | 'presentation' | 'letter' | 'cv';
  content: Record<string, any>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TemplateFormValues {
  title: string;
  description?: string;
  type: 'resume' | 'presentation' | 'letter' | 'cv';
  content: Record<string, any>;
  isPublic: boolean;
}
