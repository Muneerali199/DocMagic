import { NextResponse } from "next/server";
import { createRoute } from '@/lib/supabase/server';
import { sendWelcomeEmail } from "@/lib/email";
import { isDevelopmentMode, mockUser, mockSession } from "@/lib/mock-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('User creation failed');
    }

    // Send welcome email (non-blocking - we won't fail the signup if email sending fails)
    sendWelcomeEmail(data.user.email, name).catch((emailErr) => {
      console.error("Failed to send welcome email:", emailErr);
    });

    return NextResponse.json({
      id: data.user.id,
      name,
      email: data.user.email,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}