export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createRoute();
    const body = await request.json();
    const { title, slides, template, prompt, isPublic = false } = body;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save the presentation to the database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Presentation',
        type: 'presentation',
        content: {
          slides,
          template,
          isPublic
        },
        prompt
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving presentation:', error);
      return NextResponse.json(
        { error: 'Failed to save presentation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      id: data.id,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://doc-magic-heob.vercel.app'}/presentation/view/${data.id}`
    });
  } catch (error) {
    console.error('Error in presentations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}