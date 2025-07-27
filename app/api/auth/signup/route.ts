const { NextResponse } = require('next/server');

export const dynamic = 'force-dynamic';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // Apply rate limiting
  const rateLimitResult = rateLimit(`signup-${ip}`);
  
  if (!rateLimitResult.isAllowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many signup attempts. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          'X-RateLimit-Limit': '5', // Lower limit for signup
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetAt / 1000).toString(),
        },
      }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    return NextResponse.json({
      message: 'Signup successful! Please check your email for verification.',
      user: data.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
