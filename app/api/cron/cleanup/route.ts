import { NextResponse } from 'next/server';
import { runDatabaseCleanup } from '@/lib/db-cleanup';
import { logger } from '@/lib/logger';

// Force Next.js to never cache this route so it runs fresh every time
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 1. Ensure the server has a secret configured
    if (!cronSecret) {
      logger.error({ route: 'cron/cleanup' }, 'CRON_SECRET is not configured in environment variables');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 2. Verify the incoming request has the matching secret
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn({ route: 'cron/cleanup' }, 'Unauthorized cleanup attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Execute the cleanup script
    logger.info({ route: 'cron/cleanup' }, 'Starting scheduled database cleanup');
    const results = await runDatabaseCleanup();

    // 4. Return the summary as requested in the Acceptance Criteria
    logger.info({ route: 'cron/cleanup' }, 'Database cleanup completed successfully', results);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error: any) {
    logger.error({ route: 'cron/cleanup' }, 'Critical error during database cleanup execution', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}