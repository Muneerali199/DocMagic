'use client';

import { useState, useEffect, useCallback } from "react";
import type { FeedItem, FeedType } from "@/types/showcase";

interface FeedState {
  items:         FeedItem[];
  nextCursor:    string | null;
  isLoading:     boolean;
  isLoadingMore: boolean;
  hasMore:       boolean;
  error:         string | null;
}

const INITIAL_STATE: FeedState = {
  items:         [],
  nextCursor:    null,
  isLoading:     true,
  isLoadingMore: false,
  hasMore:       false,
  error:         null,
};

export function useFeed(type: FeedType, limit = 20) {
  const [state, setState] = useState<FeedState>(INITIAL_STATE);

  // ── Fetch first page whenever feed type changes ───────────────────────────
  useEffect(() => {
    // Reset state when tab changes
    setState({ ...INITIAL_STATE, isLoading: true });

    let cancelled = false;

    fetch(`/api/showcase/feed?type=${type}&limit=${limit}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          items:         data.items ?? [],
          nextCursor:    data.next_cursor ?? null,
          isLoading:     false,
          isLoadingMore: false,
          hasMore:       !!data.next_cursor,
          error:         null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:     "Failed to load feed. Please try again.",
        }));
      });

    // Cleanup — ignore result if type changed before fetch completed
    return () => { cancelled = true; };
  }, [type, limit]);

  // ── Load next page ────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (!state.nextCursor || state.isLoadingMore || state.isLoading) return;

    setState((prev) => ({ ...prev, isLoadingMore: true }));

    const url = `/api/showcase/feed?type=${type}&limit=${limit}&cursor=${state.nextCursor}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setState((prev) => ({
          ...prev,
          // Append new items to existing list
          items:         [...prev.items, ...(data.items ?? [])],
          nextCursor:    data.next_cursor ?? null,
          isLoadingMore: false,
          hasMore:       !!data.next_cursor,
          error:         null,
        }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          isLoadingMore: false,
          error:         "Failed to load more posts.",
        }));
      });
  }, [state.nextCursor, state.isLoadingMore, state.isLoading, type, limit]);

  return {
    items:         state.items,
    isLoading:     state.isLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore:       state.hasMore,
    error:         state.error,
    loadMore,
  };
}