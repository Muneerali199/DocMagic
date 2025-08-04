import { createClient as createClientOriginal, SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment configuration.');
}

let supabaseInstance: SupabaseClient<Database> | null = null;

// Export the Supabase client
export const createClient = () => {
  if (typeof window === 'undefined') {
    // For server-side, always create new instance
    return createClientOriginal<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
  }

  // For client-side, use singleton
  if (!supabaseInstance) {
    supabaseInstance = createClientOriginal<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    });
  }

  return supabaseInstance;
};