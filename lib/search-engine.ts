export interface SearchableDocument {
  id: string
  title: string
  content: string
  category: 'resume' | 'presentation' | 'template' | 'letter'
  language: string
  qualityScore: number
  createdAt: string
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  category: string
  qualityScore: number
  relevanceScore: number
}

export interface SearchOptions {
  query: string
  category?: string
  language?: string
  minQualityScore?: number
  limit?: number
  offset?: number
}

/**
 * Simple full-text search engine with relevance ranking.
 * Isolated and documented for easy replacement with Elasticsearch later.
 */
export function searchDocuments(
  documents: SearchableDocument[],
  options: SearchOptions
): SearchResult[] {
  const {
    query,
    category,
    language,
    minQualityScore = 0,
    limit = 10,
    offset = 0,
  } = options

  if (!query.trim()) return []

  const queryTerms = query.toLowerCase().split(/\s+/)

  const results = documents
    .filter((doc) => {
      if (category && doc.category !== category) return false
      if (language && doc.language !== language) return false
      if (doc.qualityScore < minQualityScore) return false
      return true
    })
    .map((doc) => {
      const titleLower = doc.title.toLowerCase()
      const contentLower = doc.content.toLowerCase()

      // Relevance scoring
      let relevanceScore = 0
      for (const term of queryTerms) {
        if (titleLower.includes(term)) relevanceScore += 10
        if (contentLower.includes(term)) relevanceScore += 5
      }

      // Boost by quality score
      relevanceScore += doc.qualityScore * 0.1

      // Generate excerpt with highlight
      const excerptIndex = contentLower.indexOf(queryTerms[0])
      const excerpt =
        excerptIndex !== -1
          ? '...' + doc.content.slice(Math.max(0, excerptIndex - 50), excerptIndex + 100) + '...'
          : doc.content.slice(0, 150) + '...'

      return {
        id: doc.id,
        title: doc.title,
        excerpt,
        category: doc.category,
        qualityScore: doc.qualityScore,
        relevanceScore,
      }
    })
    .filter((r) => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)

  return results.slice(offset, offset + limit)
}

/**
 * Spell correction using simple edit distance.
 */
export function suggestCorrection(query: string, vocabulary: string[]): string | null {
  const lower = query.toLowerCase()
  let best: string | null = null
  let bestDistance = Infinity

  for (const word of vocabulary) {
    const distance = editDistance(lower, word.toLowerCase())
    if (distance < bestDistance && distance <= 2) {
      bestDistance = distance
      best = word
    }
  }

  return best
}

function editDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[a.length][b.length]
}