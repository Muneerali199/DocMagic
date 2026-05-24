import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { incrementErrorCount, incrementRequestCount } from '@/app/api/metrics/route';
import { RequestValidationError } from '@/lib/validation';

/**
 * ==========================================
 * 🛡️ Centralized Custom Error Class System
 * ==========================================
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly context?: any;

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', isOperational = true, context?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 400, 'VALIDATION_FAILED', true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: any) {
    super(message, 401, 'AUTHENTICATION_FAILED', true, context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', context?: any) {
    super(message, 403, 'FORBIDDEN', true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', context?: any) {
    super(message, 404, 'NOT_FOUND', true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.', context?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context?: any) {
    super(message, 500, 'DATABASE_ERROR', false, context);
  }
}

export class AiServiceError extends AppError {
  constructor(message: string = 'AI Service provider error', context?: any) {
    super(message, 502, 'AI_SERVICE_FAILED', true, context);
  }
}

/**
 * ==========================================
 * 📊 In-Memory Tracking Store & Metrics
 * ==========================================
 */

export interface ErrorSummary {
  id: string;
  name: string;
  message: string;
  stack?: string;
  errorCode: string;
  statusCode: number;
  count: number;
  firstSeen: string;
  lastSeen: string;
  endpoints: string[];
  resolved: boolean;
}

export interface EndpointSummary {
  path: string;
  requests: number;
  errors: number;
  errorRate: number;
  avgDurationMs: number;
}

// Global in-memory metrics database
const errorMetricsStore = new Map<string, ErrorSummary>();
const endpointMetricsStore = new Map<string, { requests: number; errors: number; totalDurationMs: number }>();
const recentErrorsList: any[] = [];
const requestRollingWindow: { success: boolean; timestamp: number }[] = [];
const ROLLING_WINDOW_MS = 60 * 1000; // 1 minute window for alert rules

/**
 * Safely updates rolling request window for real-time alerting.
 */
function recordRollingRequest(success: boolean) {
  const now = Date.now();
  requestRollingWindow.push({ success, timestamp: now });
  
  // Prune entries older than window
  while (requestRollingWindow.length > 0 && requestRollingWindow[0].timestamp < now - ROLLING_WINDOW_MS) {
    requestRollingWindow.shift();
  }
  
  // Evaluate alert rule: error rate > 5% in rolling window (minimum 20 requests to avoid false positives)
  const windowRequests = requestRollingWindow.length;
  if (windowRequests >= 20) {
    const windowErrors = requestRollingWindow.filter(r => !r.success).length;
    const errorRate = (windowErrors / windowRequests) * 100;
    
    if (errorRate > 5.0) {
      dispatchSpikeAlert(errorRate, windowRequests, windowErrors);
    }
  }
}

/**
 * ==========================================
 * 🚨 Alerting & Notification Engine
 * ==========================================
 */

/**
 * Dispatches real-time alerts for critical errors.
 * Groups duplicate errors to prevent alert noise.
 */
export async function dispatchErrorAlert(errorDetails: any) {
  const isCritical = errorDetails.statusCode >= 500;
  if (!isCritical) return; // Alert only on critical errors

  // In production, this would route to Sentry, PagerDuty, Slack, or Email
  const alertPayload = {
    title: `🚨 CRITICAL EXCEPTION: [${errorDetails.errorCode}] ${errorDetails.message}`,
    environment: process.env.NODE_ENV || 'development',
    requestId: errorDetails.requestId,
    endpoint: `${errorDetails.method} ${errorDetails.path}`,
    userId: errorDetails.userId || 'anonymous',
    stackTrace: errorDetails.stack || 'No stack trace available',
    timestamp: new Date().toISOString(),
  };

  // Mock Slack and Email alert routing
  logger.warn(null, 'ALERT_DISPATCHER', {
    channel: '#ops-alerts',
    msg: alertPayload.title,
    metadata: alertPayload,
  });

  // If Slack Webhook is configured
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*${alertPayload.title}*\n*Endpoint:* ${alertPayload.endpoint}\n*Request ID:* \`${alertPayload.requestId}\`\n*Environment:* \`${alertPayload.environment}\``,
        }),
      });
    } catch (e) {
      logger.error(null, 'Failed to dispatch Slack alert', e);
    }
  }
}

/**
 * Dispatches a spike alert when error rate threshold (5%) is breached.
 */
function dispatchSpikeAlert(rate: number, total: number, errors: number) {
  logger.error(null, `🔥 SYSTEM SPIKE ALERT: Error rate is ${rate.toFixed(2)}% (${errors}/${total} requests failed in the last minute)`, {
    rate,
    total,
    errors,
    timestamp: new Date().toISOString()
  });
}

/**
 * ==========================================
 * 🎯 Exception Capture & Logging
 * ==========================================
 */

