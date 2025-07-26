
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/supabase'
import { isDevelopmentMode, mockAuth } from '@/lib/mock-auth'

import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createClientComponentClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';


// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'


export const createServer = async () => {
  if (isDevelopmentMode()) {
    // Return a mock server client for development
    return {
      auth: mockAuth,
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: async () => ({ data: null, error: null }),
            data: [],
            error: null
          }),
          data: [],
          error: null
        }),
        insert: (values: any) => ({ data: null, error: null }),
        update: (values: any) => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any

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


  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // Handle cookie setting errors in middleware/server components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )
}

export const createRoute = createServer

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

