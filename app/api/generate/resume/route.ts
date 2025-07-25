// app/api/generate/resume/route.ts (example modification)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { generateResume } from '@/lib/gemini'; // Assuming this is your gemini call
import { createRoute } from '@/lib/supabase/server'; // Import your Supabase server client

export async function POST(request: Request) {
  try {
    const supabase = createRoute();
    const body = await request.json();
    const { prompt, name, email } = body; // Your existing request body parameters

    if (!prompt || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // --- Your existing document generation logic ---
    const resume = await generateResume({ prompt, name, email });
    // --- End existing logic ---

    // --- NEW: Update contributor stats for the current user ---
    const { data: userSessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting user session for stats update:', sessionError);
      // Continue without updating stats if session fails, but log it.
    } else if (userSessionData.session) {
      const userId = userSessionData.session.user.id;
      
      // First, get the current count
      const { data: userData, error: fetchUserError } = await supabase
        .from('users')
        .select('total_documents_generated')
        .eq('id', userId)
        .single();

      if (fetchUserError) {
        console.error('Error fetching current document count for user:', fetchUserError);
      } else {
        const currentCount = userData?.total_documents_generated || 0;
        
        const { error: updateError } = await supabase
          .from('users') // Target the users table
          .update({ 
            total_documents_generated: currentCount + 1, // Increment the count
            last_activity_at: new Date().toISOString() // Update last activity
            // The 'is_new_contributor' status will be handled by the database trigger
          })
          .eq('id', userId); // For the current user

        if (updateError) {
          console.error('Failed to update user document count:', updateError);
          // Log the error but don't prevent the document from being returned
        }
      }
    }
    // --- END NEW ---

    return NextResponse.json(resume); // Return the generated document
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}