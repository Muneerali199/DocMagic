import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import { 
  getErrorSummaries, 
  getEndpointSummaries, 
  getRecentErrors, 
  resetDashboardStats,
  withErrorHandling 
} from '@/lib/error-handler';

export const dynamic = 'force-dynamic';

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // Handle actions, e.g., reset metrics for clean audit runs
  if (request.method === 'POST' && action === 'reset') {
    resetDashboardStats();
    return NextResponse.json({
      success: true,
      message: 'Dashboard metrics successfully cleared.',
      timestamp: new Date().toISOString(),
    });
  }

  // Get compiled stats from our global in-memory metrics store
  const errorSummaries = getErrorSummaries();
  const endpointSummaries = getEndpointSummaries();
  const recentErrors = getRecentErrors();

  // Aggregate totals
  const totalRequests = endpointSummaries.reduce((sum, e) => sum + e.requests, 0);
  const totalErrors = endpointSummaries.reduce((sum, e) => sum + e.errors, 0);
  const globalErrorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  // Compile system statistics
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const loadAverage = os.loadavg();

  const dashboardData = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    system: {
      uptimeSeconds: uptime,
      memoryBytes: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      loadAverage1m: loadAverage[0],
      loadAverage5m: loadAverage[1],
      loadAverage15m: loadAverage[2],
    },
    metrics: {
      totalRequestsProcessed: totalRequests,
      totalErrorsLogged: totalErrors,
      globalErrorRatePercentage: parseFloat(globalErrorRate.toFixed(2)),
    },
    endpoints: endpointSummaries.sort((a, b) => b.errors - a.errors), // Prioritize highest error count
    groupedErrors: errorSummaries.sort((a, b) => b.count - a.count), // Prioritize highest frequency
    recentErrors: recentErrors.slice(0, 10), // Return top 10 most recent errors
  };

  return NextResponse.json(dashboardData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

// Wrap the dashboard with the same error handler for ultimate consistency
export const GET = withErrorHandling(handler);
export const POST = withErrorHandling(handler);
