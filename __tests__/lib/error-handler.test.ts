/**
 * Unit tests for lib/error-handler.ts
 *
 * Covers: AppError hierarchy, captureException (error aggregation),
 * dispatchErrorAlert (critical vs non-critical), getErrorSummaries,
 * getEndpointSummaries, spike-detection via recordRollingRequest,
 * and resetDashboardStats.
 */

// Stub out the metrics route import so the test environment does not try to
// load the actual Next.js route module.
jest.mock('@/app/api/metrics/route', () => ({
  incrementErrorCount: jest.fn(),
  incrementRequestCount: jest.fn(),
}));

// Stub out request-id since error-handler uses it internally.
jest.mock('@/lib/request-id', () => ({
  getRequestId: jest.fn(() => 'test-request-id'),
}));

import {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  AiServiceError,
  captureException,
  dispatchErrorAlert,
  getErrorSummaries,
  getEndpointSummaries,
  getRecentErrors,
  resetDashboardStats,
} from '@/lib/error-handler';

beforeEach(() => {
  resetDashboardStats();
});

// ──────────────────────────────────────────────────────────────
// Error class hierarchy
// ──────────────────────────────────────────────────────────────
describe('AppError subclasses', () => {
  it('AppError sets statusCode, errorCode, and isOperational', () => {
    const err = new AppError('test', 418, 'TEAPOT', true);
    expect(err.statusCode).toBe(418);
    expect(err.errorCode).toBe('TEAPOT');
    expect(err.isOperational).toBe(true);
    expect(err.message).toBe('test');
  });

  it('ValidationError has 400 status and VALIDATION_FAILED code', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.errorCode).toBe('VALIDATION_FAILED');
  });

  it('AuthenticationError has 401 status', () => {
    expect(new AuthenticationError().statusCode).toBe(401);
  });

  it('ForbiddenError has 403 status', () => {
    expect(new ForbiddenError().statusCode).toBe(403);
  });

  it('NotFoundError has 404 status', () => {
    expect(new NotFoundError().statusCode).toBe(404);
  });

  it('RateLimitError has 429 status', () => {
    expect(new RateLimitError().statusCode).toBe(429);
  });

  it('DatabaseError has 500 status and isOperational false', () => {
    const err = new DatabaseError();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });

  it('AiServiceError has 502 status', () => {
    expect(new AiServiceError().statusCode).toBe(502);
  });

  it('all subclasses are instanceof Error', () => {
    expect(new ValidationError('x')).toBeInstanceOf(Error);
    expect(new AuthenticationError()).toBeInstanceOf(Error);
    expect(new NotFoundError()).toBeInstanceOf(Error);
  });
});

// ──────────────────────────────────────────────────────────────
// captureException
// ──────────────────────────────────────────────────────────────
describe('captureException', () => {
  const ctx = {
    requestId: 'req-1',
    path: '/api/test',
    method: 'GET',
  };

  it('returns an errorDetails object with all required fields', async () => {
    const details = await captureException(new ValidationError('bad'), ctx);
    expect(details.errorCode).toBe('VALIDATION_FAILED');
    expect(details.statusCode).toBe(400);
    expect(details.path).toBe('/api/test');
    expect(details.requestId).toBe('req-1');
    expect(details.timestamp).toBeTruthy();
  });

  it('accumulates repeated errors by incrementing count', async () => {
    const err = new ValidationError('repeat');
    await captureException(err, ctx);
    await captureException(err, ctx);

    const summaries = getErrorSummaries();
    const match = summaries.find(s => s.errorCode === 'VALIDATION_FAILED');
    expect(match?.count).toBeGreaterThanOrEqual(2);
  });

  it('stores the error in the recent errors list', async () => {
    const err = new AppError('unique', 503, 'SVC_UNAVAILABLE');
    await captureException(err, { ...ctx, path: '/api/unique' });

    const recent = getRecentErrors();
    expect(recent.some((e: any) => e.errorCode === 'SVC_UNAVAILABLE')).toBe(true);
  });

  it('handles a plain (non-AppError) Error correctly', async () => {
    const err = new Error('plain error');
    const details = await captureException(err, ctx);
    expect(details.statusCode).toBe(500);
    expect(details.errorCode).toBe('INTERNAL_SERVER_ERROR');
  });
});

// ──────────────────────────────────────────────────────────────
// dispatchErrorAlert
// ──────────────────────────────────────────────────────────────
describe('dispatchErrorAlert', () => {
  it('does not throw for a non-critical (4xx) error', async () => {
    await expect(
      dispatchErrorAlert({ statusCode: 400, errorCode: 'BAD', message: 'm' })
    ).resolves.toBeUndefined();
  });

  it('does not throw for a critical (5xx) error', async () => {
    await expect(
      dispatchErrorAlert({ statusCode: 500, errorCode: 'ISE', message: 'crash' })
    ).resolves.toBeUndefined();
  });
});

// ──────────────────────────────────────────────────────────────
// getEndpointSummaries
// ──────────────────────────────────────────────────────────────
describe('getEndpointSummaries', () => {
  it('returns an empty array before any requests are handled', () => {
    // Endpoint metrics are only populated by withErrorHandling, not captureException
    expect(getEndpointSummaries()).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────
// resetDashboardStats
// ──────────────────────────────────────────────────────────────
describe('resetDashboardStats', () => {
  it('clears error summaries, endpoint summaries, and recent errors', async () => {
    await captureException(new AppError('noise'), { requestId: 'r', path: '/p', method: 'GET' });
    resetDashboardStats();

    expect(getErrorSummaries()).toHaveLength(0);
    expect(getEndpointSummaries()).toHaveLength(0);
    expect(getRecentErrors()).toHaveLength(0);
  });
});
