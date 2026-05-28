import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, ValidationError, DatabaseError } from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'operational';

  if (type === 'validation') {
    throw new ValidationError('Invalid input payload: Name field is required and cannot be empty.', { field: 'name' });
  }

  if (type === 'unhandled') {
    // Simulates an unexpected JavaScript crash (e.g. referencing a null property)
    const crashContext: any = null;
    return crashContext.nonExistentMethod();
  }

  if (type === 'critical') {
    // Simulates a severe system failure (HTTP 500 database connection timeout)
    throw new DatabaseError('Supabase pool connection timed out after 15000ms.', {
      host: 'replica-pool-1.supabase.co',
      port: 5432,
      activeConnections: 120,
    });
  }

  if (type === 'spike') {
    // Trigger 25 mock errors consecutively to test rolling window spike alert (threshold: error rate > 5%)
    const { captureException } = await import('@/lib/error-handler');
    
    for (let i = 0; i < 25; i++) {
      try {
        throw new DatabaseError(`Mock Spike Error #${i} for alert threshold verification.`);
      } catch (err) {
        await captureException(err, {
          requestId: `mock-spike-id-${i}-${Date.now()}`,
          path: '/api/error-test',
          method: 'GET',
          ip: '127.0.0.1',
          userAgent: 'Mock Tester',
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Triggered 25 mock critical database errors consecutively to test the spike alarm rule. Check console for System Spike Alert warnings.',
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Error testing endpoint active. Send ?type=validation, ?type=critical, ?type=unhandled, or ?type=spike to test different error capture rules.',
  });
}

export const GET = withErrorHandling(handler);
export const POST = withErrorHandling(handler);
