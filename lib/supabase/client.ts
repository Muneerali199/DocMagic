import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/supabase'
import { isDevelopmentMode, mockAuth } from '@/lib/mock-auth'

// Get the URL from environment or use mock for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

export const createClient = () => {
  if (isDevelopmentMode()) {
    // Return a mock client for development
    return {
      auth: mockAuth,
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}