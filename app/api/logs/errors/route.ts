import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger, requestContextFromHeaders } from '@/lib/logger';

const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 8000;
const MAX_FIELD_LENGTH = 500;

function toBoundedString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.slice(0, maxLength);
}

function toIsoTimestamp(value: unknown): string {
  const candidate = toBoundedString(value, 100);
  const date = candidate ? new Date(candidate) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export async function POST(request: NextRequest) {
  const logContext = requestContextFromHeaders(request.headers, 'app/api/logs/errors/route.ts');

  try {
    const body = await request.json();
    const message = toBoundedString(body?.message, MAX_MESSAGE_LENGTH) || 'Unknown error';
    const stack = toBoundedString(body?.stack, MAX_STACK_LENGTH);
    const timestamp = toIsoTimestamp(body?.timestamp);
    const pathname = toBoundedString(body?.pathname, MAX_FIELD_LENGTH);
    const userAgent = toBoundedString(body?.userAgent, MAX_FIELD_LENGTH);
    const environment = toBoundedString(body?.environment, MAX_FIELD_LENGTH);
    const url = toBoundedString(body?.url, MAX_FIELD_LENGTH);
    const digest = toBoundedString(body?.digest, MAX_FIELD_LENGTH);

    const errorLog = {
      timestamp,
      message,
      pathname,
      environment,
      url,
      digest,
      userAgent: userAgent ? `${userAgent.substring(0, 50)}...` : undefined,
    };

    logger.error(logContext, 'Client error report', errorLog);

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
    logger.error(logContext, 'Failed to log client error report', error);
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}
