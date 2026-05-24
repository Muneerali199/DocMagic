import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';
import { sendVerificationEmail } from "@/lib/email";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { validateAndSanitize, registrationSchema, detectSqlInjection, sanitizeInput } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // 1. Extract utmData from the body
    const { name, email, password, referralCode, utmData } = rawBody;

    // Validate and sanitize input
    const validated = validateAndSanitize(registrationSchema, { name, email, password });
    const sanitizedName = sanitizeInput(validated.name);
    const sanitizedEmail = sanitizeInput(validated.email);
    const sanitizedReferralCode = referralCode ? String(referralCode).toUpperCase().trim() : null;

    // Additional security checks
    if (detectSqlInjection(sanitizedName) || detectSqlInjection(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input detected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = await createRoute();

    const origin = (() => {
      try {
        const url = new URL((request as any).url);
        return url.origin;
      } catch {
        return process.env.NEXT_PUBLIC_SITE_URL || '';
      }
    })();

    const finalRedirectUrl = origin ? `${origin}/auth/callback`.replace(/\/$/, '') : undefined;

    // 2. Inject utmData into the Supabase user metadata
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: validated.password,
      options: {
        emailRedirectTo: finalRedirectUrl,
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          referral_code: sanitizedReferralCode,
          ...utmData, // <-- This saves the marketing tags permanently to the DB
        }
      }
    });

    if (error) {
      logger.error({ route: 'app/api/auth/register/route.ts' }, 'Signup error:', error);
      
      // Handle existing user error gracefully
      if (error.status === 422 || error.message.includes('User already registered')) {
        return new Response(
          JSON.stringify({ error: 'User already exists. Please log in.' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requiresVerification = !data.session;
    return new Response(
      JSON.stringify({ message: 'Registration successful!', requiresVerification }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    logger.error({ route: 'app/api/auth/register/route.ts' }, 'Unexpected error in registration:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';