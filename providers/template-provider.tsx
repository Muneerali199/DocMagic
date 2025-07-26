'use client';

import { ReactNode } from 'react';
import { TemplateEditorProvider } from '@/context/template-editor-context';

export function TemplateProvider({ children }: { children: ReactNode }) {
  return (
    <TemplateEditorProvider>
      {children}
    </TemplateEditorProvider>
  );
}
