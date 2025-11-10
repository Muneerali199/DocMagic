import { NextRequest, NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRoute();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check if user has access (owner or shared with them)
    if (document.user_id !== user.id) {
      const { data: permission } = await supabase
        .from('share_permissions')
        .select('*')
        .eq('document_id', params.id)
        .eq('shared_with', user.id)
        .single();

      if (!permission) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(document);

  } catch (error) {
    console.error('Error in GET /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRoute();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, type, title } = body;

    // Check if user has edit permission
    const { data: document } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.user_id !== user.id) {
      const { data: permission } = await supabase
        .from('share_permissions')
        .select('permission_level')
        .eq('document_id', params.id)
        .eq('shared_with', user.id)
        .single();

      if (!permission || permission.permission_level === 'view') {
        return NextResponse.json(
          { error: 'Edit permission required' },
          { status: 403 }
        );
      }
    }

    // Update document
    const { data: updatedDocument, error: updateError } = await supabase
      .from('documents')
      .update({
        content,
        type,
        title,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating document:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedDocument);

  } catch (error) {
    console.error('Error in PUT /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRoute();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is the owner
    const { data: document } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (document.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the owner can delete this document' },
        { status: 403 }
      );
    }

    // Delete document
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting document:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
