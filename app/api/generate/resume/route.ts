export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const { NextResponse } = require('next/server');
import { generateResume } from '@/lib/gemini';
import { validateAndSanitize, resumeGenerationSchema, detectSqlInjection, sanitizeInput } from '@/lib/validation';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    // Create Supabase client with the access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Validate request body exists
    let rawBody;
    try {
      rawBody = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate and sanitize input
    let prompt, name, email;
    try {
      const validatedData = validateAndSanitize(resumeGenerationSchema, rawBody);
      prompt = validatedData.prompt;
      name = validatedData.name;
      email = validatedData.email;
    } catch (validationError: any) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationError.message },
        { status: 400 }
      );
    }

    // Additional security checks
    if (detectSqlInjection(prompt) || detectSqlInjection(name) || detectSqlInjection(email)) {
      console.warn('Potential SQL injection attempt detected');
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedPrompt = sanitizeInput(prompt);
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);

    // Generate resume
    const resume = await generateResume({ 
      prompt: sanitizedPrompt, 
      name: sanitizedName, 
      email: sanitizedEmail
    });
    
    return NextResponse.json(resume, { status: 200 });

  } catch (error: any) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate resume',
        message: error.message || 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}