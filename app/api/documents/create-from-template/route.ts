import { NextRequest, NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRoute();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { templateId, type, title } = body;

    if (!templateId || !type) {
      return NextResponse.json(
        { error: 'Template ID and type are required' },
        { status: 400 }
      );
    }

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Create a new document from the template
    const { data: newDocument, error: createError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title: title || `${template.title} - Copy`,
        type: type,
        content: template.content,
        template_id: templateId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating document:', createError);
      return NextResponse.json(
        { error: 'Failed to create document' },
        { status: 500 }
      );
    }

    return NextResponse.json(newDocument);

  } catch (error) {
    console.error('Error in POST /api/documents/create-from-template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
