import { NextResponse } from 'next/server';
import { generateWebsite, improveWebsite } from '@/lib/website-generator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      prompt, 
      style = 'modern', 
      pages = ['home'], 
      includeAnimations = true,
      templateId,
      // For iterative improvements
      isImprovement = false,
      currentCode,
      improvementRequest
    } = body;

    if (!prompt && !improvementRequest) {
      return NextResponse.json(
        { error: 'Missing prompt or improvement request' },
        { status: 400 }
      );
    }

    // Handle iterative improvements
    if (isImprovement && currentCode && improvementRequest) {
      const improvedCode = await improveWebsite({
        currentCode,
        improvementRequest,
        style
      });

      return NextResponse.json({
        success: true,
        ...improvedCode
      });
    }

    // Generate new website code using AI
    const websiteCode = await generateWebsite({
      prompt,
      style,
      pages,
      includeAnimations,
      templateId
    });

    // Save to database
    try {
      const { createRoute } = await import('@/lib/supabase/server');
      const supabase = await createRoute();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('websites').insert({
          user_id: user.id,
          title: prompt.substring(0, 100),
          style,
          html: websiteCode.html,
          css: websiteCode.css,
          javascript: websiteCode.javascript,
          assets: websiteCode.assets
        });
      }
    } catch (dbError) {
      console.error('Error saving website to database:', dbError);
      // Don't fail the request if database save fails
    }

    return NextResponse.json({
      success: true,
      ...websiteCode
    });
  } catch (error) {
    console.error('Error generating website:', error);
    return NextResponse.json(
      { error: 'Failed to generate website. Please try again.' },
      { status: 500 }
    );
  }
}
