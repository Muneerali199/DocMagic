/** @jest-environment node */
// NextResponse requires the Web Fetch API (Response global). Node 18+ provides it; jsdom does not.
import { NextResponse } from 'next/server';
import { addDeprecationHeaders, getDeprecationHeaderMap } from '@/lib/api-versioning';
import { VERSION_CONFIGS } from '@/lib/api-versioning';

function makeResponse(): NextResponse {
  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// getDeprecationHeaderMap — plain object, no Response needed
// ---------------------------------------------------------------------------
describe('getDeprecationHeaderMap — v1', () => {
  const headers = getDeprecationHeaderMap('v1');

  it('sets Deprecation: true', () => {
    expect(headers['Deprecation']).toBe('true');
  });

  it('sets Sunset to the configured sunset date at end-of-day UTC', () => {
    const expected = `${VERSION_CONFIGS.v1.sunsetDate}T23:59:59Z`;
    expect(headers['Sunset']).toBe(expected);
  });

  it('sets Warning with 299 code and migration URL', () => {
    expect(headers['Warning']).toMatch(/^299 /);
    expect(headers['Warning']).toContain(VERSION_CONFIGS.v1.migrationGuideUrl);
  });

  it('sets Link with rel="deprecation" pointing to migration guide', () => {
    expect(headers['Link']).toContain('rel="deprecation"');
    expect(headers['Link']).toContain(VERSION_CONFIGS.v1.migrationGuideUrl);
  });

  it('sets X-API-Version: v1', () => {
    expect(headers['X-API-Version']).toBe('v1');
  });

  it('sets X-API-Deprecated: true', () => {
    expect(headers['X-API-Deprecated']).toBe('true');
  });

  it('sets X-API-Sunset to the plain date', () => {
    expect(headers['X-API-Sunset']).toBe(VERSION_CONFIGS.v1.sunsetDate);
  });
});

// ---------------------------------------------------------------------------
// addDeprecationHeaders — mutates a real NextResponse
// ---------------------------------------------------------------------------
describe('addDeprecationHeaders — v1 response', () => {
  let response: NextResponse;

  beforeEach(() => {
    response = addDeprecationHeaders(makeResponse(), 'v1');
  });

  it('returns the same response object (mutates in place)', () => {
    const original = makeResponse();
    const returned = addDeprecationHeaders(original, 'v1');
    expect(returned).toBe(original);
  });

  it('adds Deprecation header', () => {
    expect(response.headers.get('Deprecation')).toBe('true');
  });

  it('adds Sunset header', () => {
    expect(response.headers.get('Sunset')).toBe(`${VERSION_CONFIGS.v1.sunsetDate}T23:59:59Z`);
  });

  it('adds Warning header with 299 code', () => {
    expect(response.headers.get('Warning')).toMatch(/^299 /);
  });

  it('adds Link header with rel="deprecation"', () => {
    expect(response.headers.get('Link')).toContain('rel="deprecation"');
  });

  it('adds X-API-Version: v1', () => {
    expect(response.headers.get('X-API-Version')).toBe('v1');
  });

  it('adds X-API-Deprecated: true', () => {
    expect(response.headers.get('X-API-Deprecated')).toBe('true');
  });

  it('adds X-API-Sunset header', () => {
    expect(response.headers.get('X-API-Sunset')).toBe(VERSION_CONFIGS.v1.sunsetDate);
  });

  it('preserves the original response status and body', async () => {
    const res = addDeprecationHeaders(NextResponse.json({ data: 'test' }, { status: 201 }), 'v1');
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ data: 'test' });
  });
});

// ---------------------------------------------------------------------------
// getDeprecationHeaderMap — v2 returns empty object
// ---------------------------------------------------------------------------
describe('getDeprecationHeaderMap — v2', () => {
  it('returns an empty object for non-deprecated versions', () => {
    expect(getDeprecationHeaderMap('v2')).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// addDeprecationHeaders — v2 must NOT receive deprecation headers
// ---------------------------------------------------------------------------
describe('addDeprecationHeaders — v2 response (no-op)', () => {
  let response: NextResponse;

  beforeEach(() => {
    response = addDeprecationHeaders(makeResponse(), 'v2');
  });

  it('does not add Deprecation header', () => {
    expect(response.headers.get('Deprecation')).toBeNull();
  });

  it('does not add Sunset header', () => {
    expect(response.headers.get('Sunset')).toBeNull();
  });

  it('does not add Warning header', () => {
    expect(response.headers.get('Warning')).toBeNull();
  });

  it('does not add Link header', () => {
    expect(response.headers.get('Link')).toBeNull();
  });

  it('does not add X-API-Deprecated header', () => {
    expect(response.headers.get('X-API-Deprecated')).toBeNull();
  });

  it('does not add X-API-Sunset header', () => {
    expect(response.headers.get('X-API-Sunset')).toBeNull();
  });
});
