'use client';

import { AuthProvider as SupabaseAuthProvider } from '@/contexts/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}

export { useAuth } from '@/contexts/auth-context';
