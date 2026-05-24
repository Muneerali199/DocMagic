import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Send to external monitoring service (Sentry, LogRocket, etc.)
    // Example with Sentry:
    // if (process.env.SENTRY_DSN) {
    //   await fetch(process.env.SENTRY_DSN, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       event_id: digest || crypto.randomUUID(),
    //       message,
    //       exception: {
    //         values: [
    //           {
    //             type: 'Error',
    //             value: message,
    //             stacktrace: {
    //               frames: stack ? [{raw: stack}] : [],
    //             },
    //           },
    //         ],
    //       },
    //       request: {
    //         url,
    //         user_agent: userAgent,
    //       },
    //     }),
    //   });
    // }

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
