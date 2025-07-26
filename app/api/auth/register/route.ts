import { NextResponse } from "next/server";
import { createRoute } from '@/lib/supabase/server';
import { sendWelcomeEmail } from "@/lib/email";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  console.log("API: /api/auth/register - Request received");

  try {
    const { name, email, password } = await request.json();
    console.log("API: /api/auth/register - Parsed request body:", { name, email, password: '***' });

    // Input validation
    if (!name || !email || !password) {
      console.error("API: /api/auth/register - Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cookieStore = cookies(); // in case createRoute depends on it internally
    const supabase = createRoute();
    console.log("API: /api/auth/register - Supabase client created");

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error("API: /api/auth/register - Error checking existing user:", existingUserError);
      throw new Error(`Error checking existing user: ${existingUserError.message || 'Unknown database error'}`);
    }

    if (existingUser) {
      console.log("API: /api/auth/register - User already exists:", email);
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    console.log("API: /api/auth/register - Calling supabase.auth.signUp");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          total_documents_generated: 0,
          total_features_suggested: 0,
          badges_earned: [],
          is_new_contributor: true,
          last_activity_at: new Date().toISOString()
        }
      }
    });

    if (signUpError) {
      console.error("API: /api/auth/register - Supabase signUp error:", signUpError);
      throw new Error(`Supabase signup failed: ${signUpError.message || 'Unknown error'}`);
    }

    if (!data.user) {
      console.error("API: /api/auth/register - No user returned from signUp");
      throw new Error("User creation failed: No user returned from Supabase");
    }

    console.log("API: /api/auth/register - User created:", data.user.id);

    sendWelcomeEmail(data.user.email, name).catch((emailErr) => {
      console.error("API: /api/auth/register - Failed to send welcome email:", emailErr);
    });

    return NextResponse.json({
      id: data.user.id,
      name,
      email: data.user.email
    });
  } catch (error: any) {
    if (error.message.includes("fetch failed") || error.cause?.message?.includes("fetch failed")) {
      console.error("API: /api/auth/register - Network error:", error);
      return NextResponse.json(
        { error: "Failed to connect to authentication service. Please check server configuration." },
        { status: 500 }
      );
    }

    console.error("API: /api/auth/register - Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
