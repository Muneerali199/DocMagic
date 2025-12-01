import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type Database } from '@/types/supabase';

// Custom fetch with timeout and retry logic
const createFetchWithTimeout = (timeoutMs: number = 30000) => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        console.error('Request timeout:', { url: input, timeout: timeoutMs });
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      
      // Handle connection errors
      if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('Connect Timeout Error')) {
        console.error('Connection timeout:', error);
        throw new Error('Unable to connect to authentication service. Please check your network connection.');
      }
      
      throw error;
    }
  };
};

// Server Component Client - For Server Components
export const createServer = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
      global: {
        fetch: createFetchWithTimeout(30000), // 30 second timeout
      },
    }
  );
};

// Route Handler Client - For API Routes
export const createRoute = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global: {
        fetch: createFetchWithTimeout(30000), // 30 second timeout
      },
    }
  );
};
