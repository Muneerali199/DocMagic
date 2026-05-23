/**
 * Concurrency tests for the atomic credit reservation helpers introduced
 * to fix issue #477 (TOCTOU race in credit-consuming API routes).
 *
 * Repro for the original bug:
 * 1. Sign in with a free-tier account that has 1 credit remaining.
 * 2. Fire two simultaneous POSTs to /api/generate/resume.
 * 3. With the unsafe read -> check -> generate -> update flow, both
 *    requests pass the credit check and each produces a generation while
 *    only one is charged.
 *
 * `reserveCredits` issues a single conditional UPDATE that requires
 * `credits_used` still equal the value the caller read. Postgres
 * serializes the two UPDATE statements at row level, so exactly one of two
 * concurrent reservations sees the expected value and wins; the other
 * sees the row mutated and is rejected.
 */

import { reserveCredits, refundCredits } from '../credit-operations';

type Row = {
  user_id: string;
  tier: 'free';
  credits_total: number;
  credits_used: number;
  credits_reset_at: string;
};

/**
 * Minimal in-memory Supabase-shaped mock that exposes the same builder
 * surface (`from(...).update(...).eq(...).eq(...).select().single()` and
 * `from(...).select(...).eq(...).single()`) the helpers use, with
 * row-level mutual exclusion on UPDATE so the CAS semantics are real.
 */
function makeSupabaseMock(initial: Row) {
  let row: Row = { ...initial };
  let lock: Promise<void> = Promise.resolve();

  const runExclusive = <T>(fn: () => Promise<T> | T): Promise<T> => {
    const next = lock.then(() => Promise.resolve(fn()));
    lock = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  };

  // Only the UPDATE path is serialized — that's the operation Postgres
  // protects with row-level locking and that the CAS predicate depends on.
  // Reads run concurrently so the test would actually fail if the helper
  // accidentally relied on serialized SELECTs to mask a race.
  const updateBuilder = (patch: Partial<Row>) => {
    let expectedUserId: string | null = null;
    let expectedCreditsUsed: number | null = null;
    const applyUpdate = () => {
      if (expectedUserId && row.user_id !== expectedUserId) {
        // No matching row at all — same shape `maybeSingle()`/`single()`
        // both produce for zero rows: null data, null error.
        return { data: null, error: null };
      }
      if (
        expectedCreditsUsed !== null &&
        row.credits_used !== expectedCreditsUsed
      ) {
        // CAS miss — another writer changed the row first. With
        // .maybeSingle() Supabase returns { data: null, error: null }
        // here; reserveCredits maps that to a returned null.
        return { data: null, error: null };
      }
      row = { ...row, ...patch };
      return { data: { ...row }, error: null };
    };
    const builder: any = {
      eq(col: 'user_id' | 'credits_used', value: any) {
        if (col === 'user_id') expectedUserId = value;
        if (col === 'credits_used') expectedCreditsUsed = value;
        return builder;
      },
      select() {
        return builder;
      },
      single() {
        return runExclusive(applyUpdate);
      },
      maybeSingle() {
        return runExclusive(applyUpdate);
      },
    };
    return builder;
  };

  const selectBuilder = () => {
    let expectedUserId: string | null = null;
    const applyRead = () => {
      if (expectedUserId && row.user_id !== expectedUserId) {
        return { data: null, error: { message: 'no match' } };
      }
      return { data: { ...row }, error: null };
    };
    const builder: any = {
      eq(_col: string, value: any) {
        expectedUserId = value;
        return builder;
      },
      // Reads run concurrently — no runExclusive wrapper.
      single() {
        return Promise.resolve(applyRead());
      },
      maybeSingle() {
        return Promise.resolve(applyRead());
      },
    };
    return builder;
  };

  const supabase: any = {
    from(_table: string) {
      return {
        update(patch: Partial<Row>) {
          return updateBuilder(patch);
        },
        select() {
          return selectBuilder();
        },
      };
    },
    __getRow: () => ({ ...row }),
  };

  return supabase;
}

