'use client'

import { useState, useCallback } from 'react'
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

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const params = new URLSearchParams({ q })
      if (category) params.set('category', category)

      const res = await fetch(`/api/search?${params.toString()}`)
      if (!res.ok) throw new Error('Search failed')

      const data: SearchResponse = await res.json()
      setResults(data.results)
      setSuggestion(data.suggestion)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [category])

  const handleClear = () => {
    setQuery('')
    setResults([])
    setSuggestion(null)
    setSearched(false)
    setError(null)
  }

  const categoryColors: Record<string, string> = {
    resume: 'bg-blue-100 text-blue-700',
    presentation: 'bg-purple-100 text-purple-700',
    template: 'bg-green-100 text-green-700',
    letter: 'bg-yellow-100 text-yellow-700',
  }

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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
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
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-gray-700"
        >
          <option value="">All Types</option>
          <option value="resume">Resume</option>
          <option value="presentation">Presentation</option>
          <option value="template">Template</option>
          <option value="letter">Letter</option>
        </select>

        <button
          onClick={() => handleSearch(query)}
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
              handleSearch(suggestion)
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
          <p className="text-xs text-gray-400">{results.length} results found</p>
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
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && !suggestion && (
        <p className="text-sm text-gray-400 text-center py-4">
          No results found for "{query}". Try different keywords.
        </p>
      )}
    </div>
  )
}