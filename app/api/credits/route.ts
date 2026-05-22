import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TIER_LIMITS, ACTION_COSTS, TIER_NAMES, TIER_FEATURES, hasUnlimitedDeveloperCredits, getCreditsResetDate, shouldResetCredits, type Tier, type ActionType } from '@/lib/credits-service';
import { reserveCredits } from '@/lib/credit-operations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Get user's credit info
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);

    // Get user credits
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no credits record, create one
    if (error?.code === 'PGRST116' || !credits) {
      const resetDate = getCreditsResetDate();

      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          tier: 'free',
          credits_total: TIER_LIMITS.free,
          credits_used: 0,
          credits_reset_at: resetDate,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating credits:', insertError);
        // Return default free tier info
        return NextResponse.json({
          tier: 'free',
          tierName: TIER_NAMES.free,
          creditsTotal: TIER_LIMITS.free,
          creditsUsed: 0,
          creditsRemaining: TIER_LIMITS.free,
          features: TIER_FEATURES.free,
          resetDate: resetDate,
          actionCosts: ACTION_COSTS,
        });
      }

      credits = newCredits;
    }

    // Check if credits need reset
    if (credits && shouldResetCredits(credits.credits_reset_at)) {
      const resetDate = getCreditsResetDate();

      const { data: updatedCredits } = await supabase
        .from('user_credits')
        .update({
          credits_used: 0,
          credits_reset_at: resetDate,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updatedCredits) {
        credits = updatedCredits;
      }
    }

    const tier = (credits?.tier || 'free') as Tier;
    const tierToShow = hasUnlimitedCredits ? 'enterprise' : tier;
    const creditsTotal = hasUnlimitedCredits
      ? Number.MAX_SAFE_INTEGER
      : (credits?.credits_total || TIER_LIMITS[tier]);
    const creditsUsed = hasUnlimitedCredits ? 0 : (credits?.credits_used || 0);

    return NextResponse.json({
      tier: tierToShow,
      tierName: TIER_NAMES[tierToShow],
      creditsTotal,
      creditsUsed,
      creditsRemaining: creditsTotal - creditsUsed,
      features: TIER_FEATURES[tierToShow],
      resetDate: credits?.credits_reset_at,
      actionCosts: ACTION_COSTS,
      subscriptionStatus: credits?.subscription_status || 'active',
    });

  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json(
      { error: 'Failed to get credits info' },
      { status: 500 }
    );
  }
}

// POST: Use credits for an action
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);

    const body = await request.json();
    const { action, metadata } = body as { action: ActionType; metadata?: any };

    if (!action || !ACTION_COSTS[action]) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Get user credits
    let { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no credits record, create one
    if (error?.code === 'PGRST116' || !credits) {
      const resetDate = getCreditsResetDate();

      const { data: newCredits, error: insertError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          tier: 'free',
          credits_total: TIER_LIMITS.free,
          credits_used: 0,
          credits_reset_at: resetDate,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to initialize credits' },
          { status: 500 }
        );
      }

      credits = newCredits;
    }

    // Check if credits need reset
    if (credits && shouldResetCredits(credits.credits_reset_at)) {
      const resetDate = getCreditsResetDate();

      const { data: updatedCredits } = await supabase
        .from('user_credits')
        .update({
          credits_used: 0,
          credits_reset_at: resetDate,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updatedCredits) {
        credits = updatedCredits;
      }
    }

    const creditsRemaining = credits.credits_total - credits.credits_used;
    const creditsRequired = ACTION_COSTS[action];

    if (hasUnlimitedCredits) {
      return NextResponse.json({
        success: true,
        creditsUsed: 0,
        creditsRemaining: Number.MAX_SAFE_INTEGER,
        tier: 'enterprise',
      });
    }

    // Check if user has enough credits
    if (creditsRemaining < creditsRequired) {
      return NextResponse.json({
        success: false,
        error: 'Not enough credits',
        creditsRemaining,
        creditsRequired,
        tier: credits.tier,
        needsUpgrade: true,
        message: `You need ${creditsRequired} credits but only have ${creditsRemaining}. Please upgrade your plan to continue.`,
      }, { status: 402 }); // 402 Payment Required
    }

    // Atomically reserve the credits using an optimistic-lock update to
    // prevent the TOCTOU race documented in issue #477. Two concurrent
    // requests with the same `expectedCreditsUsed` can no longer both
    // succeed; the loser gets a 402 with the conflict message.
    const reserved = await reserveCredits(
      supabase,
      user.id,
      credits.credits_used,
      creditsRequired
    );

    if (!reserved) {
      return NextResponse.json({
        success: false,
        error: 'Not enough credits',
        creditsRemaining,
        creditsRequired,
        tier: credits.tier,
        needsUpgrade: false,
        message: 'A concurrent request consumed your remaining credits before this one could be reserved. Please try again in a moment.',
      }, { status: 402 });
    }

    // Log the usage
    await supabase
      .from('credit_usage_log')
      .insert({
        user_id: user.id,
        credits_used: creditsRequired,
        action_type: action,
        metadata: metadata || {},
      });

    return NextResponse.json({
      success: true,
      creditsUsed: creditsRequired,
      creditsRemaining: reserved.credits_total - reserved.credits_used,
      tier: credits.tier,
    });

  } catch (error) {
    console.error('Credits API error:', error);
    return NextResponse.json(
      { error: 'Failed to use credits' },
      { status: 500 }
    );
  }
}
