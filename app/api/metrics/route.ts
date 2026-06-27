import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory metrics store
// Note: In serverless environments, this resets on every function cold start.
// For the backend/go-migration work, this serves as a baseline interface.
const metrics = {
  startTime: Date.now(),
  requestCount: 0,
  errorCount: 0,
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Metrics endpoint requires authentication (OWASP A01 - Broken Access Control)
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required to access metrics' },
      { status: 401 }
    );
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 503 }
    );
  }
  const uptime = Math.floor((Date.now() - metrics.startTime) / 1000);
  const memoryUsage = process.memoryUsage();
  
  // Prometheus compatible format
  const output = [
    '# HELP node_uptime_seconds The uptime of the process in seconds',
    '# TYPE node_uptime_seconds gauge',
    `node_uptime_seconds ${uptime}`,
    
    '# HELP node_memory_usage_bytes Memory usage in bytes',
    '# TYPE node_memory_usage_bytes gauge',
    `node_memory_usage_bytes{type="rss"} ${memoryUsage.rss}`,
    `node_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}`,
    `node_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}`,
    `node_memory_usage_bytes{type="external"} ${memoryUsage.external}`,
    
    '# HELP node_load_average Load average for 1, 5, and 15 minutes',
    '# TYPE node_load_average gauge',
    `node_load_average{period="1m"} ${os.loadavg()[0]}`,
    `node_load_average{period="5m"} ${os.loadavg()[1]}`,
    `node_load_average{period="15m"} ${os.loadavg()[2]}`,
    
    '# HELP app_requests_total Total number of requests processed by this instance',
    '# TYPE app_requests_total counter',
    `app_requests_total ${metrics.requestCount}`,
    
    '# HELP app_errors_total Total number of errors processed by this instance',
    '# TYPE app_errors_total counter',
    `app_errors_total ${metrics.errorCount}`,
  ].join('\n');

  return new Response(output, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  });
}

// Helper to increment metrics (to be used in other routes)
export function incrementRequestCount() {
  metrics.requestCount++;
}

export function incrementErrorCount() {
  metrics.errorCount++;
}
