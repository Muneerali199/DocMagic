import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createClientComponentClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

// Require Supabase credentials in env. Provide clear error if missing.
// No explicit URL/key needed here; helper reads from NEXT_PUBLIC_SUPABASE_* env internally.

// Server Component Client - For Server Components
export const createServer = () => {
  try {
    const cookieStore = cookies();
    return createServerComponentClient({
      cookies: () => cookieStore,
    }) as any as Database;
  } catch (error) {
    console.error('Error creating server client:', error);
    if (process.env.NODE_ENV === 'production' && !process.env.RUNTIME_ENV) {
      return {
        auth: { getSession: async () => ({ data: { session: null } }) },
        from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
      } as any;
    }
    throw error;
  }
};

// Route Handler Client - For API Routes
export const createRoute = () => {
  try {
    const cookieStore = cookies();
    return createRouteHandlerClient({
      cookies: () => cookieStore,
    }) as any as Database;
  } catch (error) {
    console.error('Error creating route handler client:', error);
    if (process.env.NODE_ENV === 'production' && !process.env.RUNTIME_ENV) {
      return {
        auth: { getSession: async () => ({ data: { session: null } }) },
        from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) })
      } as any;
    }
    throw error;
  }
};

// Client Component Client - For Client Components
export const createClient = () => {
  if (typeof window === 'undefined') {
    return createServer();
  }
  
  // Get Supabase URL and key from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClientComponentClient(supabaseUrl, supabaseKey);
};