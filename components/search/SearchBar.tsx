'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Loader2, X } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  excerpt: string
  category: string
  qualityScore: number
  relevanceScore: number
}

interface SearchResponse {
  results: SearchResult[]
  suggestion: string | null
  total: number
  query: string
}

const LIMIT = 10

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  // Sequence counter to discard stale responses when requests resolve out of order
  const latestRequestId = useRef(0)

  const handleSearch = useCallback(async (q: string, searchPage: number = 1) => {
    if (!q.trim()) return
    const requestId = ++latestRequestId.current
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const params = new URLSearchParams({
        q,
        page: String(searchPage),
        limit: String(LIMIT)
      })
      if (category) params.set('category', category)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (!res.ok) throw new Error('Search failed')

      const data: SearchResponse = await res.json()
      if (requestId !== latestRequestId.current) return
      setResults(data.results)
      setSuggestion(data.suggestion)
      setTotal(data.total)
      setPage(searchPage)
    } catch {
      if (requestId !== latestRequestId.current) return
      setError('Search failed. Please try again.')
    } finally {
      if (requestId !== latestRequestId.current) return
      setLoading(false)
    }
  }, [category])

  // Debounced search trigger as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query, 1)
      } else {
        setResults([])
        setSuggestion(null)
        setTotal(0)
        setSearched(false)
        setError(null)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, handleSearch])

  const handleClear = () => {
    latestRequestId.current += 1
    setQuery('')
    setResults([])
    setSuggestion(null)
    setTotal(0)
    setSearched(false)
    setError(null)
    setPage(1)
  }

  const categoryColors: Record<string, string> = {
    resume: 'bg-blue-100 text-blue-700',
    presentation: 'bg-purple-100 text-purple-700',
    template: 'bg-green-100 text-green-700',
    letter: 'bg-yellow-100 text-yellow-700',
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query, 1)}
            placeholder="Search resumes, templates, presentations..."
            className="flex-1 outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
          />
          {query && (
            <button onClick={handleClear}>
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-700"
        >
          <option value="">All Types</option>
          <option value="resume">Resume</option>
          <option value="presentation">Presentation</option>
          <option value="template">Template</option>
          <option value="letter">Letter</option>
        </select>

        <button
          onClick={() => handleSearch(query, 1)}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Spell suggestion */}
      {suggestion && (
        <p className="text-sm text-gray-500">
          Did you mean{' '}
          <button
            className="text-indigo-600 underline"
            onClick={() => {
              setQuery(suggestion)
              handleSearch(suggestion, 1)
            }}
          >
            {suggestion}
          </button>
          ?
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400">
            Showing {(page - 1) * LIMIT + 1} - {Math.min(page * LIMIT, total)} of {total} results
          </p>
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">{result.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[result.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {result.category}
                </span>
              </div>
              <p className="text-xs text-gray-500">{result.excerpt}</p>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-gray-400">
                  Quality: {result.qualityScore}%
                </span>
                <span className="text-xs text-gray-400">
                  Relevance: {result.relevanceScore.toFixed(1)}
                </span>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {total > LIMIT && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSearch(query, page - 1)}
                  disabled={page === 1 || loading}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleSearch(query, page + 1)}
                  disabled={page === totalPages || loading}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && !suggestion && (
        <p className="text-sm text-gray-400 text-center py-4">
          No results found for &quot;{query}&quot;. Try different keywords.
        </p>
      )}
    </div>
  )
}