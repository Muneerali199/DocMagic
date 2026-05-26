import { NextRequest } from 'next/server';
import {
  apiHandler,
  ValidationError,
  AuthError,
  NotFoundError,
  RateLimitError,
} from '../api-handler';

const req = () => new NextRequest('http://localhost/api/test', { method: 'GET' });

describe('apiHandler', () => {
  it('passes 200', async () => {
    const { NextResponse } = await import('next/server');
    const r = await apiHandler(async () => NextResponse.json({ ok: true }))(req(), {});
    expect(r.status).toBe(200);
  });

  it('adds X-Request-Id', async () => {
    const { NextResponse } = await import('next/server');
    const r = await apiHandler(async () => NextResponse.json({}))(req(), {});
    expect(r.headers.get('X-Request-Id')).toBeTruthy();
  });

  it('returns 400 for ValidationError', async () => {
    const r = await apiHandler(async () => { throw new ValidationError('bad'); })(req(), {});
    expect(r.status).toBe(400);
    expect((await r.json()).code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 for AuthError', async () => {
    expect(
      (await apiHandler(async () => { throw new AuthError(); })(req(), {})).status
    ).toBe(401);
  });

  it('returns 404 for NotFoundError', async () => {
    expect(
      (await apiHandler(async () => { throw new NotFoundError('Doc'); })(req(), {})).status
    ).toBe(404);
  });

  it('returns 429 for RateLimitError', async () => {
    const r = await apiHandler(async () => { throw new RateLimitError(30); })(req(), {});
    expect(r.status).toBe(429);
    expect(r.headers.get('Retry-After')).toBe('30');
  });

  it('returns 500 for generic Error', async () => {
    expect(
      (await apiHandler(async () => { throw new Error('boom'); })(req(), {})).status
    ).toBe(500);
  });
});
