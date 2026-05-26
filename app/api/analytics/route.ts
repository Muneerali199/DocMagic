import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's documents
    const { data: docs } = await supabase
      .from('documents')
      .select('id, title, type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!docs || docs.length === 0) {
      return NextResponse.json({
        total_documents: 0,
        total_views: 0,
        total_downloads: 0,
        documents: []
      });
    }

    const docIds = docs.map(d => d.id);
    
    const [viewsCount, downloadsCount] = await Promise.all([
      supabase.from('document_views')
        .select('*', { count: 'exact', head: true })
        .in('document_id', docIds),
      supabase.from('document_engagement')
        .select('*', { count: 'exact', head: true })
        .in('document_id', docIds)
        .eq('event_type', 'download')
    ]);

    const totalViews = viewsCount.count || 0;
    const totalDownloads = downloadsCount.count || 0;

    return NextResponse.json({
      total_documents: docs.length,
      total_views: totalViews,
      total_downloads: totalDownloads,
      documents: docs
    });
  } catch (error: any) {
    logger.error({ route: 'app/api/analytics/route.ts' }, 'Error in general analytics API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
