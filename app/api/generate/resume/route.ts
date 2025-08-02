export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateResume } from '@/lib/gemini';
import { validateAndSanitize, resumeGenerationSchema, detectSqlInjection, sanitizeInput } from '@/lib/validation';
import { createRoute } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = createRoute();
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rawBody = await request.json();

    // Validate and sanitize input
    const { prompt, name, email } = validateAndSanitize(resumeGenerationSchema, rawBody);

    // Additional security checks
    if (detectSqlInjection(prompt) || detectSqlInjection(name) || detectSqlInjection(email)) {
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedPrompt = sanitizeInput(prompt);
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);

    const resume = await generateResume({ 
      prompt: sanitizedPrompt, 
      name: sanitizedName, 
      email: sanitizedEmail 
    });
    
    return NextResponse.json(resume);
  } catch (error: any) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate resume' },
      { status: 500 }
    );
  }
}