import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { suggestCorrection } from '@/lib/search-engine'
import { createRoute } from '@/lib/supabase/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createRoute()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') ?? ''
    const category = searchParams.get('category') ?? undefined
    const language = searchParams.get('language') ?? undefined
    const minQuality = Number(searchParams.get('minQuality') ?? 0)
    
    // Pagination parameters with bounds: page >= 1, limit clamped to 1..100
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))
    const offset = (page - 1) * limit

    if (!query.trim()) {
      return NextResponse.json({ results: [], suggestion: null, total: 0 })
    }

    // Call the PostgreSQL full-text search RPC function
    const { data: rpcResults, error: rpcError } = await supabase.rpc('search_user_content', {
      p_user_id: user.id,
      p_query: query,
      p_category: category,
      p_limit: limit,
      p_offset: offset
    });

    if (rpcError) {
      logger.error({ route: 'app/api/search/route.ts' }, 'RPC search_user_content error:', rpcError)
      return NextResponse.json(
        { error: 'Failed to search documents' },
        { status: 500 }
      )
    }

    // Map RPC results to expected format
    const results = (rpcResults || [])
      .filter((row: any) => row.quality_score >= minQuality)
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        language: 'en', // Database level doesn't map language yet
        qualityScore: row.quality_score,
        createdAt: row.created_at
      }));

    const total = rpcResults && rpcResults.length > 0 ? Number(rpcResults[0].total_count) : 0;

    let suggestion = null;
    
    if (total === 0 && query) {
       // Since we no longer load all texts into memory, we check if pg_trgm can find a close title
       const { data: similarTitles } = await supabase
        .from('documents')
        .select('title')
        .eq('user_id', user.id)
        .ilike('title', `%${query.substring(0, 3)}%`)
        .limit(5);
        
       if (similarTitles && similarTitles.length > 0) {
         suggestion = suggestCorrection(query, similarTitles.flatMap(t => t.title.split(/\s+/)));
       }
    }

    return NextResponse.json({
      results,
      suggestion,
      total,
      query,
    })
  } catch (error) {
    logger.error({ route: 'app/api/search/route.ts' }, 'Search error:', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}