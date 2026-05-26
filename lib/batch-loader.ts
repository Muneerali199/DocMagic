import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserCreditsRow } from './credit-operations';

// Batches multiple load(key) calls that arrive in the same event-loop tick
// into a single SELECT ... WHERE user_id IN (...) query.
// Useful when server components or concurrent API handlers independently
// request the same row — instead of N queries you get one.
type BatchFn<K, V> = (keys: K[]) => Promise<Map<K, V>>;

interface Loader<K, V> {
  load: (key: K) => Promise<V | null>;
  loadMany: (keys: K[]) => Promise<(V | null)[]>;
}

/**
 * Creates a DataLoader that batches all load(key) calls arriving in the same
 * event-loop tick into a single batchFn invocation. Deduplicates repeated keys
 * so each key appears only once per batch.
 */
export function createBatchLoader<K extends string | number, V>(
  batchFn: BatchFn<K, V>
): Loader<K, V> {
  let pending: K[] = [];
  let resolvers = new Map<K, Array<(v: V | null) => void>>();
  let scheduled = false;

  const flush = async () => {
    const keys = pending;
    const waiting = resolvers;
    pending = [];
    resolvers = new Map();
    scheduled = false;

    try {
      const results = await batchFn(keys);
      for (const key of keys) {
        const value = results.get(key) ?? null;
        waiting.get(key)?.forEach((resolve) => resolve(value));
      }
    } catch {
      for (const key of keys) waiting.get(key)?.forEach((resolve) => resolve(null));
    }
  };

  const loader: Loader<K, V> = {
    load(key: K): Promise<V | null> {
      return new Promise((resolve) => {
        if (!resolvers.has(key)) {
          pending.push(key);
          resolvers.set(key, []);
        }
        resolvers.get(key)!.push(resolve);
        if (!scheduled) {
          scheduled = true;
          Promise.resolve().then(flush);
        }
      });
    },
    loadMany(keys: K[]) {
      return Promise.all(keys.map((k) => loader.load(k)));
    },
  };

  return loader;
}

// Concrete loader for user_credits — batches concurrent per-user fetches
// into one SELECT WHERE user_id IN (...) rather than N separate SELECTs.
/** Concrete loader for user_credits — batches concurrent per-user fetches into one SELECT WHERE user_id IN (...). */
export function createCreditsLoader(supabaseAdmin: SupabaseClient) {
  return createBatchLoader<string, UserCreditsRow>(async (userIds) => {
    const { data } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .in('user_id', userIds);

    const map = new Map<string, UserCreditsRow>();
    for (const row of data ?? []) map.set(row.user_id, row as UserCreditsRow);
    return map;
  });
}
