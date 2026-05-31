import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Initialize a Supabase admin client to bypass RLS for automated cleanup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export interface CleanupResults {
  orphanedUsageRecords: number;
  unverifiedUsers: number;
  expiredRateLimits: number;
  expiredSessions: number;
  errors: string[];
}

export async function runDatabaseCleanup(): Promise<CleanupResults> {
  const results: CleanupResults = {
    orphanedUsageRecords: 0,
    unverifiedUsers: 0,
    expiredRateLimits: 0,
    expiredSessions: 0,
    errors: [],
  };

  const now = new Date().toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // 1. Clean Orphaned Usage Tracking Records (No valid user_id)
  try {
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('usage_tracking')
      .delete()
      .is('user_id', null)
      .select('id');

    if (usageError) throw usageError;
    results.orphanedUsageRecords = usageData?.length || 0;
  } catch (err: any) {
    logger.error({ route: 'lib/db-cleanup.ts' }, 'Error cleaning usage_tracking:', err);
    results.errors.push(`usage_tracking: ${err.message}`);
  }

  // 2. Clean Expired Rate Limiting Data (if stored in DB)
  try {
    const { data: rlData, error: rlError } = await supabaseAdmin
      .from('rate_limits')
      .delete()
      .lt('expires_at', now)
      .select('id');

    // Ignore error if table doesn't exist (PGRST205) as issue says "if stored in DB"
    if (rlError && rlError.code !== 'PGRST205') throw rlError;
    results.expiredRateLimits = rlData?.length || 0;
  } catch (err: any) {
    logger.error({ route: 'lib/db-cleanup.ts' }, 'Error cleaning rate_limits:', err);
    results.errors.push(`rate_limits: ${err.message}`);
  }

  // 3. Clean Expired Custom Sessions (> 7 days old)
  try {
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .lt('updated_at', sevenDaysAgo)
      .select('id');

    if (sessionError && sessionError.code !== 'PGRST205') throw sessionError;
    results.expiredSessions = sessionData?.length || 0;
  } catch (err: any) {
    logger.error({ route: 'lib/db-cleanup.ts' }, 'Error cleaning custom sessions:', err);
    results.errors.push(`sessions: ${err.message}`);
  }

  // 4. Clean Unverified User Accounts (> 24 hours old)
  // Note: Standard Supabase auth handles session cleanup, but we can purge unverified auth users.
  try {
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    const unverifiedUsers = usersData.users.filter(
      (user) => 
        user.email_confirmed_at === null && 
        new Date(user.created_at).getTime() < new Date(twentyFourHoursAgo).getTime()
    );

    for (const user of unverifiedUsers) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (deleteError) {
        logger.error({ route: 'lib/db-cleanup.ts' }, `Failed to delete unverified user ${user.id}:`, deleteError);
      } else {
        results.unverifiedUsers++;
      }
    }
  } catch (err: any) {
    logger.error({ route: 'lib/db-cleanup.ts' }, 'Error cleaning unverified users:', err);
    results.errors.push(`auth_users: ${err.message}`);
  }

  return results;
}