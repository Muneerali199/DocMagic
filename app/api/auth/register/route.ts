import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';
import { sendWelcomeEmail } from "@/lib/email";
import { validateAndSanitize, registrationSchema, detectSqlInjection, sanitizeInput } from '@/lib/validation';

// This route handles user registration
export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // Validate and sanitize input
    const { name, email, password } = validateAndSanitize(registrationSchema, rawBody);

    // Additional security checks
    if (detectSqlInjection(name) || detectSqlInjection(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input detected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);

    const supabase = createRoute();

    // Sign up with Supabase Auth (no email confirmation required)
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          name: sanitizedName,
          email: sanitizedEmail
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);

      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'An account with this email already exists' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: error.message || 'Failed to create user' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Send welcome email (non-blocking)
    try {
      await sendWelcomeEmail(data.user.email || email, name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email sending fails
    }

    // Return success message
    return new Response(
      JSON.stringify({
        message: 'Registration successful! You can now sign in.',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: sanitizedName
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Unexpected error in registration:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Add route configuration
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';