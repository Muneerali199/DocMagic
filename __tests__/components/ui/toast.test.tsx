import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  sonnerToast,
  sonnerSuccess,
  sonnerError,
  sonnerLoading,
  sonnerDismiss,
} = vi.hoisted(() => ({
  sonnerToast: vi.fn(),
  sonnerSuccess: vi.fn(),
  sonnerError: vi.fn(),
  sonnerLoading: vi.fn(),
  sonnerDismiss: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(sonnerToast, {
    success: sonnerSuccess,
    error: sonnerError,
    loading: sonnerLoading,
    dismiss: sonnerDismiss,
  }),
}));

import { toast, useToast } from '@/hooks/use-toast';

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a default toast with title and description', () => {
    toast({ title: 'Saved', description: 'Your changes were saved.' });

    expect(sonnerToast).toHaveBeenCalledWith('Saved', {
      description: 'Your changes were saved.',
    });
  });

  it('shows a destructive toast through sonner error', () => {
    toast({
      title: 'Error',
      description: 'Something went wrong.',
      variant: 'destructive',
    });

    expect(sonnerError).toHaveBeenCalledWith('Error', {
      description: 'Something went wrong.',
    });
    expect(sonnerToast).not.toHaveBeenCalled();
  });

  it('exposes helper methods from sonner', () => {
    toast.success('Success message');
    toast.error('Error message');
    toast.loading('Loading message');
    toast.dismiss('toast-id');

    expect(sonnerSuccess).toHaveBeenCalledWith('Success message');
    expect(sonnerError).toHaveBeenCalledWith('Error message');
    expect(sonnerLoading).toHaveBeenCalledWith('Loading message');
    expect(sonnerDismiss).toHaveBeenCalledWith('toast-id');
  });
});

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns toast helpers for components', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toast).toBe(toast);
    expect(result.current.dismissToast).toBe(sonnerDismiss);
  });

  it('allows components to trigger toasts through the hook', () => {
    const { result } = renderHook(() => useToast());

    result.current.toast({ title: 'Updated' });

    expect(sonnerToast).toHaveBeenCalledWith('Updated', { description: undefined });
  });
});
