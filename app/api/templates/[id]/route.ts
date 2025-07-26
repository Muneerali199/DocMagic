import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server.js';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .or(`id.eq.${id},and(id.eq.${id},is_public.eq.true)`)
      .single();

    if (error) throw error;

    // Check if user has access to this template
    if (template.is_public || (user && template.user_id === user.id)) {
      return NextResponse.json(template);
    }

    // Check if template is shared with user
    if (user) {
      const { data: sharedTemplate } = await supabase
        .from('template_shares')
        .select('*')
        .eq('template_id', id)
        .eq('shared_with', user.id)
        .single();

      if (sharedTemplate) {
        return NextResponse.json(template);
      }
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Error fetching template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, description, content, isPublic } = await request.json();

    // Verify user owns the template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate || existingTemplate.user_id !== user.id) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const { data: template, error } = await supabase
      .from('templates')
      .update({
        title,
        description,
        content,
        is_public: isPublic,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify user owns the template and it's not a default template
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('user_id, is_default')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate || 
        existingTemplate.user_id !== user.id || 
        existingTemplate.is_default) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Delete related shares first
    await supabase
      .from('template_shares')
      .delete()
      .eq('template_id', id);

    // Delete the template
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
