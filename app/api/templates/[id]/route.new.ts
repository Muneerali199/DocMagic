import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  request: Request,
  { params }: Params
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // First, try to get the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError || !template) {
      return new NextResponse('Template not found', { status: 404 });
    }

    // Check if template is public
    if (template.is_public) {
      return NextResponse.json(template);
    }

    // Check if user is the owner
    if (user && template.user_id === user.id) {
      return NextResponse.json(template);
    }

    // Check if template is shared with user
    if (user) {
      const { data: sharedTemplate, error: shareError } = await supabase
        .from('template_shares')
        .select('*')
        .eq('template_id', id)
        .eq('shared_with', user.id)
        .single();

      if (!shareError && sharedTemplate) {
        return NextResponse.json(template);
      }
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Error fetching template:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch template' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: Params
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { title, description, content, isPublic } = body;

    // Verify user owns the template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('user_id, is_default')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate || existingTemplate.user_id !== user.id) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Prevent updating default templates
    if (existingTemplate.is_default) {
      return new NextResponse(
        JSON.stringify({ error: 'Cannot update default templates' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data
    const updateData: {
      title?: string;
      description?: string | null;
      content?: any;
      is_public?: boolean;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (isPublic !== undefined) updateData.is_public = Boolean(isPublic);

    // Update the template
    const { data: template, error: updateError } = await supabase
      .from('templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update template' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify user owns the template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('user_id, is_default')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate || existingTemplate.user_id !== user.id) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Prevent deleting default templates
    if (existingTemplate.is_default) {
      return new NextResponse(
        JSON.stringify({ error: 'Cannot delete default templates' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete the template
    const { error: deleteError } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Delete any shares associated with this template
    await supabase
      .from('template_shares')
      .delete()
      .eq('template_id', id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting template:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to delete template' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
