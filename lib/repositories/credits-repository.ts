import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserCredits(userId: string) {
  return await supabaseAdmin
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function createUserCredits(userId: string, creditsTotal: number, resetDate: string) {
  return await supabaseAdmin
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
}

export async function resetUserCredits(userId: string, resetDate: string) {
  return await supabaseAdmin
    .from('user_credits')
    .update({
      credits_used: 0,
      credits_reset_at: resetDate,
    })
    .eq('user_id', userId)
    .select()
    .single();
}