import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyticsService } from '@/lib/analytics-service';

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';
    
    let days = 30;
    if (range === '7d') days = 7;
    else if (range === '90d') days = 90;
    else if (range === 'all') days = 365;

    // Get the Authorization token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
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

    // Verify user owns the document
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }

    const summary = await analyticsService.getAnalyticsSummary(supabase, documentId, days);
    
    if (!summary) {
      return NextResponse.json({ error: 'Failed to fetch analytics summary' }, { status: 500 });
    }

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error in per-document analytics API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