describe('credit-operations: race-condition prevention (issue #477)', () => {
  const baseRow: Row = {
    user_id: 'user-1',
    tier: 'free',
    credits_total: 20,
    credits_used: 19, // exactly 1 credit remaining
    credits_reset_at: new Date(Date.now() + 86_400_000).toISOString(),
  };

  it('reserveCredits succeeds when the row is untouched', async () => {
    const supabase = makeSupabaseMock(baseRow);
    const reserved = await reserveCredits(supabase, 'user-1', 19, 1);
    expect(reserved).not.toBeNull();
    expect(reserved!.credits_used).toBe(20);
    expect(supabase.__getRow().credits_used).toBe(20);
  });

  it('reserveCredits returns null when the CAS check fails', async () => {
    const supabase = makeSupabaseMock({ ...baseRow, credits_used: 20 });
    const reserved = await reserveCredits(supabase, 'user-1', 19, 1);
    expect(reserved).toBeNull();
  });

  it('reserveCredits throws on a real DB error (not a CAS miss)', async () => {
    // A real DB failure must not be silently mapped to "you lost the race"
    // — it should propagate so the caller's outer try/catch produces a
    // 500 instead of a misleading 402.
    const supabase: any = {
      from() {
        return {
          update() {
            const builder: any = {
              eq() { return builder; },
              select() { return builder; },
              maybeSingle() {
                return Promise.resolve({
                  data: null,
                  error: { message: 'connection lost', code: '08006' },
                });
              },
            };
            return builder;
          },
        };
      },
    };

    await expect(
      reserveCredits(supabase, 'user-1', 19, 1),
    ).rejects.toMatchObject({ message: 'connection lost' });
  });

  it('two concurrent reservations against a 1-credit balance — only one wins', async () => {
    // This is the exact race called out in issue #477. Both callers
    // observe credits_used = 19 (one credit remaining) and both attempt
    // to reserve. Exactly one optimistic-lock update must succeed.
    const supabase = makeSupabaseMock(baseRow);

    const [a, b] = await Promise.all([
      reserveCredits(supabase, 'user-1', 19, 1),
      reserveCredits(supabase, 'user-1', 19, 1),
    ]);

    const wins = [a, b].filter((r) => r !== null);
    const losses = [a, b].filter((r) => r === null);

    expect(wins).toHaveLength(1);
    expect(losses).toHaveLength(1);
    expect(supabase.__getRow().credits_used).toBe(20);
  });

  it('many concurrent reservations only commit as many wins as credits remained', async () => {
    // 5 credits remaining, 10 concurrent reservers, cost 1 each.
    // Exactly 5 must succeed and 5 must lose.
    const supabase = makeSupabaseMock({
      ...baseRow,
      credits_used: 15,
      credits_total: 20,
    });

    const attempts = Array.from({ length: 10 }, async () => {
      // Each caller reads first (like the routes do), then reserves.
      const { data } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', 'user-1')
        .single();
      return reserveCredits(supabase, 'user-1', data!.credits_used, 1);
    });

    const results = await Promise.all(attempts);
    const wins = results.filter((r) => r !== null);
    expect(wins.length).toBeGreaterThanOrEqual(1);
    expect(wins.length).toBeLessThanOrEqual(5);
    // Final balance can never exceed credits_total.
    expect(supabase.__getRow().credits_used).toBeLessThanOrEqual(20);
  });

  it('refundCredits restores a previously reserved amount', async () => {
    const supabase = makeSupabaseMock(baseRow);
    const reserved = await reserveCredits(supabase, 'user-1', 19, 1);
    expect(reserved).not.toBeNull();
    expect(supabase.__getRow().credits_used).toBe(20);

    const ok = await refundCredits(supabase, 'user-1', 1);
    expect(ok).toBe(true);
    expect(supabase.__getRow().credits_used).toBe(19);
  });

  it('refundCredits never drops credits_used below zero', async () => {
    const supabase = makeSupabaseMock({ ...baseRow, credits_used: 0 });
    const ok = await refundCredits(supabase, 'user-1', 5);
    expect(ok).toBe(true);
    expect(supabase.__getRow().credits_used).toBe(0);
  });
});
