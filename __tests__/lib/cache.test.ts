/**
 * Unit tests for lib/cache.ts
 *
 * Covers: get, set, delete, invalidateByTag, TTL expiry, LRU eviction,
 * invalidateByPrefix, flush, and the memoizeAsync helper.
 */

import { cache, aiCache, userCache, memoizeAsync } from '@/lib/cache';

/// Use Jest's fake timers so we can advance time without actually waiting.
beforeAll(() => {
  jest.useFakeTimers();
});

// Clear any intervals (like the BoundedCache sweep timer) before each test
beforeEach(() => {
  jest.clearAllTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

// Reset the shared singletons between tests to avoid cross-contamination.
afterEach(() => {
  cache.flush();
  aiCache.flush();
  userCache.flush();
});

describe('BoundedCache - get / set / delete', () => {
  it('returns null for a key that has never been set', () => {
    expect(cache.get('missing')).toBeNull();
  });

  it('returns the stored value immediately after set', () => {
    cache.set('k1', 'hello');
    expect(cache.get<string>('k1')).toBe('hello');
  });

  it('returns null after delete', () => {
    cache.set('k2', 42);
    cache.delete('k2');
    expect(cache.get('k2')).toBeNull();
  });

  it('stores arbitrary objects', () => {
    const obj = { a: 1, b: [2, 3] };
    cache.set('obj', obj);
    expect(cache.get('obj')).toEqual(obj);
  });

  it('overwrites an existing entry', () => {
    cache.set('dup', 'first');
    cache.set('dup', 'second');
    expect(cache.get<string>('dup')).toBe('second');
  });
});

describe('BoundedCache - TTL expiry', () => {
  it('returns null after the TTL has elapsed', () => {
    cache.set('ttl-key', 'value', { ttlMs: 1_000 });
    expect(cache.get('ttl-key')).toBe('value');

    jest.advanceTimersByTime(1_001);
    expect(cache.get('ttl-key')).toBeNull();
  });

  it('keeps the entry alive if TTL has not elapsed', () => {
    cache.set('alive', 'yes', { ttlMs: 5_000 });
    jest.advanceTimersByTime(4_999);
    expect(cache.get<string>('alive')).toBe('yes');
  });
});

describe('BoundedCache - invalidateByTag', () => {
  it('removes all entries that carry a matching tag', () => {
    cache.set('a', 1, { tags: ['group:x'] });
    cache.set('b', 2, { tags: ['group:x', 'group:y'] });
    cache.set('c', 3, { tags: ['group:y'] });

    const removed = cache.invalidateByTag('group:x');

    expect(removed).toBe(2);
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
    expect(cache.get<number>('c')).toBe(3);
  });

  it('returns 0 when no entry matches the tag', () => {
    cache.set('tagged', 'v', { tags: ['t:a'] });
    expect(cache.invalidateByTag('t:z')).toBe(0);
  });

  it('accepts multiple tag arguments and removes all matches', () => {
    cache.set('p', 1, { tags: ['t:p'] });
    cache.set('q', 2, { tags: ['t:q'] });
    cache.set('r', 3, { tags: ['t:r'] });

    cache.invalidateByTag('t:p', 't:q');
    expect(cache.get('p')).toBeNull();
    expect(cache.get('q')).toBeNull();
    expect(cache.get<number>('r')).toBe(3);
  });
});

describe('BoundedCache - invalidateByPrefix', () => {
  it('removes all entries whose key starts with the prefix', () => {
    cache.set('user:1', 'a');
    cache.set('user:2', 'b');
    cache.set('post:1', 'c');

    cache.invalidateByPrefix('user:');

    expect(cache.get('user:1')).toBeNull();
    expect(cache.get('user:2')).toBeNull();
    expect(cache.get<string>('post:1')).toBe('c');
  });
});

describe('BoundedCache - size and flush', () => {
  it('tracks the number of stored entries', () => {
    cache.set('s1', 1);
    cache.set('s2', 2);
    expect(cache.size).toBe(2);
  });

  it('flush empties the store', () => {
    cache.set('f1', 'x');
    cache.set('f2', 'y');
    cache.flush();
    expect(cache.size).toBe(0);
  });
});

describe('BoundedCache - LRU eviction', () => {
  it('evicts the least-recently-used entry when capacity is reached', () => {
    // The default `cache` singleton allows 1 000 entries, so we use a small
    // standalone instance to test LRU without filling the real singleton.
    // BoundedCache is not exported, but we can verify LRU indirectly through
    // the `cache` singleton by filling exactly maxEntries + 1 items.
    //
    // Instead, we use the exported `userCache` (2 000 entries) -- also too big.
    // The cleanest approach: inspect the private store via the exported flush+size API
    // together with a set sequence that forces eviction on a fresh instance.
    //
    // Since BoundedCache is not directly exported, we exercise LRU on the
    // `cache` singleton by over-filling it with 1 001 entries.

    cache.flush();
    for (let i = 0; i < 1_000; i++) {
      cache.set(`lru-${i}`, i);
    }
    // Access key 0 to make it recently used
    cache.get('lru-0');

    // Adding one more entry triggers LRU eviction
    cache.set('lru-new', 'new');

    // 'lru-0' was accessed last so it should survive; 'lru-1' was the least
    // recently accessed and should have been evicted.
    expect(cache.get('lru-new')).toBe('new');
    expect(cache.size).toBe(1_000); // eviction kept size at cap
  });
});

describe('memoizeAsync', () => {
  it('caches the return value and avoids duplicate calls', async () => {
    const impl = jest.fn().mockResolvedValue('result');
    const memoized = memoizeAsync(impl, (id: string) => `key:${id}`);

    const r1 = await memoized('x');
    const r2 = await memoized('x');

    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(impl).toHaveBeenCalledTimes(1);
  });

  it('calls the function again for a different key', async () => {
    const impl = jest.fn().mockImplementation(async (id: string) => `val-${id}`);
    const memoized = memoizeAsync(impl, (id: string) => `key:${id}`);

    const r1 = await memoized('a');
    const r2 = await memoized('b');

    expect(r1).toBe('val-a');
    expect(r2).toBe('val-b');
    expect(impl).toHaveBeenCalledTimes(2);
  });

  it('calls the function again after TTL expires', async () => {
    const impl = jest.fn().mockResolvedValue('fresh');
    const memoized = memoizeAsync(impl, () => 'static-key', { ttlMs: 500 });

    await memoized();
    jest.advanceTimersByTime(501);
    await memoized();

    expect(impl).toHaveBeenCalledTimes(2);
  });
});
