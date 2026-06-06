/**
 * lib/cache.ts — Fix #11 (bounded memory) + Fix #14 (cache invalidation)
 */
import { logger } from '@/lib/logger';

interface Entry<T> {
  value: T;
  expiresAt: number;
  tags: Set<string>;
  lastAccessed: number;
}

class BoundedCache {
  private store = new Map<string, Entry<unknown>>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private maxEntries: number, private defaultTtlMs: number) {
    if (typeof setInterval !== 'undefined')
      this.timer = setInterval(() => this.sweep(), 60_000);
  }

  get<T>(key: string): T | null {
    const e = this.store.get(key) as Entry<T> | undefined;
    if (!e) return null;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return null;
    }
    e.lastAccessed = Date.now();
    return e.value;
  }

  set<T>(key: string, value: T, opts: { ttlMs?: number; tags?: string[] } = {}): void {
    if (this.store.size >= this.maxEntries && !this.store.has(key)) this.evictLru();
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (opts.ttlMs ?? this.defaultTtlMs),
      tags: new Set(opts.tags ?? []),
      lastAccessed: Date.now(),
    });
  }

  delete(key: string) {
    this.store.delete(key);
  }

  invalidateByTag(...tags: string[]): number {
    let n = 0;
    for (const [k, e] of this.store) {
      if (tags.some((t) => e.tags.has(t))) {
        this.store.delete(k);
        n++;
      }
    }
    if (n > 0) logger.debug(null, `[cache] Invalidated ${n} entries`);
    return n;
  }

  invalidateByPrefix(prefix: string): number {
    let n = 0;
    for (const k of this.store.keys())
      if (k.startsWith(prefix)) {
        this.store.delete(k);
        n++;
      }
    return n;
  }

  flush() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }

  private evictLru() {
    let old: string | null = null;
    let ts = Infinity;
    for (const [k, e] of this.store)
      if (e.lastAccessed < ts) {
        ts = e.lastAccessed;
        old = k;
      }
    if (old) {
      this.store.delete(old);
      logger.debug(null, `[cache] LRU evict: ${old}`);
    }
  }

  private sweep() {
    const now = Date.now();
    let n = 0;
    for (const [k, e] of this.store)
      if (now > e.expiresAt) {
        this.store.delete(k);
        n++;
      }
    if (n > 0) logger.debug(null, `[cache] Swept ${n}`);
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    this.store.clear();
  }
}

export const cache = new BoundedCache(1_000, 5 * 60 * 1000);
export const aiCache = new BoundedCache(500, 30 * 60 * 1000);
export const userCache = new BoundedCache(2_000, 2 * 60 * 1000);

// ---------------------------------------------------------------------------
// Distributed cache adapter
//
// When UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN are set, all consumers that
// import `distributedCache` share data across multiple server instances.
// Otherwise, the module falls back to the in-memory BoundedCache so the app
// works in single-instance environments (local dev, preview deploys, etc.)
// without any additional configuration.
//
// See lib/cache-redis.ts for the RedisCache implementation.
// ---------------------------------------------------------------------------
import { RedisCache, isRedisConfigured } from '@/lib/cache-redis';

/**
 * Unified cache that is Redis-backed when UPSTASH_REDIS_URL is configured
 * and falls back to an in-memory BoundedCache otherwise.
 *
 * Use this instead of `cache` for data that must be shared across multiple
 * server instances (horizontal scaling).
 */
export const distributedCache: BoundedCache | RedisCache = isRedisConfigured()
  ? new RedisCache(5 * 60 * 1000)
  : cache;

export function memoizeAsync<A extends unknown[], R>(
  fn: (...a: A) => Promise<R>,
  keyFn: (...a: A) => string,
  opts: { ttlMs?: number; tags?: (...a: A) => string[] } = {}
): (...a: A) => Promise<R> {
  return async (...args: A): Promise<R> => {
    const key = keyFn(...args);
    const cached = cache.get<R>(key);
    if (cached !== null) return cached;
    const result = await fn(...args);
    cache.set(key, result, { ttlMs: opts.ttlMs, tags: opts.tags?.(...args) });
    return result;
  };
}
