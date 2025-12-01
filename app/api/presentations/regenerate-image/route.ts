export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { regenerateSlideImage } from '@/lib/flux-image-generator';
import { createRoute } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createRoute();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt, size = "1920x1080" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    console.log(`🔄 Regenerating image for: "${prompt}"`);

    // Generate new image with FLUX
    const imageUrl = await regenerateSlideImage(prompt, size);

    return NextResponse.json({
      imageUrl,
      success: true
    });
  } catch (error) {
    console.error('Error regenerating image:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate image' },
      { status: 500 }
    );
  }
}