export function captureException(error: any, requestContext: {
  requestId: string;
  path: string;
  method: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}) {
  const name = error.name || 'Error';
  const message = error.message || 'An unexpected error occurred';
  const stack = error.stack;
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const errorCode = error instanceof AppError ? error.errorCode : 'INTERNAL_SERVER_ERROR';
  const context = error instanceof AppError ? error.context : undefined;

  const errorDetails = {
    id: `${name}-${errorCode}-${requestContext.path}`,
    name,
    message,
    stack,
    errorCode,
    statusCode,
    ...requestContext,
    context,
    timestamp: new Date().toISOString()
  };

  // 1. Log JSON output in production, readable pretty log in development
  logger.error({ requestId: requestContext.requestId, userId: requestContext.userId }, `[${errorCode}] ${message}`, {
    stack: stack?.split('\n').slice(0, 5).join('\n'), // Avoid excessively long logs
    ...requestContext,
    context
  });

  // 2. central Sentry Hook (gracefully falls back if DSN is not set)
  try {
    // Dynamic import to avoid crash if sentry is not initialized
    const Sentry = require('@sentry/nextjs');
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.withScope((scope: any) => {
        scope.setTag('requestId', requestContext.requestId);
        if (requestContext.userId) scope.setUser({ id: requestContext.userId });
        scope.setExtra('path', requestContext.path);
        scope.setExtra('method', requestContext.method);
        scope.setExtra('context', context);
        Sentry.captureException(error);
      });
    }
  } catch {
    // Sentry SDK not installed or DSN absent, ignore silently
  }

  // 3. Track error in our in-memory summary stats
  const existing = errorMetricsStore.get(errorDetails.id);
  if (existing) {
    existing.count++;
    existing.lastSeen = errorDetails.timestamp;
    if (!existing.endpoints.includes(requestContext.path)) {
      existing.endpoints.push(requestContext.path);
    }
  } else {
    errorMetricsStore.set(errorDetails.id, {
      id: errorDetails.id,
      name,
      message,
      stack,
      errorCode,
      statusCode,
      count: 1,
      firstSeen: errorDetails.timestamp,
      lastSeen: errorDetails.timestamp,
      endpoints: [requestContext.path],
      resolved: false,
    });
  }

  // Add to rolling chronological log (max 100 entries to prevent memory leaks)
  recentErrorsList.unshift(errorDetails);
  if (recentErrorsList.length > 100) {
    recentErrorsList.pop();
  }

  // 4. Alert Routing
  dispatchErrorAlert(errorDetails);

  return errorDetails;
}

/**
 * ==========================================
 * ⚡ Next.js API Route Wrapper Middleware
 * ==========================================
 */

type ApiHandler = (
  request: NextRequest,
  ...args: any[]
) => Promise<NextResponse | Response> | NextResponse | Response;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const requestId = getRequestId(request.headers);
    const path = request.nextUrl.pathname;
    const method = request.method;
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Parse user ID from request headers if set by upstream auth middleware
    const userId = request.headers.get('x-user-id') || undefined;

    const requestContext = {
      requestId,
      path,
      method,
      userId,
      ip,
      userAgent,
    };

    incrementRequestCount();

    try {
      // Execute the actual handler
      const response = await handler(request, ...args);
      
      const durationMs = Date.now() - startTime;
      
      // Update endpoint metrics for success
      const currentStats = endpointMetricsStore.get(path) || { requests: 0, errors: 0, totalDurationMs: 0 };
      endpointMetricsStore.set(path, {
        requests: currentStats.requests + 1,
        errors: currentStats.errors,
        totalDurationMs: currentStats.totalDurationMs + durationMs,
      });

      recordRollingRequest(true);

      // Append tracing request headers to client response
      response.headers.set('x-request-id', requestId);
      return response;

    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      incrementErrorCount();
      recordRollingRequest(false);

      // Update endpoint metrics for error
      const currentStats = endpointMetricsStore.get(path) || { requests: 0, errors: 0, totalDurationMs: 0 };
      endpointMetricsStore.set(path, {
        requests: currentStats.requests + 1,
        errors: currentStats.errors + 1,
        totalDurationMs: currentStats.totalDurationMs + durationMs,
      });

      if (error instanceof RequestValidationError) {
        const response = NextResponse.json(
          { error: error.message, details: error.details, requestId },
          { status: 400 },
        );
        response.headers.set('x-request-id', requestId);
        return response;
      }

      // Capture and track exception details
      const caughtDetails = captureException(error, requestContext);

      // Standardized production-grade error response
      const isOperational = error instanceof AppError && error.isOperational;
      
      // Sanitized message for production users
      const publicMessage = isOperational 
        ? error.message 
        : 'An internal server error occurred. Please contact support with the Request ID.';

      const errorPayload = {
        success: false,
        error: {
          code: caughtDetails.errorCode,
          message: publicMessage,
          requestId: caughtDetails.requestId,
          timestamp: caughtDetails.timestamp,
          // Expose details only in non-production
          details: process.env.NODE_ENV !== 'production' ? caughtDetails.message : undefined,
        }
      };

      const response = NextResponse.json(errorPayload, {
        status: caughtDetails.statusCode,
      });

      // Append request-id for trace correlation
      response.headers.set('x-request-id', requestId);
      return response;
    }
  };
}

/**
 * ==========================================
 * 🔍 Dashboard Data Fetching Helpers
 * ==========================================
 */

export function getErrorSummaries(): ErrorSummary[] {
  return Array.from(errorMetricsStore.values());
}

export function getEndpointSummaries(): EndpointSummary[] {
  return Array.from(endpointMetricsStore.entries()).map(([path, stats]) => {
    return {
      path,
      requests: stats.requests,
      errors: stats.errors,
      errorRate: stats.requests > 0 ? (stats.errors / stats.requests) * 100 : 0,
      avgDurationMs: stats.requests > 0 ? stats.totalDurationMs / stats.requests : 0,
    };
  });
}

export function getRecentErrors(): any[] {
  return recentErrorsList;
}

export function resetDashboardStats() {
  errorMetricsStore.clear();
  endpointMetricsStore.clear();
  recentErrorsList.length = 0;
}
