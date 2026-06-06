import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      stack,
      timestamp,
      pathname,
      userAgent,
      environment,
      url,
      digest,
    } = body;

    // Log to console with formatted output
    const errorLog = {
      timestamp: new Date(timestamp).toISOString(),
      message,
      pathname,
      environment,
      url,
      digest,
      userAgent: userAgent?.substring(0, 50) + '...',
    };

    console.error('[ERROR LOG]', errorLog);

    // Send to Sentry
    Sentry.withScope((scope) => {
      scope.setExtra('pathname', pathname);
      scope.setExtra('url', url);
      scope.setExtra('environment', environment);
      scope.setExtra('userAgent', userAgent);
      
      const error = new Error(message || 'Unknown error');
      if (stack) error.stack = stack;
      
      Sentry.captureException(error);
    });

    // Store in database (optional)
    // const { createClient } = await import('@/lib/supabase/client');
    // const supabase = createClient();
    // await supabase.from('error_logs').insert({
    //   message,
    //   pathname,
    //   stack,
    //   user_agent: userAgent,
    //   environment,
    //   url,
    //   created_at: new Date().toISOString(),
    // });

    return NextResponse.json(
      { success: true, message: 'Error logged successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to log error:', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
