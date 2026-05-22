import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '@/types/supabase';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment configuration.');
}

const isPlaceholder = supabaseUrl.includes("your-project-id") || supabaseUrl.includes("placeholder");

// Global mock auth listeners shared across mock client instances
let mockAuthListeners: Array<(event: string, session: any) => void> = [];

// Export the Supabase client
export const createClient = () => {
  if (isPlaceholder) {
    const mockUser = {
      id: 'dev-user-id',
      email: 'developer@example.com',
      user_metadata: { name: 'Local Developer' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const mockSession = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh',
      user: mockUser,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    const getStoredSession = () => {
      if (typeof window === 'undefined') return null;
      try {
        const stored = localStorage.getItem('sb-mock-session');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    };

    return {
      auth: {
        getSession: async () => {
          const session = getStoredSession();
          return { data: { session }, error: null };
        },
        getUser: async () => {
          const session = getStoredSession();
          return { data: { user: session?.user ?? null }, error: null };
        },
        signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
          if (!password || password.length < 6) {
            return { data: null, error: { message: 'Password must be at least 6 characters' } } as any;
          }
          const userObj = { ...mockUser, email: email || 'developer@example.com' };
          const sessionObj = { ...mockSession, user: userObj };
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-mock-session', JSON.stringify(sessionObj));
          }
          mockAuthListeners.forEach(cb => cb('SIGNED_IN', sessionObj));
          return { data: { user: userObj, session: sessionObj }, error: null };
        },
        signUp: async ({ email, password }: { email: string; password?: string }) => {
          if (!password || password.length < 6) {
            return { data: null, error: { message: 'Password must be at least 6 characters' } } as any;
          }
          const userObj = { ...mockUser, email: email || 'developer@example.com' };
          const sessionObj = { ...mockSession, user: userObj };
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-mock-session', JSON.stringify(sessionObj));
          }
          mockAuthListeners.forEach(cb => cb('SIGNED_IN', sessionObj));
          return { data: { user: userObj, session: sessionObj }, error: null };
        },
        signInWithOAuth: async ({ provider }: { provider: string }) => {
          const userObj = { ...mockUser, email: `oauth-${provider}@example.com` };
          const sessionObj = { ...mockSession, user: userObj };
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb-mock-session', JSON.stringify(sessionObj));
          }
          mockAuthListeners.forEach(cb => cb('SIGNED_IN', sessionObj));
          // Redirect home to simulate complete OAuth flow
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return { data: { user: userObj, session: sessionObj }, error: null };
        },
        signOut: async () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sb-mock-session');
          }
          mockAuthListeners.forEach(cb => cb('SIGNED_OUT', null));
          return { error: null };
        },
        onAuthStateChange: (callback: any) => {
          mockAuthListeners.push(callback);
          const session = getStoredSession();
          // Notify immediate session state on subscription
          setTimeout(() => {
            callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
          }, 0);
          return {
            data: {
              subscription: {
                unsubscribe: () => {
                  mockAuthListeners = mockAuthListeners.filter(cb => cb !== callback);
                }
              }
            }
          };
        },
        resend: async () => ({ data: {}, error: null }),
      },
      from: () => {
        const queryChain = {
          select: () => queryChain,
          insert: () => queryChain,
          update: () => queryChain,
          delete: () => queryChain,
          eq: () => queryChain,
          order: () => queryChain,
          limit: () => queryChain,
          single: async () => ({ data: null, error: null }),
          maybeSingle: async () => ({ data: null, error: null }),
          then: (resolve: any) => resolve({ data: [], error: null }),
        };
        return queryChain;
      },
    } as any;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};