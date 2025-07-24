import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      rating, 
      category, 
      message, 
      email, 
      name, 
      documentType, 
      documentId, 
      timestamp 
    } = body;

    // Validate required fields
    if (!rating || !message?.trim()) {
      return NextResponse.json(
        { error: 'Rating and message are required' },
        { status: 400 }
      );
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Invalid rating value' },
        { status: 400 }
      );
    }

    // Log the feedback for debugging
    console.log('📝 Feedback Submitted:', {
      rating: ratingNum,
      category: category || 'general',
      message: message.trim(),
      email: email || 'anonymous',
      documentType: documentType || 'unknown',
      documentId: documentId || 'none',
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 'unknown'
    });

    // Store feedback in Supabase database
    const supabase = createRoute();
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        rating: ratingNum,
        category: category || 'general',
        message: message.trim(),
        email: email || null,
        document_type: documentType || 'unknown',
        document_id: documentId || null,
        user_agent: request.headers.get('user-agent') || null,
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || null,
        created_at: timestamp || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: data.id,
        timestamp: data.created_at
      }
    });

  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve feedback (for admin purposes)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('documentType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Retrieve feedback from Supabase database
    const supabase = createRoute();
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (documentType) {
      query = query.eq('document_type', documentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve feedback from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });

  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 