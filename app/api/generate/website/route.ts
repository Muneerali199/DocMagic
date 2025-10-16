export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateWebsite } from '@/lib/website-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style = 'modern', pages = ['home'], includeAnimations = true } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' },
        { status: 400 }
      );
    }

    // Generate website code using AI
    const websiteCode = await generateWebsite({
      prompt,
      style,
      pages,
      includeAnimations
    });

    return NextResponse.json({
      success: true,
      ...websiteCode
    });
  } catch (error) {
    console.error('Error generating website:', error);
    return NextResponse.json(
      { error: 'Failed to generate website' },
      { status: 500 }
    );
  }
}
