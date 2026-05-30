import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server'
import { searchDocuments, suggestCorrection } from '@/lib/search-engine'
import type { SearchableDocument } from '@/lib/search-engine'
import { createRoute } from '@/lib/supabase/server'

// Recursive helper to extract all nested string contents from JSON fields
function extractTextFromContent(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content
  if (typeof content === 'number' || typeof content === 'boolean') return String(content)

  const texts: string[] = []

  if (Array.isArray(content)) {
    for (const item of content) {
      texts.push(extractTextFromContent(item))
    }
    return texts.join(' ')
  }

  if (typeof content === 'object') {
    for (const key in content) {
      const val = content[key]
      if (typeof val === 'string') {
        texts.push(val)
      } else if (Array.isArray(val) || typeof val === 'object') {
        texts.push(extractTextFromContent(val))
      }
    }
    return texts.join(' ')
  }

  return ''
}

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

    const allMappedDocs: SearchableDocument[] = []

    // 1. Fetch user documents from 'documents' table if category is not 'template'
    if (category !== 'template') {
      let docQuery = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)

      // Filter by type if a specific category is requested
      if (category === 'resume') {
        docQuery = docQuery.or('type.eq.resume,type.eq.cv')
      } else if (category) {
        docQuery = docQuery.eq('type', category)
      }

      const { data: documents, error: docError } = await docQuery
      if (docError) {
        logger.error({ route: 'app/api/search/route.ts' }, 'Error fetching documents:', docError)
        return NextResponse.json(
          { error: 'Failed to fetch user documents' },
          { status: 500 }
        )
      }

      if (documents) {
        for (const doc of documents) {
          // Normalize type to category
          let mappedCategory: 'resume' | 'presentation' | 'template' | 'letter' = 'resume'
          if (doc.type === 'presentation') mappedCategory = 'presentation'
          else if (doc.type === 'letter') mappedCategory = 'letter'
          else if (doc.type !== 'resume' && doc.type !== 'cv') {
            logger.warn({ route: 'app/api/search/route.ts', docType: doc.type }, 'Unknown document type, defaulting to resume')
          }

          const textContent = extractTextFromContent(doc.content)
          
          let score = 80
          if (doc.content && typeof doc.content === 'object' && 'atsScore' in doc.content) {
            score = Number(doc.content.atsScore) || 80
          }

          allMappedDocs.push({
            id: doc.id,
            title: doc.title,
            content: textContent,
            category: mappedCategory,
            language: 'en',
            qualityScore: score,
            createdAt: doc.created_at || new Date().toISOString()
          })
        }
      }
    }

    // 2. Fetch user templates from 'templates' table if category is 'template' or undefined
    if (!category || category === 'template') {
      const { data: templates, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)

      if (templateError) {
        logger.error({ route: 'app/api/search/route.ts' }, 'Error fetching templates:', templateError)
        return NextResponse.json(
          { error: 'Failed to fetch user templates' },
          { status: 500 }
        )
      }

      if (templates) {
        for (const template of templates) {
          const textContent = template.description || extractTextFromContent(template.content)
          allMappedDocs.push({
            id: template.id,
            title: template.title,
            content: textContent,
            category: 'template',
            language: 'en',
            qualityScore: 85,
            createdAt: template.created_at || new Date().toISOString()
          })
        }
      }
    }

    // Retrieve all matches first so we can return the total count, then paginate manually.
    // (searchDocuments returns only a slice, so we need the full result set for the total.)
    const allResults = searchDocuments(allMappedDocs, {
      query,
      category,
      language,
      minQualityScore: minQuality,
      limit: 999999,
      offset: 0,
    })

    const total = allResults.length
    const paginatedResults = allResults.slice(offset, offset + limit)

    // Build vocabulary only when needed for spell correction (total === 0)
    const suggestion =
      total === 0
        ? suggestCorrection(
            query,
            [...new Set(
              allMappedDocs.flatMap((d) =>
                [...d.title.split(/\s+/), ...d.content.split(/\s+/)]
                  .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
              ).filter(Boolean)
            )]
          )
        : null

    return NextResponse.json({
      results: paginatedResults,
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