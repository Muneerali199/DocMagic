import { NextResponse } from "next/server";
import { createRoute } from '@/lib/supabase/server'; // Assumes this uses 'cookies()' internally
import { sendWelcomeEmail } from "@/lib/email";

// Import cookies from next/headers
import { cookies } from 'next/headers'; // <--- ADD THIS IMPORT

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

    // --- IMPORTANT: Pass the awaited cookies() instance to createRoute() ---
    // Assuming createRoute needs access to cookies to initialize the Supabase client
    // for server-side operations (like getting auth tokens from request cookies).
    // If createRoute doesn't explicitly need cookies for its initial setup,
    // but the Supabase client returned by it will use cookies later, then the fix
    // for `cookies().get()` inside `createRoute` (or any related auth helper) is needed.
    // However, given the error, it's highly likely `createRoute` or a function it calls
    // implicitly accesses cookies.
    const cookieStore = cookies(); // Await the cookies() function
    const supabase = createRoute(); // Call createRoute with no arguments
    // If createRoute doesn't take 'cookies' as an arg, it implies it calls `cookies()` internally.
    // In that case, ensure your `createRoute` function also `await`s `cookies()`.
    // Example: export function createRoute() { return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, { cookies: () => cookies() }); }
    // If your createRoute is already set up like the example above, then you don't need to change createRoute();
    // The previous error trace implies the problem is deeper in how `createRoute` interacts with `cookies()`.
    // Let's assume for now that `createRoute` itself needs to correctly await `cookies()`.
    // If createRoute handles `cookies()` internally, then the fix will be within `createRoute`.

    console.log("API: /api/auth/register - Supabase client created"); // Log Supabase client creation

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') { // PGRST116 is 'no rows found'
      console.error("API: /api/auth/register - Error checking existing user:", existingUserError);
      // Ensure the message from the backend is relayed if helpful, otherwise a generic one.
      throw new Error(`Error checking existing user: ${existingUserError.message || 'Unknown database error'}`);
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
          total_documents_generated: 0,
          total_features_suggested: 0,
          badges_earned: [], // Initialize as empty array
          is_new_contributor: true,
          last_activity_at: new Date().toISOString(),
        }
      }
    });

    if (signUpError) {
      console.error("API: /api/auth/register - Supabase signUp error:", signUpError); // Log signup error
      // Throw a new error with a clearer message if needed for the catch block
      throw new Error(`Supabase signup failed: ${signUpError.message || 'Unknown error'}`);
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
    // Check if the error is due to fetch failing (often due to misconfigured Supabase URL)
    if (error.message.includes('fetch failed') || error.cause?.message?.includes('fetch failed')) {
      console.error("API: /api/auth/register - Network error to Supabase:", error);
      return NextResponse.json(
        { error: "Failed to connect to authentication service. Please check server configuration." },
        { status: 500 }
      );
    }
    console.error("API: /api/auth/register - Caught error:", error); // Log any caught error
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

// --- IMPORTANT NOTE ABOUT `createRoute` and `cookies()` ---
// The error message `cookies() should be awaited before using its value`
// indicates that somewhere in your `createRoute` function, or within the
// Supabase client initialization it's doing, `cookies().get()` is being called
// synchronously.

// Make sure your `createRoute` function (in `lib/supabase/server.ts`)
// looks something like this if it uses `cookies()`:

// lib/supabase/server.ts (example structure)
/*
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createRoute() {
  const cookieStore = cookies(); // Await is not needed here, as `cookies()` directly returns the object in server contexts
                               // but it's crucial that methods on `cookieStore` are called correctly.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!, // Use SUPABASE_SECRET_KEY for server-side, NOT anon key for server-to-server calls
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `cookies().set()` method can throw if called from a Server Component
            // that is not part of a Server Action or Route Handler.
            // This is generally fine if you're only reading in Server Components.
            console.error('Error setting cookie:', error);
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, '', options); // Supabase-js uses set with empty value to remove
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}
*/