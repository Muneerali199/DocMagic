import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; shareId: string } }
) {
  const { id, shareId } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the share to verify ownership
    const { data: share, error: shareError } = await supabase
      .from('template_shares')
      .select('*, templates(user_id)')
      .eq('id', shareId)
      .single();

    if (shareError || !share) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Check if user is the template owner or the share recipient
    if (share.templates.user_id !== user.id && share.shared_with !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Delete the share
    const { error } = await supabase
      .from('template_shares')
      .delete()
      .eq('id', shareId);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting template share:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; shareId: string } }
) {
  const { id, shareId } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { canEdit } = await request.json();

    // Get the share to verify ownership
    const { data: share, error: shareError } = await supabase
      .from('template_shares')
      .select('*, templates(user_id)')
      .eq('id', shareId)
      .single();

    if (shareError || !share) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Only template owner can modify share permissions
    if (share.templates.user_id !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Update the share
    const { data: updatedShare, error } = await supabase
      .from('template_shares')
      .update({ can_edit: canEdit })
      .eq('id', shareId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedShare);
  } catch (error) {
    console.error('Error updating template share:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
