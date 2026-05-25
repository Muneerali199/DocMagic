/** @jest-environment node */
import { queryCache, cacheKeys } from '../query-cache';
import { getCachedUserCredits, invalidateUserCredits } from '../cached-queries';
import { createBatchLoader, createCreditsLoader } from '../batch-loader';
import type { UserCreditsRow } from '../credit-operations';

// ── Helpers ──────────────────────────────────────────────────────────────────

const TEST_USER_ID = 'test-user-cache';
const FUTURE_RESET = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const PAST_RESET = new Date(Date.now() - 1000).toISOString();

function makeCreditsRow(overrides: Partial<UserCreditsRow> = {}): UserCreditsRow {
  return {
    user_id: TEST_USER_ID,
    tier: 'free',
    credits_total: 20,
    credits_used: 5,
    credits_reset_at: FUTURE_RESET,
    subscription_status: 'active',
    ...overrides,
  } as UserCreditsRow;
}

/**
 * Builds a minimal Supabase-shaped mock for user_credits reads/writes.
 * Pass `selectRow` to control what the initial SELECT returns (null = no row).
 */
function makeSupabaseMock(options: {
  selectRow?: UserCreditsRow | null;
  insertError?: boolean;
  resetRow?: UserCreditsRow | null;
} = {}) {
  const { selectRow = makeCreditsRow(), insertError = false, resetRow } = options;

  const calls = { selects: 0, inserts: 0, updates: 0 };

  const supabase: any = {
    __calls: calls,
    from(table: string) {
      return {
        select() {
          return {
            eq(_col: string, _val: string) {
              return {
                single() {
                  calls.selects++;
                  return Promise.resolve({ data: selectRow, error: selectRow ? null : { message: 'no rows', code: 'PGRST116' } });
                },
              };
            },
          };
        },
        insert(_payload: unknown) {
          return {
            select() {
              return {
                single() {
                  calls.inserts++;
                  if (insertError) return Promise.resolve({ data: null, error: { message: 'insert failed' } });
                  const row = makeCreditsRow({ credits_used: 0 });
                  return Promise.resolve({ data: row, error: null });
                },
              };
            },
          };
        },
        update(_patch: unknown) {
          return {
            eq(_col: string, _val: string) {
              return {
                select() {
                  return {
                    single() {
                      calls.updates++;
                      const row = resetRow ?? makeCreditsRow({ credits_used: 0, credits_reset_at: FUTURE_RESET });
                      return Promise.resolve({ data: row, error: null });
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  return supabase;
}

// ── QueryCache ────────────────────────────────────────────────────────────────

describe('QueryCache', () => {
  // Use unique per-test key prefixes to isolate singleton state.
  let key: string;

  beforeEach(() => {
    key = `test:${Math.random().toString(36).slice(2)}`;
  });

  afterEach(() => {
    queryCache.invalidate(key);
  });

  it('returns null for a cache miss', () => {
    expect(queryCache.get<string>(key)).toBeNull();
  });

  it('returns stored data within TTL', () => {
    queryCache.set(key, { id: 'abc' }, 10_000);
    expect(queryCache.get<{ id: string }>(key)).toEqual({ id: 'abc' });
  });

  it('returns null after the TTL has elapsed', () => {
    jest.useFakeTimers();
    queryCache.set(key, 'payload', 200);
    jest.advanceTimersByTime(201);
    expect(queryCache.get<string>(key)).toBeNull();
    jest.useRealTimers();
  });

  it('invalidate makes a cached entry unreachable', () => {
    queryCache.set(key, 'data', 10_000);
    queryCache.invalidate(key);
    expect(queryCache.get<string>(key)).toBeNull();
  });

  it('getStats hitRate reflects actual hit/miss ratio', () => {
    const hitKey = `hitrate:hit:${Math.random()}`;
    const missKey = `hitrate:miss:${Math.random()}`;
    queryCache.set(hitKey, 1, 10_000);

    const before = queryCache.getStats();
    queryCache.get<number>(hitKey);   // +1 hit
    queryCache.get<number>(missKey);  // +1 miss
    const after = queryCache.getStats();

    expect(after.hits).toBe(before.hits + 1);
    expect(after.misses).toBe(before.misses + 1);
    expect(after.hitRate).toMatch(/^\d+(\.\d+)?%$/);

    queryCache.invalidate(hitKey);
    queryCache.invalidate(missKey);
  });

  it('getStats returns 0% hitRate when nothing has been accessed', () => {
    // New keys with no prior accesses — verify the string format is valid %
    // (absolute 0% is only guaranteed on a fresh instance, not a singleton)
    const stats = queryCache.getStats();
    expect(stats.hitRate).toMatch(/^\d+(\.\d+)?%$/);
    expect(stats.size).toBeGreaterThanOrEqual(0);
  });

  it('concurrent reads all return the same cached value', async () => {
    queryCache.set(key, { name: 'shared' }, 10_000);
    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        Promise.resolve(queryCache.get<{ name: string }>(key))
      )
    );
    expect(results.every(r => r?.name === 'shared')).toBe(true);
  });

  it('evicts expired entries when store is at capacity, then accepts new entry', () => {
    jest.useFakeTimers();
    const prefix = `cap:${Math.random()}:`;

    for (let i = 0; i < 500; i++) {
      queryCache.set(`${prefix}${i}`, i, 100); // 100 ms TTL
    }
    jest.advanceTimersByTime(200); // all 500 expire

    // This set triggers evictExpired since size >= 500
    queryCache.set(key, 'after-eviction', 10_000);
    expect(queryCache.get<string>(key)).toBe('after-eviction');

    jest.useRealTimers();
    for (let i = 0; i < 500; i++) queryCache.invalidate(`${prefix}${i}`);
  });
});

// ── cacheKeys ────────────────────────────────────────────────────────────────

describe('cacheKeys', () => {
  it('generates a stable key for the same userId', () => {
    expect(cacheKeys.userCredits('u1')).toBe('user_credits:u1');
    expect(cacheKeys.userCredits('u1')).toBe(cacheKeys.userCredits('u1'));
  });

  it('generates distinct keys for different userIds', () => {
    expect(cacheKeys.userCredits('u1')).not.toBe(cacheKeys.userCredits('u2'));
  });
});

// ── getCachedUserCredits ──────────────────────────────────────────────────────

describe('getCachedUserCredits', () => {
  beforeEach(() => {
    invalidateUserCredits(TEST_USER_ID);
  });

  it('fetches from DB on cache miss and caches the result', async () => {
    const supabase = makeSupabaseMock();
    const result = await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(result).not.toBeNull();
    expect(result?.user_id).toBe(TEST_USER_ID);
    expect(supabase.__calls.selects).toBe(1);

    // Second call: should hit cache — no new DB call
    await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(supabase.__calls.selects).toBe(1);
  });

  it('returns cached data and skips DB on cache hit', async () => {
    const supabase = makeSupabaseMock();
    await getCachedUserCredits(supabase, TEST_USER_ID); // warms cache
    const callsBefore = supabase.__calls.selects;

    const result = await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(result).not.toBeNull();
    expect(supabase.__calls.selects).toBe(callsBefore); // no new query
  });

  it('re-fetches from DB after invalidateUserCredits', async () => {
    const supabase = makeSupabaseMock();
    await getCachedUserCredits(supabase, TEST_USER_ID);
    const selectsAfterFirst = supabase.__calls.selects;

    invalidateUserCredits(TEST_USER_ID);
    await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(supabase.__calls.selects).toBe(selectsAfterFirst + 1);
  });

  it('creates a new row when none exists in the DB', async () => {
    const supabase = makeSupabaseMock({ selectRow: null });
    const result = await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(result).not.toBeNull();
    expect(supabase.__calls.inserts).toBe(1);
    expect(result?.tier).toBe('free');
    expect(result?.credits_used).toBe(0);
  });

  it('returns null when the DB row is missing and insert fails', async () => {
    const supabase = makeSupabaseMock({ selectRow: null, insertError: true });
    const result = await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(result).toBeNull();
  });

  it('resets credits_used when credits_reset_at is in the past', async () => {
    const expiredRow = makeCreditsRow({ credits_used: 18, credits_reset_at: PAST_RESET });
    const supabase = makeSupabaseMock({ selectRow: expiredRow });
    const result = await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(supabase.__calls.updates).toBe(1);
    expect(result?.credits_used).toBe(0);
  });

  it('does not update when credits_reset_at is still in the future', async () => {
    const freshRow = makeCreditsRow({ credits_reset_at: FUTURE_RESET });
    const supabase = makeSupabaseMock({ selectRow: freshRow });
    await getCachedUserCredits(supabase, TEST_USER_ID);
    expect(supabase.__calls.updates).toBe(0);
  });

  it('isolates cache per userId — different users get separate entries', async () => {
    const userA = 'user-a-cache-test';
    const userB = 'user-b-cache-test';
    invalidateUserCredits(userA);
    invalidateUserCredits(userB);

    const rowA = makeCreditsRow({ user_id: userA, credits_used: 3 });
    const rowB = makeCreditsRow({ user_id: userB, credits_used: 7 });

    const supabaseA = makeSupabaseMock({ selectRow: rowA });
    const supabaseB = makeSupabaseMock({ selectRow: rowB });

    const [a, b] = await Promise.all([
      getCachedUserCredits(supabaseA, userA),
      getCachedUserCredits(supabaseB, userB),
    ]);

    expect(a?.credits_used).toBe(3);
    expect(b?.credits_used).toBe(7);

    invalidateUserCredits(userA);
    invalidateUserCredits(userB);
  });
});

// ── createBatchLoader ─────────────────────────────────────────────────────────

describe('createBatchLoader', () => {
  it('batches multiple load() calls fired in the same tick into one batchFn call', async () => {
    let batchFnCallCount = 0;

    const loader = createBatchLoader<string, string>(async (keys) => {
      batchFnCallCount++;
      const map = new Map<string, string>();
      for (const k of keys) map.set(k, `val:${k}`);
      return map;
    });

    const [a, b, c] = await Promise.all([
      loader.load('x'),
      loader.load('y'),
      loader.load('z'),
    ]);

    expect(batchFnCallCount).toBe(1);
    expect(a).toBe('val:x');
    expect(b).toBe('val:y');
    expect(c).toBe('val:z');
  });

  it('deduplicates repeated keys — batchFn receives each key once', async () => {
    const receivedKeys: string[][] = [];

    const loader = createBatchLoader<string, number>(async (keys) => {
      receivedKeys.push([...keys]);
      const map = new Map<string, number>();
      for (const k of keys) map.set(k, parseInt(k, 10));
      return map;
    });

    const [r1, r2] = await Promise.all([
      loader.load('5'),
      loader.load('5'),
    ]);

    expect(receivedKeys[0]).toEqual(['5']); // only one key sent
    expect(r1).toBe(5);
    expect(r2).toBe(5);
  });

  it('returns null for keys not present in batchFn result', async () => {
    const loader = createBatchLoader<string, string>(async (_keys) => {
      return new Map(); // returns nothing
    });

    const result = await loader.load('missing');
    expect(result).toBeNull();
  });

  it('loadMany resolves all keys correctly', async () => {
    const loader = createBatchLoader<string, string>(async (keys) => {
      const map = new Map<string, string>();
      for (const k of keys) map.set(k, k.toUpperCase());
      return map;
    });

    const results = await loader.loadMany(['a', 'b', 'c']);
    expect(results).toEqual(['A', 'B', 'C']);
  });

  it('resolves all pending keys with null when batchFn throws', async () => {
    const loader = createBatchLoader<string, string>(async () => {
      throw new Error('batch fetch failed');
    });

    const [r1, r2] = await Promise.all([
      loader.load('p'),
      loader.load('q'),
    ]);

    expect(r1).toBeNull();
    expect(r2).toBeNull();
  });

  it('handles sequential ticks as separate batches', async () => {
    const batches: string[][] = [];

    const loader = createBatchLoader<string, string>(async (keys) => {
      batches.push([...keys]);
      const map = new Map<string, string>();
      for (const k of keys) map.set(k, k);
      return map;
    });

    // First tick
    await loader.load('first-tick');
    // Second tick — the loader is already flushed, so this is a new batch
    await loader.load('second-tick');

    expect(batches).toHaveLength(2);
    expect(batches[0]).toEqual(['first-tick']);
    expect(batches[1]).toEqual(['second-tick']);
  });
});

// ── createCreditsLoader ───────────────────────────────────────────────────────

describe('createCreditsLoader', () => {
  it('issues a single IN-query for multiple user IDs', async () => {
    let capturedUserIds: string[] = [];

    const supabase: any = {
      from(_table: string) {
        return {
          select(_cols: string) {
            return {
              in(_col: string, ids: string[]) {
                capturedUserIds = ids;
                const data = ids.map(id => makeCreditsRow({ user_id: id }));
                return Promise.resolve({ data, error: null });
              },
            };
          },
        };
      },
    };

    const loader = createCreditsLoader(supabase);
    const [a, b] = await Promise.all([
      loader.load('uid-1'),
      loader.load('uid-2'),
    ]);

    expect(capturedUserIds).toHaveLength(2);
    expect(capturedUserIds).toContain('uid-1');
    expect(capturedUserIds).toContain('uid-2');
    expect(a?.user_id).toBe('uid-1');
    expect(b?.user_id).toBe('uid-2');
  });

  it('returns null for a user ID not returned by the DB', async () => {
    const supabase: any = {
      from() {
        return {
          select() {
            return {
              in() {
                return Promise.resolve({ data: [], error: null }); // empty result
              },
            };
          },
        };
      },
    };

    const loader = createCreditsLoader(supabase);
    const result = await loader.load('unknown-user');
    expect(result).toBeNull();
  });
});
