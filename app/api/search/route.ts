import { NextRequest, NextResponse } from 'next/server'
import { searchDocuments, suggestCorrection } from '@/lib/search-engine'
import type { SearchableDocument } from '@/lib/search-engine'

// Sample documents index — replace with real DB query later
const SAMPLE_INDEX: SearchableDocument[] = [
  {
    id: '1',
    title: 'Software Engineer Resume',
    content: 'Experienced software engineer with React TypeScript Node.js skills',
    category: 'resume',
    language: 'en',
    qualityScore: 90,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Product Manager CV',
    content: 'Product manager with 5 years experience in agile teams',
    category: 'resume',
    language: 'en',
    qualityScore: 85,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Marketing Presentation Template',
    content: 'Professional marketing presentation with slides for campaigns',
    category: 'presentation',
    language: 'en',
    qualityScore: 80,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Cover Letter Template',
    content: 'Professional cover letter template for job applications',
    category: 'letter',
    language: 'en',
    qualityScore: 75,
    createdAt: new Date().toISOString(),
  },
]

const VOCABULARY = SAMPLE_INDEX.flatMap((d) =>
  [...d.title.split(' '), ...d.content.split(' ')].map((w) => w.toLowerCase())
)

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') ?? ''
    const category = searchParams.get('category') ?? undefined
    const language = searchParams.get('language') ?? undefined
    const minQuality = Number(searchParams.get('minQuality') ?? 0)
    const limit = Number(searchParams.get('limit') ?? 10)

    if (!query.trim()) {
      return NextResponse.json({ results: [], suggestion: null, total: 0 })
    }

    const results = searchDocuments(SAMPLE_INDEX, {
      query,
      category,
      language,
      minQualityScore: minQuality,
      limit,
    })

    const suggestion =
      results.length === 0 ? suggestCorrection(query, VOCABULARY) : null

    return NextResponse.json({
      results,
      suggestion,
      total: results.length,
      query,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}