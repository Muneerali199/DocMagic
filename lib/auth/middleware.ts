import { createRoute } from '@/lib/supabase/server';
import { type SupabaseClient } from '@supabase/supabase-js';

export async function checkSubscription(supabase: any, userId: string) {
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      subscription_plans (
        name,
        limits
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return subscription;
}

export async function checkUsageLimit(supabase: any, userId: string, resourceType: string) {
  // Call the database function to check limits
  const { data, error } = await supabase.rpc('check_user_limit', {
    p_user_id: userId,
    p_resource_type: resourceType
  });

  if (error) {
    console.error('Error checking usage limit:', error);
    return { allowed: false, message: 'Error checking usage limit' };
  }

  return data;
}

export async function trackUsage(supabase: any, userId: string, resourceType: string, resourceId: string, action: string = 'create') {
  const { error } = await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      action: action
    });

  if (error) {
    console.error('Error tracking usage:', error);
  }
}
