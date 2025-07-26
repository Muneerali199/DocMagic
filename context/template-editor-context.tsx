'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Template } from '@/types';

type TemplateEditorContextType = {
  currentTemplate: Template | null;
  isEditorOpen: boolean;
  openEditor: (template: Template) => void;
  closeEditor: () => void;
  updateTemplateContent: (updates: Partial<Template['content']>) => void;
};

const TemplateEditorContext = createContext<TemplateEditorContextType | undefined>(undefined);

export const useTemplateEditor = () => {
  const context = useContext(TemplateEditorContext);
  if (!context) {
    throw new Error('useTemplateEditor must be used within a TemplateEditorProvider');
  }
  return context;
};

type TemplateEditorProviderProps = {
  children: ReactNode;
};

export const TemplateEditorProvider = ({ children }: TemplateEditorProviderProps) => {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const openEditor = useCallback((template: Template) => {
    setCurrentTemplate(template);
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    // Don't clear currentTemplate immediately to allow for smooth transitions
    setTimeout(() => setCurrentTemplate(null), 300);
  }, []);

  const updateTemplateContent = useCallback((updates: Partial<Template['content']>) => {
    setCurrentTemplate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        content: {
          ...prev.content,
          ...updates,
          metadata: {
            ...(prev.content?.metadata || {}),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  const value = {
    currentTemplate,
    isEditorOpen,
    openEditor,
    closeEditor,
    updateTemplateContent,
  };

  return (
    <TemplateEditorContext.Provider value={value}>
      {children}
    </TemplateEditorContext.Provider>
  );
};
