/**
 * app/api/health/route.ts — Fix #18 (real health check)
 */
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

type SS = 'healthy' | 'degraded' | 'unhealthy';
interface HR { status: SS; latencyMs?: number; error?: string; }

async function checkDb(): Promise<HR> {
  const t = Date.now();
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { status: 'unhealthy', error: 'Supabase env vars missing' };
    const sb = createClient(url, key);
    const { error } = await sb.from('documents').select('id').limit(1);
    if (error && error.code !== 'PGRST116')
      return { status: 'degraded', latencyMs: Date.now() - t, error: error.message };
    return { status: 'healthy', latencyMs: Date.now() - t };
  } catch (e) {
    return { status: 'unhealthy', latencyMs: Date.now() - t, error: (e as Error).message };
  }
}

function checkEnv(): HR {
  const req = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ];
  const miss = req.filter((k) => !process.env[k]);
  return miss.length
    ? { status: 'unhealthy', error: `Missing: ${miss.join(', ')}` }
    : { status: 'healthy' };
}

function checkMem(): HR {
  const mb = process.memoryUsage().heapUsed / 1024 / 1024;
  return mb > 512
    ? { status: 'degraded', error: `High heap: ${mb.toFixed(0)}MB` }
    : { status: 'healthy' };
}

export async function GET() {
  const t = Date.now();
  try {
    const [db, env, mem] = await Promise.all([
      checkDb(),
      Promise.resolve(checkEnv()),
      Promise.resolve(checkMem()),
    ]);
    const services = { database: db, environment: env, memory: mem };
    const ss = Object.values(services).map((s) => s.status);
    const overall: SS = ss.includes('unhealthy')
      ? 'unhealthy'
      : ss.includes('degraded')
      ? 'degraded'
      : 'healthy';
    if (overall !== 'healthy') logger.warn({ route: '/api/health' }, `Health: ${overall}`);
    return NextResponse.json(
      {
        status: overall,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV,
        memory: { heapUsedMb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1) },
        services,
        responseTimeMs: Date.now() - t,
      },
      {
        status: overall === 'unhealthy' ? 503 : 200,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  } catch (e) {
    return NextResponse.json({ status: 'unhealthy', error: (e as Error).message }, { status: 503 });
  }
}
