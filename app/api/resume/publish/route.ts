import { NextResponse } from 'next/server';
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

    // Create Supabase client with auth token
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
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subdomain, resumeData, isCV } = body;

    if (!subdomain || !resumeData) {
      return NextResponse.json(
        { error: "Subdomain and resume data are required" },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: "Invalid subdomain format" },
        { status: 400 }
      );
    }

    // Check if subdomain is already taken
    const { data: existing, error: checkError } = await supabase
      .from("published_resumes")
      .select("id, user_id")
      .eq("subdomain", subdomain)
      .maybeSingle();

    if (checkError) {
      console.error("Database check error:", checkError);
      
      // Check if table doesn't exist
      if (checkError.message?.includes('relation') || checkError.code === '42P01') {
        return NextResponse.json(
          { 
            error: "Database table not found. Please run the SQL schema in Supabase first.",
            details: "See RESUME_HOSTING_SETUP.md for instructions"
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "Database error", details: checkError.message },
        { status: 500 }
      );
    }

    if (existing && existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Subdomain already taken. Please choose a different one." },
        { status: 409 }
      );
    }

    // Upsert the published resume
    // If the user already has a resume with this subdomain, update it
    // Otherwise, insert a new one
    const { data, error } = await supabase
      .from("published_resumes")
      .upsert({
        user_id: user.id,
        subdomain,
        resume_data: resumeData,
        is_cv: isCV,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'subdomain',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error("Database upsert error:", error);
      return NextResponse.json(
        { 
          error: "Failed to publish resume",
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Get the base URL from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    return NextResponse.json({
      success: true,
      data: {
        subdomain,
        url: `${baseUrl}/r/${subdomain}`,
      },
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get published resume by subdomain (public access)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    // Create Supabase client for public access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from("published_resumes")
      .select("resume_data, is_cv, updated_at")
      .eq("subdomain", subdomain)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
