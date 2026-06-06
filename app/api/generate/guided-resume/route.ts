import { logger } from '@/lib/logger';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const { NextResponse } = require('next/server');
import { createClient } from '@supabase/supabase-js';
import { generateGuidedResume } from '@/lib/gemini';
import {
  ACTION_COSTS,
  TIER_LIMITS,
  getCreditsResetDate,
  shouldResetCredits,
  calculateRemainingCredits,
} from '@/lib/credits-service';
import { hasUnlimitedDeveloperCredits, logDeveloperCreditBypass } from '@/lib/developer-credit-bypass';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);
    const creditCost = ACTION_COSTS.resume;

    // Get or create user credits
    let { data: userCredits } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!userCredits) {
      const { data: newCredits, error: insertError } = await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: user.id,
          tier: 'free',
          credits_total: TIER_LIMITS.free,
          credits_used: 0,
          credits_reset_at: getCreditsResetDate()
        })
        .select()
        .single();

      if (insertError) {
        logger.error({ route: 'app/api/generate/guided-resume/route.ts' }, 'Failed to create credits record:', insertError);
        return NextResponse.json(
          { error: 'Failed to initialize credits' },
          { status: 500 }
        );
      }
      userCredits = newCredits;
    }

    if (userCredits && shouldResetCredits(userCredits.credits_reset_at)) {
      const resetAt = getCreditsResetDate();
      const { data: updatedCredits } = await supabaseAdmin
        .from('user_credits')
        .update({ credits_used: 0, credits_reset_at: resetAt })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updatedCredits) userCredits = updatedCredits;
    }

    const creditsRemaining = hasUnlimitedCredits
      ? Number.MAX_SAFE_INTEGER
      : calculateRemainingCredits(userCredits.credits_total, userCredits.credits_used);

    if (!hasUnlimitedCredits && creditsRemaining < creditCost) {
      return NextResponse.json(
        {
          error: 'Not enough credits',
          message: `You need ${creditCost} credit to generate a resume. You have ${creditsRemaining} credits remaining.`,
          needsUpgrade: true,
          currentTier: userCredits.tier,
          creditsRemaining
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const {
      personalInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      projects,
      certifications,
      links,
      targetRole,
      jobDescription
    } = body;

    if (!personalInfo || !targetRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (hasUnlimitedCredits) {
      logDeveloperCreditBypass({ userId: user.id, email: user.email, action: 'resume' });
    }

    const resume = await generateGuidedResume({
      personalInfo,
      professionalSummary,
      workExperience,
      education,
      skills,
      projects,
      certifications,
      links,
      targetRole,
      jobDescription
    });

    // Deduct credits after successful generation
    if (!hasUnlimitedCredits) {
      const { error: updateError } = await supabaseAdmin
        .from('user_credits')
        .update({
          credits_used: userCredits!.credits_used + creditCost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        logger.error({ route: 'app/api/generate/guided-resume/route.ts' }, 'Failed to deduct credits:', updateError);
      } else {
        await supabaseAdmin
          .from('credit_usage_log')
          .insert({
            user_id: user.id,
            action: 'resume',
            credits_used: creditCost,
            metadata: { type: 'guided-resume', target_role: targetRole }
          });
      }
    }

    return NextResponse.json(resume);
  } catch (error) {
    logger.error({ route: 'app/api/generate/guided-resume/route.ts' }, 'Error generating guided resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
