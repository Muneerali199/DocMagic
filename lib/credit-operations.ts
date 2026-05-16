// Atomic credit reservation helpers.
//
// The credit-consuming API routes previously followed a read -> check ->
// generate -> update pattern. That pattern is a classic TOCTOU race: two
// concurrent requests can both pass the credit check at the same time and
// each consume credits independently, letting a user with N credits trigger
// N+M generations. See GitHub issue #477 for the full repro.
//
// reserveCredits performs the deduction *before* generation using an
// optimistic-lock UPDATE. Only the request whose expected `credits_used`
// still matches in the row wins; the loser is told to retry. If generation
// later fails, refundCredits returns the reserved amount via a small CAS
// retry loop so concurrent activity cannot silently overwrite the refund.

import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserCreditsRow {
  id?: string;
  user_id: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  credits_total: number;
  credits_used: number;
  credits_reset_at: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  updated_at?: string;
}

/**
 * Atomically reserve `creditCost` credits using an optimistic-lock update.
 *
 * Only succeeds if the row's `credits_used` is still equal to
 * `expectedCreditsUsed` at the time Postgres applies the UPDATE, so two
 * concurrent callers cannot both pass the same check-then-update pattern.
 *
 * Uses `.maybeSingle()` so we can distinguish two outcomes that `.single()`
 * would conflate:
 *   - CAS miss (zero rows updated) -> { data: null, error: null } -> return null,
 *     the caller responds 402.
 *   - Real DB error -> { error } -> throw, the caller's outer try/catch
 *     produces a 500 instead of misleading the user with a "concurrent
 *     request" message.
 */
export async function reserveCredits(
  supabaseAdmin: SupabaseClient,
  userId: string,
  expectedCreditsUsed: number,
  creditCost: number
): Promise<UserCreditsRow | null> {
  if (creditCost <= 0) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .update({
      credits_used: expectedCreditsUsed + creditCost,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('credits_used', expectedCreditsUsed)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return data as UserCreditsRow;
}

/**
 * Refund a previously reserved amount when generation fails or the actual
 * cost ended up lower than the reservation. Uses a CAS-retry loop so a
 * concurrent reservation/usage cannot clobber the refund. Never lets
 * `credits_used` drop below 0.
 *
 * Returns true if the refund was applied, false if it could not be applied
 * after `maxAttempts` retries (caller should log and continue — the user
 * already has their content or has been told the request failed).
 */
export async function refundCredits(
  supabaseAdmin: SupabaseClient,
  userId: string,
  creditCost: number,
  maxAttempts = 5
): Promise<boolean> {
  if (creditCost <= 0) {
    return true;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: current, error: readError } = await supabaseAdmin
      .from('user_credits')
      .select('credits_used')
      .eq('user_id', userId)
      .single();

    if (readError || !current) {
      return false;
    }

    const newCreditsUsed = Math.max(0, current.credits_used - creditCost);

    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .update({
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('credits_used', current.credits_used)
      .select()
      .single();

    if (!error && data) {
      return true;
    }
  }
  return false;
}

/**
 * Standard 402 response body for the "you lost the race / no credits left"
 * case. Kept here so the messaging stays consistent across routes.
 */
export function creditReservationConflictResponse(
  creditCost: number,
  currentTier: string | undefined
) {
  return {
    error: 'Not enough credits',
    message:
      'A concurrent request consumed your remaining credits before this one could be reserved. Please try again in a moment.',
    needsUpgrade: false,
    currentTier: currentTier ?? 'free',
    creditCost,
  };
}
