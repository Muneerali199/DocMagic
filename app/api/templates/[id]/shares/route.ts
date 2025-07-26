import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
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

    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (templateError || !template || template.user_id !== user.id) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Get all shares for this template
    const { data: shares, error } = await supabase
      .from('template_shares')
      .select('*, users:shared_with(email, name)')
      .eq('template_id', id);

    if (error) throw error;

    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error fetching template shares:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
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

    const { email, canEdit } = await request.json();

    // Check if user owns the template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (templateError || !template || template.user_id !== user.id) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Find user to share with
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !targetUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Don't share with self
    if (targetUser.id === user.id) {
      return new NextResponse('Cannot share with yourself', { status: 400 });
    }

    // Check if already shared
    const { data: existingShare, error: shareCheckError } = await supabase
      .from('template_shares')
      .select('id')
      .eq('template_id', id)
      .eq('shared_with', targetUser.id)
      .maybeSingle();

    if (shareCheckError) throw shareCheckError;
    if (existingShare) {
      return new NextResponse('Template already shared with this user', { status: 400 });
    }

    // Create share
    const { data: share, error } = await supabase
      .from('template_shares')
      .insert([
        {
          template_id: id,
          shared_by: user.id,
          shared_with: targetUser.id,
          can_edit: canEdit || false
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Error sharing template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
