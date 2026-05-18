const { NextResponse } = require('next/server');
import { createRoute } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabase = await createRoute();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('subscription:subscriptions(stripe_subscription_id)')
    .eq('email', user.email)
    .single();

  if (error || !userData) {
    return NextResponse.json({ subscribed: false }, { status: 200 });
  }

  const subscribed = !!(userData.subscription && userData.subscription.length > 0 && userData.subscription[0].stripe_subscription_id);

  return NextResponse.json({ subscribed });
}