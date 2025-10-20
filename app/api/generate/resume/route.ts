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
    console.error('❌ Resume generation error:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    
    // Provide detailed, user-friendly error messages
    let errorMessage = 'Failed to generate resume';
    let errorDetails = error.message || 'Unknown error occurred';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'AI service configuration error';
      errorDetails = 'The AI service is not properly configured. Please contact support.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Service temporarily unavailable';
      errorDetails = 'The AI service has reached its limit. Please try again in a few minutes.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout';
      errorDetails = 'The request took too long. Please try again with a shorter prompt.';
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'AI response parsing error';
      errorDetails = 'The AI generated an invalid response. Please try rephrasing your input.';
    } else if (error.message?.includes('network')) {
      errorMessage = 'Network error';
      errorDetails = 'Unable to connect to AI service. Please check your internet connection.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorDetails,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}