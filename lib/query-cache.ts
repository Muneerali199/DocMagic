interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: string;
  size: number;
}

/** In-process TTL cache for short-lived DB query results. */
class QueryCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  /** Returns cached value if present and not expired, otherwise null. */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry.data;
  }

  /** Stores a value with the given TTL in milliseconds. Enforces a hard 500-entry cap. */
  set<T>(key: string, data: T, ttlMs: number): void {
    if (this.store.size >= 500) {
      this.evictExpired();
      // If still at/over cap after evicting expired entries, drop the oldest key.
      if (this.store.size >= 500) {
        const oldestKey = this.store.keys().next().value;
        if (oldestKey) this.store.delete(oldestKey);
      }
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  /** Removes a single entry immediately, regardless of TTL. */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Returns cumulative hit/miss counts and hit rate percentage. */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : '0%',
      size: this.store.size,
    };
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now > v.expiresAt) this.store.delete(k);
    }
  }
}

export const queryCache = new QueryCache();

export const cacheKeys = {
  /** Cache key for a user's credits row. */
  userCredits: (userId: string) => `user_credits:${userId}`,
};
