import { NextResponse } from "next/server";
import { createRoute } from '@/lib/supabase/server';
import { sendWelcomeEmail } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  console.log("API: /api/auth/register - Request received"); // Log start of request
  try {
    const { name, email, password } = await request.json();
    console.log("API: /api/auth/register - Request body parsed:", { name, email, password: '***' }); // Log parsed data

    if (!name || !email || !password) {
      console.error("API: /api/auth/register - Missing required fields"); // Log validation error
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createRoute();
    console.log("API: /api/auth/register - Supabase client created"); // Log Supabase client creation

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
        console.error("API: /api/auth/register - Error checking existing user:", existingUserError);
        throw existingUserError; // Throw other types of errors
    }

    if (existingUser) {
      console.log("API: /api/auth/register - User already exists:", email); // Log existing user
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    console.log("API: /api/auth/register - Attempting Supabase auth.signUp"); // Log before signup call
    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          // --- IMPORTANT: Add initial contributor stats here for new users ---
          total_documents_generated: 0,
          total_features_suggested: 0,
          badges_earned: [], // Initialize as empty array
          is_new_contributor: true,
          last_activity_at: new Date().toISOString(),
          // --- END IMPORTANT ---
        }
      }
    });

    if (signUpError) {
      console.error("API: /api/auth/register - Supabase signUp error:", signUpError); // Log signup error
      throw signUpError; // Re-throw to be caught by the outer catch block
    }

    if (!data.user) {
      console.error("API: /api/auth/register - Supabase signUp returned no user data."); // Log no user data
      throw new Error('User creation failed: No user data returned from Supabase.');
    }

    console.log("API: /api/auth/register - User created successfully:", data.user.id); // Log successful creation

    // Send welcome email (non-blocking - we won't fail the signup if email sending fails)
    sendWelcomeEmail(data.user.email, name).catch((emailErr) => {
      console.error("API: /api/auth/register - Failed to send welcome email:", emailErr);
    });

    console.log("API: /api/auth/register - Sending success response"); // Log success response
    return NextResponse.json({
      id: data.user.id,
      name,
      email: data.user.email,
    });
  } catch (error: any) {
    console.error("API: /api/auth/register - Caught error:", error); // Log any caught error
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}