import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

const { NextResponse } = require('next/server');

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email, redirectTo } = await request.json();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(`reset-password-${ip}`);
  
  if (!rateLimitResult.isAllowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many password reset attempts. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '300', // 5 minutes
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt / 1000).toString(),
        },
      }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Password reset email sent. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send password reset email' },
      { status: error.status || 500 }
    );
  }
}
