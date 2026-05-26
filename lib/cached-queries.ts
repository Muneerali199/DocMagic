import type { SupabaseClient } from '@supabase/supabase-js';
import { queryCache, cacheKeys } from './query-cache';
import { trackQuery } from './performance-optimizer';
import { TIER_LIMITS, getCreditsResetDate, shouldResetCredits } from './credits-service';
import type { UserCreditsRow } from './credit-operations';

// 15 s TTL — short enough that users see fresh data on any page refresh,
// but eliminates repeated DB reads within a single generate-request burst.
const CREDITS_TTL_MS = 15_000;

/**
 * Returns the user_credits row for the given user, served from a 15s in-memory
 * cache. Creates the row if it does not exist and resets credits if the monthly
 * reset date has passed. Handles concurrent first-insert races via retry SELECT.
 */
export async function getCachedUserCredits(
  supabaseAdmin: SupabaseClient,
  userId: string
): Promise<UserCreditsRow | null> {
  const key = cacheKeys.userCredits(userId);
  const cached = queryCache.get<UserCreditsRow>(key);
  if (cached) return cached;

  const t0 = Date.now();
  const { data } = await supabaseAdmin
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();
  trackQuery('user_credits_select', Date.now() - t0);

  let row = data as UserCreditsRow | null;

  if (!row) {
    const { data: newRow, error: insertError } = await supabaseAdmin
      .from('user_credits')
      .insert({
        user_id: userId,
        tier: 'free',
        credits_total: TIER_LIMITS.free,
        credits_used: 0,
        credits_reset_at: getCreditsResetDate(),
      })
      .select()
      .single();

    if (insertError) {
      // Concurrent request may have already inserted the row (unique constraint).
      // Retry the SELECT before giving up so we don't return null on a race.
      const { data: retryRow } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!retryRow) return null;
      row = retryRow as UserCreditsRow;
    } else {
      if (!newRow) return null;
      row = newRow as UserCreditsRow;
    }
  }

  if (shouldResetCredits(row.credits_reset_at)) {
    const resetAt = getCreditsResetDate();
    const { data: resetRow } = await supabaseAdmin
      .from('user_credits')
      .update({ credits_used: 0, credits_reset_at: resetAt })
      .eq('user_id', userId)
      .select()
      .single();
    // Only use DB-confirmed state — never cache a synthetic value that wasn't committed.
    if (!resetRow) return row;
    row = resetRow as UserCreditsRow;
  }

  queryCache.set(key, row, CREDITS_TTL_MS);
  return row;
}

/** Immediately removes the cached credits row so the next read hits the DB. */
export function invalidateUserCredits(userId: string): void {
  queryCache.invalidate(cacheKeys.userCredits(userId));
}
