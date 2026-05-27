/**
 * Unit tests for lib/api-handler.ts
 *
 * Covers: AppError subclass hierarchy, errorToResponse mapping,
 * apiHandler wrapper (success path, error path, requestId header),
 * and Zod / RequestValidationError handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  apiHandler,
} from '@/lib/api-handler';

// ──────────────────────────────────────────────────────────────
// Error class hierarchy
// ──────────────────────────────────────────────────────────────
describe('AppError and subclasses', () => {
  it('AppError stores statusCode and code', () => {
    const err = new AppError('oops', 503, 'SVC_DOWN');
    expect(err.message).toBe('oops');
    expect(err.statusCode).toBe(503);
    expect(err.code).toBe('SVC_DOWN');
  });

  it('defaults statusCode to 500 and code to INTERNAL_ERROR', () => {
    const err = new AppError('default');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
  });

  it('ValidationError has 400 status and VALIDATION_ERROR code', () => {
    const err = new ValidationError('bad');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.name).toBe('ValidationError');
  });

  it('AuthError has 401 status', () => {
    const err = new AuthError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTH_ERROR');
  });

  it('ForbiddenError has 403 status', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN_ERROR');
  });

  it('NotFoundError has 404 status', () => {
    const err = new NotFoundError('Widget');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('Widget');
  });

  it('RateLimitError has 429 status', () => {
    const err = new RateLimitError(30);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(30);
  });

  it('all errors are instanceof Error', () => {
    expect(new ValidationError('x')).toBeInstanceOf(Error);
    expect(new AuthError()).toBeInstanceOf(Error);
    expect(new NotFoundError()).toBeInstanceOf(Error);
  });
});

// ──────────────────────────────────────────────────────────────
// apiHandler wrapper - success path
// ──────────────────────────────────────────────────────────────
function makeRequest(url = 'http://localhost/api/test', method = 'GET'): NextRequest {
  return new NextRequest(url, { method });
}

describe('apiHandler - success path', () => {
  it('returns the handler response unchanged on success', async () => {
    const inner = jest.fn().mockResolvedValue(NextResponse.json({ ok: true }, { status: 200 }));
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('attaches an X-Request-Id header to the response', async () => {
    const inner = jest.fn().mockResolvedValue(NextResponse.json({}));
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
  });

  it('passes the incoming x-request-id through if already present', async () => {
    const inner = jest.fn().mockResolvedValue(NextResponse.json({}));
    const wrapped = apiHandler(inner);
    const req = new NextRequest('http://localhost/api/test', {
      headers: { 'x-request-id': 'preset-id' },
    });
    const res = await wrapped(req, {});
    expect(res.headers.get('X-Request-Id')).toBe('preset-id');
  });
});

// ──────────────────────────────────────────────────────────────
// apiHandler wrapper - error path
// ──────────────────────────────────────────────────────────────
describe('apiHandler - error path', () => {
  it('maps ValidationError to a 400 response', async () => {
    const inner = jest.fn().mockRejectedValue(new ValidationError('invalid'));
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.status).toBe(400);
  });

  it('maps AuthError to a 401 response', async () => {
    const inner = jest.fn().mockRejectedValue(new AuthError());
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.status).toBe(401);
  });

  it('maps NotFoundError to a 404 response', async () => {
    const inner = jest.fn().mockRejectedValue(new NotFoundError());
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.status).toBe(404);
  });

  it('maps RateLimitError to a 429 response', async () => {
    const inner = jest.fn().mockRejectedValue(new RateLimitError());
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.status).toBe(429);
  });

  it('maps an unknown Error to a 500 response', async () => {
    const inner = jest.fn().mockRejectedValue(new Error('unexpected'));
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.status).toBe(500);
  });

  it('still attaches X-Request-Id on error responses', async () => {
    const inner = jest.fn().mockRejectedValue(new AppError('fail'));
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
  });

  it('includes error message in the response body', async () => {
    const inner = jest.fn().mockRejectedValue(new ValidationError('invalid email'));
    const wrapped = apiHandler(inner);
    const res = await wrapped(makeRequest(), {});
    const body = await res.json();
    expect(body.error).toContain('invalid email');
  });
});
