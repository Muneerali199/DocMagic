/**
 * lib/async-utils.ts — Fix #4 (event-loop) + Fix #7 (pooling)
 *                      Fix #8 (serialization) + Fix #16 (timeouts)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Fix #16 — fetch with timeout
export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 30_000
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal });
    clearTimeout(t);
    return res;
  } catch (err: unknown) {
    clearTimeout(t);
    if (err instanceof Error && err.name === 'AbortError')
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    throw err;
  }
}

// Fix #7 — Supabase singleton (connection pool)
let _admin: SupabaseClient | null = null;

export function getAdminSupabaseClient(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars missing');
  _admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  logger.info(null, '[supabase] Admin client initialised (singleton)');
  return _admin;
}

// Fix #8 — safe / bounded JSON
const MAX_BYTES = 5 * 1024 * 1024;

export function safeJsonStringify(val: unknown, max = MAX_BYTES): string {
  let j: string;
  try {
    j = JSON.stringify(val);
  } catch (e) {
    throw new TypeError(`Serialize failed: ${(e as Error).message}`);
  }
  if (Buffer.byteLength(j, 'utf8') > max) throw new RangeError('Payload too large');
  return j;
}

export function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    logger.warn(null, '[safeJsonParse] Invalid JSON');
    return null;
  }
}

// Fix #4 — run sync CPU work off event loop
export function runAsync<T>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) =>
    setImmediate(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    })
  );
}

// Fix #16 — AI provider helper
export async function callAiEndpoint(
  url: string,
  body: unknown,
  headers: Record<string, string>,
  timeout = 60_000
): Promise<unknown> {
  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: safeJsonStringify(body),
    },
    timeout
  );
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`AI ${url} -> ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}
