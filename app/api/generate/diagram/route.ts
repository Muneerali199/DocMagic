import { logger } from '@/lib/logger';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateDiagramWithMistral } from '@/lib/mistral';
import { createClient } from '@supabase/supabase-js';
import { ACTION_COSTS, calculateRemainingCredits } from '@/lib/credits-service';
import { hasUnlimitedDeveloperCredits, logDeveloperCreditBypass } from '@/lib/developer-credit-bypass';
import { reserveCredits, refundCredits, creditReservationConflictResponse } from '@/lib/credit-operations';
import { getCachedUserCredits, invalidateUserCredits } from '@/lib/cached-queries';

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
    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);

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
    
    // Get or create user credits (cached, 15 s TTL)
    const userCredits = await getCachedUserCredits(supabaseAdmin, user.id);
    if (!userCredits) {
      return NextResponse.json(
        { error: 'Failed to initialize credits' },
        { status: 500 }
      );
    }

    // Check if user has enough credits
    const creditsRemaining = hasUnlimitedCredits
      ? Number.MAX_SAFE_INTEGER
      : calculateRemainingCredits(userCredits.credits_total, userCredits.credits_used);
    
    if (!hasUnlimitedCredits && creditsRemaining < creditCost) {
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

    // Atomically reserve credits BEFORE generation to prevent the
    // TOCTOU race documented in issue #477.
    if (!hasUnlimitedCredits) {
      const reserved = await reserveCredits(
        supabaseAdmin,
        user.id,
        userCredits.credits_used,
        creditCost
      );
      invalidateUserCredits(user.id);
      if (!reserved) {
        return NextResponse.json(
          creditReservationConflictResponse(creditCost, userCredits.tier),
          { status: 402 }
        );
      }
    }

    if (hasUnlimitedCredits) {
      logDeveloperCreditBypass({ userId: user.id, email: user.email, action: 'diagram' });
    }

    // console.log(`📊 Generating ${diagramType} diagram with Mistral...`);

    let diagram;
    try {
      diagram = await generateDiagramWithMistral({ prompt, diagramType });
    } catch (genError) {
      logger.error({ route: 'app/api/generate/diagram/route.ts' }, 'Diagram generation failed:', genError);
      if (!hasUnlimitedCredits) {
        await refundCredits(supabaseAdmin, user.id, creditCost);
        invalidateUserCredits(user.id);
      }
      const errorMsg = genError instanceof Error ? genError.message : 'Unknown error during generation';
      return NextResponse.json(
        {
          error: 'Diagram generation failed',
          message: errorMsg.includes('parse') ? 'Invalid response format from AI. Please try again with a different description.' : errorMsg,
          details: errorMsg,
          hint: 'Try being more specific in your description or use shorter text for labels.'
        },
        { status: 500 }
      );
    }

    // Validate diagram response
    if (!diagram || !diagram.code) {
      logger.error({ route: 'app/api/generate/diagram/route.ts' }, 'Invalid diagram response:', diagram);
      if (!hasUnlimitedCredits) {
        await refundCredits(supabaseAdmin, user.id, creditCost);
        invalidateUserCredits(user.id);
      }
      return NextResponse.json(
        {
          error: 'Invalid diagram response',
          message: 'The AI did not generate valid diagram code. Please try again with a simpler description.',
          details: 'Missing code field in response',
          hint: 'Try: "Simple flowchart with 5 steps for user login process"'
        },
        { status: 500 }
      );
    }

    // Validate Mermaid syntax
    const diagramCode = diagram.code.trim();
    const validDiagramTypes = ['flowchart', 'graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitGraph', 'mindmap', 'timeline'];
    const hasValidStart = validDiagramTypes.some(type => diagramCode.toLowerCase().startsWith(type.toLowerCase()));

    if (!hasValidStart) {
      logger.error({ route: 'app/api/generate/diagram/route.ts' }, 'Invalid diagram type in code:', diagramCode.substring(0, 50));
      if (!hasUnlimitedCredits) {
        await refundCredits(supabaseAdmin, user.id, creditCost);
        invalidateUserCredits(user.id);
      }
      return NextResponse.json(
        {
          error: 'Invalid diagram syntax',
          message: `Diagram must start with one of: ${validDiagramTypes.join(', ')}`,
          details: `Generated code starts with: ${diagramCode.substring(0, 30)}...`,
          hint: 'Regenerate or manually edit to start with a valid diagram type.'
        },
        { status: 422 }
      );
    }

    // Basic syntax validation
    if (diagramCode.length < 10) {
      if (!hasUnlimitedCredits) {
        await refundCredits(supabaseAdmin, user.id, creditCost);
        invalidateUserCredits(user.id);
      }
      return NextResponse.json(
        {
          error: 'Diagram too short',
          message: 'Generated diagram is too simple. Please provide a more detailed description.',
          hint: 'Try a more detailed prompt, for example: "Create a flowchart for an ecommerce checkout process"'
        },
        { status: 422 }
      );
    }

    // console.log('✅ Diagram generated successfully with Mistral');

    // Fire-and-forget: log write does not block the response
    if (!hasUnlimitedCredits) {
      supabaseAdmin
        .from('credit_usage_log')
        .insert({ user_id: user.id, action_type: 'diagram', credits_used: creditCost, metadata: { diagram_type: diagramType, prompt_length: prompt.length } })
        .then(({ error }) => { if (error) console.error('Failed to log credit usage:', error); });
    }

    return NextResponse.json(diagram);
  } catch (error) {
    logger.error({ route: 'app/api/generate/diagram/route.ts' }, 'Error generating diagram:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to generate diagram',
        message: 'An unexpected error occurred. Please try again.',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
