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
  content?: Record<string, any>;
  isPublic: boolean;
  useAI?: boolean;
  aiPrompt?: string;
}
export interface TemplateCapabilities {
  supportsPhoto: boolean;
  multiColumn: boolean;
  atsMode: boolean;
  exportStable: boolean;
}

export interface TemplateCompatibilityResult {
  warnings: string[];
  suggestions: string[];
}