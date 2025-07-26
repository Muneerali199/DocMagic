import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase/server';
import { sendWelcomeEmail } from "@/lib/email";
import { isDevelopmentMode, mockUser, mockSession } from "@/lib/mock-auth";

// This route handles user registration
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

 feature/analytics-complete-final
    // In development mode, return mock success
    if (isDevelopmentMode()) {
      console.log('Development mode: Mock user registration for', email);
      
      // Simulate successful registration
      return NextResponse.json({
        message: "User registered successfully (development mode)",
        user: mockUser,
        session: mockSession
      });
    }

    // Production mode: Use real Supabase
    const supabase = await createRoute();

    const supabase = createServer();


    // Check if user already exists
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error checking user:', userError);
      return new Response(
        JSON.stringify({ error: 'Error checking user existence' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (user) {
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          email
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
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

    return new Response(
      JSON.stringify({
        id: data.user.id,
        name,
        email: data.user.email,
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