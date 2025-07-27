'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface ApiResponse {
  user?: User | null;
  session?: Session | null;
  error?: string;
  message?: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ 
    data: { user: User | null; session: Session | null } | null; 
    error: Error | null 
  }>;
  signUp: (email: string, password: string) => Promise<{ 
    data: { user: User | null; session: Session | null } | null;
    error: Error | null 
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  verifyMFA: (code: string) => Promise<{ error: Error | null }>;
  setupMFA: () => Promise<{ 
    data: { secret: string; qrCode: string } | null; 
    error: Error | null 
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripeReady, setStripeReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        return { 
          data: null, 
          error: new Error(data.error || 'Login failed') 
        };
      }

      return { 
        data: { 
          user: data.user || null, 
          session: data.session || null 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('An unknown error occurred')
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        return { 
          data: null,
          error: new Error(data.error || 'Signup failed') 
        };
      }

      return { 
        data: { 
          user: data.user || null, 
          session: data.session || null 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred')
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          error: new Error(data.error || 'Failed to send reset password email') 
        };
      }

      return { error: null };
    } catch (error: any) {
      return { 
        error: error instanceof Error ? error : new Error('An unknown error occurred')
      };
    }
  };

  const verifyMFA = async (code: string) => {
    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          error: new Error(data.error || 'MFA verification failed') 
        };
      }

      return { error: null };
    } catch (error: any) {
      return { 
        error: error instanceof Error ? error : new Error('An unknown error occurred')
      };
    }
  };

  const setupMFA = async () => {
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          data: null,
          error: new Error(data.error || 'Failed to set up MFA') 
        };
      }

      return { 
        data: { 
          secret: data.secret,
          qrCode: data.qrCode
        }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred')
      };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyMFA,
    setupMFA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
