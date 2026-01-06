export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateDiagramWithMistral } from '@/lib/mistral';
import { createClient } from '@supabase/supabase-js';
import { ACTION_COSTS, TIER_LIMITS, getCreditsResetDate, shouldResetCredits, calculateRemainingCredits } from '@/lib/credits-service';

// Service role client for credit operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // ✅ AUTHENTICATION CHECK
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create diagrams.' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create diagrams.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, diagramType = 'flowchart' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Check user credits
    const creditCost = ACTION_COSTS.diagram;
    
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

    // Check if user has enough credits
    const creditsRemaining = calculateRemainingCredits(userCredits.credits_total, userCredits.credits_used);
    
    if (creditsRemaining < creditCost) {
      return NextResponse.json(
        { 
          error: 'Not enough credits',
          message: `You need ${creditCost} credits to generate a diagram. You have ${creditsRemaining} credits remaining.`,
          needsUpgrade: true,
          currentTier: userCredits.tier,
          creditsRemaining
        },
        { status: 402 }
      );
    }

    console.log(`📊 Generating ${diagramType} diagram with Mistral...`);
    
    const diagram = await generateDiagramWithMistral({ prompt, diagramType });
    
    console.log('✅ Diagram generated successfully with Mistral');
    
    // ✅ DEDUCT CREDITS after successful generation
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({ 
        credits_used: userCredits.credits_used + creditCost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to deduct credits:', updateError);
      // Don't fail the request, just log the error
    } else {
      // Log the usage
      await supabaseAdmin
        .from('credit_usage_log')
        .insert({
          user_id: user.id,
          action: 'diagram',
          credits_used: creditCost,
          metadata: { diagram_type: diagramType, prompt_length: prompt.length }
        });
      
      console.log(`💳 Deducted ${creditCost} credits for diagram generation`);
    }
    
    return NextResponse.json(diagram);
  } catch (error) {
    console.error('Error generating diagram:', error);
    return NextResponse.json(
      { error: 'Failed to generate diagram', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}