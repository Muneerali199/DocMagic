import { User } from '@supabase/supabase-js';

declare module '@/hooks/use-user' {
  export function useUser(): { user: User | null; isLoading: boolean };
}

declare module '@/hooks/use-toast' {
  type ToastVariant = 'default' | 'destructive';

  type ToastInput = {
    title: string;
    description?: React.ReactNode;
    variant?: ToastVariant;
  };

  type ToastFunction = ((toast: ToastInput) => string | number) & {
    success: (message: string, options?: Record<string, unknown>) => string | number;
    error: (message: string, options?: Record<string, unknown>) => string | number;
    loading: (message: string, options?: Record<string, unknown>) => string | number;
    dismiss: (toastId?: string | number) => void;
  };

  export function useToast(): {
    toast: ToastFunction;
    dismissToast: (id: string) => void;
  };
  
  export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element;
}

declare module '@/hooks/use-template-sharing' {
  export function useTemplateSharing(templateId: string): {
    shares: Array<{ id: string; email: string; canEdit: boolean }>;
    addShare: (email: string, canEdit: boolean) => Promise<void>;
    updateShare: (shareId: string, canEdit: boolean) => Promise<void>;
    removeShare: (shareId: string) => Promise<void>;
    loading: boolean;
    error: Error | null;
  };
}

declare module '@/hooks/use-templates' {
  import { Template } from '@/types';
  
  export function useTemplates(): {
    templates: Template[];
    loading: boolean;
    error: Error | null;
    createTemplate: (template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
  };
}
