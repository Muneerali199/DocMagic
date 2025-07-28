import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type Database } from '@/types/supabase';

// Server Component Client - For Server Components
export const createServer = () => {
  try {
    const cookieStore = cookies();
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });
  } catch (error) {
    console.error('Error creating server client:', error);
    throw error;
  }
};

// Route Handler Client - For API Routes
export const createRoute = () => {
  try {
    const cookieStore = cookies();
    return createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });
  } catch (error) {
    console.error('Error creating route handler client:', error);
    throw error;
  }
};
