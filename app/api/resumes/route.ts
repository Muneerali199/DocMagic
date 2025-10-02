export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const { NextResponse } = require('next/server');
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Get the Authorization token from the request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const body = await request.json();
    const { title, content, template, prompt, isPublic = true } = body;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save the resume to the database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Resume',
        type: 'resume',
        prompt: prompt || 'Resume generated',
        content: {
          resumeData: content,
          template,
          isPublic
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving resume:', error);
      return NextResponse.json(
        { error: 'Failed to save resume' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      id: data.id,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://doc-magic-heob.vercel.app'}/resume/view/${data.id}`
    });
  } catch (error) {
    console.error('Error in resumes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
