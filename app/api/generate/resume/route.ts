export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { resumeGenerationSchema, detectSqlInjection, sanitizeObject, safeParseBody, RequestValidationError } from '@/lib/validation';
import { createClient } from '@supabase/supabase-js';
import { ACTION_COSTS, calculateRemainingCredits } from '@/lib/credits-service';
import { hasUnlimitedDeveloperCredits, logDeveloperCreditBypass } from '@/lib/developer-credit-bypass';
import { reserveCredits, refundCredits, creditReservationConflictResponse } from '@/lib/credit-operations';
import { logSecurityEvent, checkRateLimit, SECURITY_CONFIG } from '@/lib/security';
import { getCachedUserCredits, invalidateUserCredits } from '@/lib/cached-queries';

import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { incrementRequestCount, incrementErrorCount } from '@/app/api/metrics/route';
import { generateResume } from '@/lib/gemini';
import { withErrorHandling } from '@/lib/error-handler';

// Service role client for credit operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mistral-based resume generation as fallback
async function generateResumeWithMistral({ prompt, name, email }: { prompt: string; name: string; email: string }) {
  const systemPrompt = `You are an expert ATS-optimized resume writer. Create a professional resume based on this requirement: "${prompt}".

The candidate's name is: ${name}
The candidate's email is: ${email}

Return ONLY valid JSON with this exact structure:
{
  "name": "${name}",
  "email": "${email}",
  "phone": "+1 (555) 123-4567",
  "location": "City, State",
  "summary": "Professional summary with 3-4 sentences highlighting key expertise and achievements",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "date": "01/2020 - Present",
      "description": ["• Achievement with quantified impact", "• Another achievement"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "location": "City, State",
      "date": "05/2020"
    }
  ],
  "skills": {
    "technical": ["Skill1", "Skill2", "Skill3"],
    "soft": ["Communication", "Leadership", "Problem Solving"]
  },
  "projects": [],
  "certifications": []
}

Create realistic, relevant content based on the job description. Use action verbs and quantifiable achievements.`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Scoped logger will handle context
    throw new Error(`Mistral API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse JSON from response
  const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No JSON found in Mistral response');
  }

  return JSON.parse(jsonMatch[0]);
}

async function postHandler(request: Request) {
  const requestId = getRequestId(request.headers);
  const log = logger.withContext({ requestId });
  incrementRequestCount();

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

    // Custom fetch with timeout
    const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    // Create Supabase client with the access token and custom fetch
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          },
          fetch: customFetch
        }
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      log.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Apply Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(user.id, SECURITY_CONFIG.RATE_LIMITS.GENERATE);
    
    if (!rateLimit.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED_RESUME', { userId: user.id, ip }, ip);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `Please wait ${rateLimit.retryAfter} seconds before trying again.`,
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimit.retryAfter.toString() }
        }
      );
    }
    const hasUnlimitedCredits = hasUnlimitedDeveloperCredits(user.email);

    // Check user credits
    const creditCost = ACTION_COSTS.resume;

    // Get or create user credits (cached, 15 s TTL)
    const userCredits = await getCachedUserCredits(supabaseAdmin, user.id);
    if (!userCredits) {
      log.error('Failed to load or initialize credits record');
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
          message: `You need ${creditCost} credits to generate a resume. You have ${creditsRemaining} credits remaining.`,
          needsUpgrade: true,
          currentTier: userCredits.tier,
          creditsRemaining
        },
        { status: 402 }
      );
    }

    let prompt, name, email;
    try {
      const validatedData = await safeParseBody(request, resumeGenerationSchema);
      prompt = validatedData.prompt;
      name = validatedData.name;
      email = validatedData.email;
    } catch (validationError) {
      if (!(validationError instanceof RequestValidationError)) {
        throw validationError;
      }
      return NextResponse.json(
        { error: validationError.message, details: validationError.details },
        { status: 400 }
      );
    }


    // Additional security checks - only check name and email for SQL injection
    // Note: We don't check prompt because it contains user-generated content like LinkedIn exports
    // that naturally contain words like "SELECT candidates" which trigger false positives.
    // The prompt is only passed to the AI model, not used in SQL queries.
    if (detectSqlInjection(name) || detectSqlInjection(email)) {
      log.warn('Potential SQL injection attempt detected in name/email');
      return NextResponse.json(
        { error: 'Invalid input detected' },
        { status: 400 }
      );
    }

    // Sanitize all inputs consistently
    const sanitizedInput = sanitizeObject({ prompt, name, email });
    const { 
      prompt: sanitizedPrompt, 
      name: sanitizedName, 
      email: sanitizedEmail 
    } = sanitizedInput;

    if (hasUnlimitedCredits) {
      logDeveloperCreditBypass({ userId: user.id, email: user.email, action: 'resume' });
    }

    // Atomically reserve credits BEFORE generation to prevent the
    // TOCTOU race documented in issue #477. If a concurrent request beat
    // us to the row, the optimistic-lock update returns no row and we
    // respond 402 so the client can refresh and see real balance.
    if (!hasUnlimitedCredits) {
      const reserved = await reserveCredits(
        supabaseAdmin,
        user.id,
        userCredits!.credits_used,
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

    // Generate resume - Try Gemini 2.0 Flash first (Enhanced ATS), fallback to Mistral
    let resume;
    try {
      log.info('🚀 Generating resume with Gemini 2.0 Flash (Enhanced ATS)...');
      
      // Use a race to ensure Gemini doesn't hang the request
      const geminiPromise = generateResume({
        prompt: sanitizedPrompt,
        name: sanitizedName,
        email: sanitizedEmail
      });

      // 25-second timeout for Gemini specifically (within the 30s overall limit)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini request timed out')), 25000)
      );

      resume = await Promise.race([geminiPromise, timeoutPromise]) as any;
      log.info('✅ Resume generated with Gemini');
    } catch (geminiError: any) {
      log.warn('⚠️ Gemini failed or timed out, falling back to Mistral:', geminiError.message);
      try {
        log.info('🚀 Generating resume with Mistral fallback...');
        resume = await generateResumeWithMistral({
          prompt: sanitizedPrompt,
          name: sanitizedName,
          email: sanitizedEmail
        });
        log.info('✅ Resume generated with Mistral');
      } catch (mistralError: any) {
        log.error('❌ Both Gemini and Mistral failed');
        if (!hasUnlimitedCredits) {
          await refundCredits(supabaseAdmin, user.id, creditCost);
          invalidateUserCredits(user.id);
        }
        throw new Error('Unable to generate resume. Please try again later.');
      }
    }

    // Fire-and-forget: log write does not block the response
    if (!hasUnlimitedCredits) {
      supabaseAdmin
        .from('credit_usage_log')
        .insert({ user_id: user.id, action_type: 'resume', credits_used: creditCost, metadata: { prompt_length: sanitizedPrompt.length } })
        .then(({ error }) => { if (error) log.error('Failed to log credit usage:', error); });
    }

    // Save resume to documents table for history
    const resumeTitle = resume.name ? `${resume.name}'s Resume` : 'Untitled Resume';

    try {
      // First try to save to documents table
      const { data: savedDoc, error: docError } = await supabaseAdmin
        .from('documents')
        .insert({
          user_id: user.id,
          type: 'resume',
          title: resumeTitle,
          content: { resumeData: resume, prompt: sanitizedPrompt },
        })
        .select()
        .single();

      if (docError) {
        log.error('Failed to save to documents table:', docError);

        // Fallback: Try saving to resumes table
        const { error: resumeError } = await supabaseAdmin
          .from('resumes')
          .insert({
            user_id: user.id,
            title: resumeTitle,
            personal_info: {
              name: resume.name,
              email: resume.email,
              phone: resume.phone,
              location: resume.location,
            },
            content: resume,
            template: 'deedy-resume',
          });

        if (resumeError) {
          log.error('Failed to save to resumes table:', resumeError);
        } else {
          log.info('📄 Resume saved to resumes table');
        }
      } else {
        log.info('📄 Resume saved to documents table:', savedDoc?.id);
      }
    } catch (saveError) {
      log.error('Error saving resume:', saveError);
      // Don't fail the request if saving fails
    }

    return NextResponse.json(resume, { status: 200 });

  } catch (error: any) {
    incrementErrorCount();
    log.error('❌ Resume generation error:', {
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
    }
    // Re-throw so the global error handler captures request context and stack trace
    throw error;
  }
}

export const POST = withErrorHandling(postHandler);
