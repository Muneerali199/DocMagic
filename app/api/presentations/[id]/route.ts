export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRoute();
    const { id } = params;

    // Get the presentation
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('type', 'presentation')
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      );
    }

    // Check if presentation is public or if user owns it
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user && user.id === data.user_id;
    const isPublic = data.content?.isPublic;

    if (!isPublic && !isOwner) {
      return NextResponse.json(
        { error: 'Presentation is private' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      slides: data.content.slides,
      template: data.content.template,
      prompt: data.prompt,
      isPublic: data.content.isPublic,
      createdAt: data.created_at,
      isOwner
    });
  } catch (error) {
    console.error('Error fetching presentation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRoute();
    const { id } = params;
    const body = await request.json();
    const { isPublic } = body;

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current content and update privacy setting
    const { data: currentDoc, error: fetchError } = await supabase
      .from('documents')
      .select('content')
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('type', 'presentation')
      .single();

    if (fetchError || !currentDoc) {
      return NextResponse.json(
        { error: 'Presentation not found' },
        { status: 404 }
      );
    }

    const updatedContent = {
      ...currentDoc.content,
      isPublic
    };

    // Update the presentation privacy setting
    const { data, error } = await supabase
      .from('documents')
      .update({
        content: updatedContent
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('type', 'presentation')
      .select()
      .single();

    if (error) {
      console.error('Error updating presentation:', error);
      return NextResponse.json(
        { error: 'Failed to update presentation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in presentation update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}