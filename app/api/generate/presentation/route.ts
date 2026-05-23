export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generatePresentation, generatePresentationOutline } from '@/lib/gemini';
import { createClient } from '@supabase/supabase-js';
import { ACTION_COSTS, TIER_LIMITS, getCreditsResetDate, shouldResetCredits, calculateRemainingCredits, hasUnlimitedDeveloperCredits } from '@/lib/credits-service';
import { reserveCredits, refundCredits, creditReservationConflictResponse } from '@/lib/credit-operations';
import { presentationGenerationSchema, RequestValidationError, safeParseBody } from '@/lib/validation';

// Service role client for credit operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTHENTICATION CHECK
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create presentations.' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create presentations.' },
        { status: 401 }
      );
    }
    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);

    let prompt, validatedPageCount, template;
    try {
      const body = await safeParseBody(request, presentationGenerationSchema);
      prompt = body.prompt;
      validatedPageCount = body.pageCount;
      template = body.template;
    } catch (validationError) {
      if (!(validationError instanceof RequestValidationError)) {
        throw validationError;
      }
      return NextResponse.json(
        { error: validationError.message, details: validationError.details },
        { status: 400 }
      );
    }

    // Get or create user credits
    let { data: userCredits } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // If no credits record exists, create one
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
        console.error('Failed to create credits record:', insertError);
        return NextResponse.json(
          { error: 'Failed to initialize credits' },
          { status: 500 }
        );
      }
      userCredits = newCredits;
    }

    // Check if credits need reset
    if (userCredits && shouldResetCredits(userCredits.credits_reset_at)) {
      const resetAt = getCreditsResetDate();
      const { data: updatedCredits } = await supabaseAdmin
        .from('user_credits')
        .update({
          credits_used: 0,
          credits_reset_at: resetAt,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updatedCredits) {
        userCredits = updatedCredits;
      }
    }

    // Check if user has enough credits - use validated page count
    const creditsPerSlide = ACTION_COSTS.presentation;
    const estimatedCreditCost = validatedPageCount * creditsPerSlide;
    const creditsRemaining = hasUnlimitedCredits
      ? Number.MAX_SAFE_INTEGER
      : calculateRemainingCredits(userCredits.credits_total, userCredits.credits_used);
    
    if (!hasUnlimitedCredits && creditsRemaining < estimatedCreditCost) {
      const creditWord = estimatedCreditCost === 1 ? 'credit' : 'credits';
      const slideWord = validatedPageCount === 1 ? 'slide' : 'slides';
      return NextResponse.json(
        {
          error: 'Not enough credits',
          message: `You need ${estimatedCreditCost} ${creditWord} to generate a ${validatedPageCount}-${slideWord} presentation. You have ${creditsRemaining} ${creditsRemaining === 1 ? 'credit' : 'credits'} remaining.`,
          needsUpgrade: true,
          currentTier: userCredits.tier,
          creditsRemaining,
          creditsRequired: estimatedCreditCost
        },
        { status: 402 }
      );
    }

    // Atomically reserve the estimated credit cost BEFORE generation to
    // prevent the TOCTOU race documented in issue #477. If the model returns
    // fewer slides than requested we refund the difference below.
    if (!hasUnlimitedCredits) {
      const reserved = await reserveCredits(
        supabaseAdmin,
        user.id,
        userCredits.credits_used,
        estimatedCreditCost
      );
      if (!reserved) {
        return NextResponse.json(
          creditReservationConflictResponse(estimatedCreditCost, userCredits.tier),
          { status: 402 }
        );
      }
      userCredits = reserved;
    }

    // Generate presentation outline first
    let outlines;
    let slides;
    try {
      outlines = await generatePresentationOutline({ prompt, pageCount: validatedPageCount });
      // Generate full presentation with visuals
      slides = await generatePresentation({ outlines, prompt, template });
    } catch (err) {
      if (!hasUnlimitedCredits) {
        await refundCredits(supabaseAdmin, user.id, estimatedCreditCost);
      }
      throw err;
    }

    const actualCreditCost = slides.length * creditsPerSlide;
    if (hasUnlimitedCredits) {
      return NextResponse.json({
        slides,
        credits: {
          used: 0,
          remaining: Number.MAX_SAFE_INTEGER
        }
      });
    }

    // If fewer slides were generated than reserved, refund the difference.
    const overReserved = estimatedCreditCost - actualCreditCost;
    if (overReserved > 0) {
      const refunded = await refundCredits(supabaseAdmin, user.id, overReserved);
      if (!refunded) {
        console.error(`Failed to refund ${overReserved} over-reserved credits for user ${user.id}`);
      }
    }

    // Log the actual usage now that generation succeeded.
    const { error: logError } = await supabaseAdmin
      .from('credit_usage_log')
      .insert({
        user_id: user.id,
        action: 'presentation',
        credits_used: actualCreditCost,
        metadata: {
          pageCount: slides.length,
          prompt_length: prompt.length
        }
      });

    if (logError) {
      console.error('Failed to log credit usage:', logError);
    } else {
      console.log(`💳 Deducted ${actualCreditCost} credits for ${slides.length}-slide presentation`);
    }

    return NextResponse.json({
      slides,
      credits: {
        used: actualCreditCost,
        remaining: calculateRemainingCredits(
          userCredits.credits_total,
          userCredits.credits_used - overReserved
        )
      }
    });
  } catch (error) {
    console.error('Error generating presentation:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
