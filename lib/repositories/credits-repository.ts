import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserCredits {
  user_id: string;
  tier: string;
  credits_total: number;
  credits_used: number;
  credits_reset_at: string;
}

export async function getUserCredits(
  userId: string
): Promise<UserCredits | null> {
  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user credits: ${error.message}`);
  }

  return data;
}

export async function createUserCredits(
  userId: string,
  creditsTotal: number,
  resetDate: string
): Promise<UserCredits> {
  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .insert({
      user_id: userId,
      tier: 'free',
      credits_total: creditsTotal,
      credits_used: 0,
      credits_reset_at: resetDate,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user credits: ${error.message}`);
  }

  return data;
}

export async function resetUserCredits(
  userId: string,
  resetDate: string
): Promise<UserCredits> {
  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .update({
      credits_used: 0,
      credits_reset_at: resetDate,
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reset user credits: ${error.message}`);
  }

  return data;
}