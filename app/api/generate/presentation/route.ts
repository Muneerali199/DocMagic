export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generatePresentation, generatePresentationOutline } from '@/lib/gemini';
import { createRoute } from '@/lib/supabase/server';
import { checkUsageLimit, trackUsage } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTHENTICATION CHECK
    const supabase = await createRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to create presentations.' },
        { status: 401 }
      );
    }

    // ✅ USAGE LIMIT CHECK
    const usageCheck = await checkUsageLimit(supabase, user.id, 'presentation');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { 
          error: usageCheck.message || 'Monthly limit reached. Please upgrade your plan.',
          limit: usageCheck.limit,
          current: usageCheck.current_usage
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { prompt, pageCount = 8, template } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Generate presentation outline first
    const outlines = await generatePresentationOutline({ prompt, pageCount });

    // Generate full presentation with visuals
    const slides = await generatePresentation({ outlines, prompt, template });

    // ✅ TRACK USAGE
    // We'll track once the presentation is successfully saved
    // For now, track generation
    await trackUsage(supabase, user.id, 'presentation', 'generated', 'create');

    return NextResponse.json({
      slides,
      usage: {
        current: usageCheck.current_usage + 1,
        limit: usageCheck.limit,
        remaining: usageCheck.remaining - 1
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