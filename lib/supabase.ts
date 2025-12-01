import { createClientComponentClient, createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { type Database } from '@/types/supabase';

// Client-side Supabase client (safe to use in client components)
export const createClient = () => createClientComponentClient<Database>();

// Server-side Supabase client (only use in Server Components)
export const createServer = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};

// Route handler Supabase client (only use in API routes)
export const createRoute = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({ cookies: () => cookieStore });
};