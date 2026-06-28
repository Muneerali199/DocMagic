'use client';

import type { ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

type ToastVariant = 'default' | 'destructive';

type ToastInput = {
  title: string;
  description?: ReactNode;
  variant?: ToastVariant;
};

type ToastHandle = ((toast: ToastInput) => string | number) & {
  success: typeof sonnerToast.success;
  error: typeof sonnerToast.error;
  loading: typeof sonnerToast.loading;
  dismiss: typeof sonnerToast.dismiss;
};

const toast = Object.assign(
  (({ title, description, variant = 'default' }: ToastInput) => {
    if (variant === 'destructive') {
      return sonnerToast.error(title, { description });
    }

    return sonnerToast(title, { description });
  }) as ToastHandle,
  {
    success: sonnerToast.success,
    error: sonnerToast.error,
    loading: sonnerToast.loading,
    dismiss: sonnerToast.dismiss,
  }
);

export function useToast() {
  return {
    toast,
    dismissToast: sonnerToast.dismiss,
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return children;
}

export { toast };
