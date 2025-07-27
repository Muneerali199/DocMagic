import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// This is a Server Component
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  
  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      });
      
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) throw error;
      
    } catch (error) {
      console.error('Auth callback error:', error);
      const errorUrl = new URL('/auth/error', request.url);
      errorUrl.searchParams.set('message', 'auth_failed');
      return Response.redirect(errorUrl);
    }
  }
  
  return Response.redirect(new URL(next, request.url));
}
