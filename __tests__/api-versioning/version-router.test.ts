/** @jest-environment node */
// NextRequest requires the Web Fetch API (Request global). Node 18+ provides it; jsdom does not.
import { NextRequest } from 'next/server';
import {
  detectVersion,
  isSupported,
  isDeprecated,
  convertV1ResumeToV2,
  convertV1DocumentToV2,
} from '@/lib/api-versioning';

function req(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, { headers });
}

// ---------------------------------------------------------------------------
// detectVersion — URL path (highest priority)
// ---------------------------------------------------------------------------
describe('detectVersion — URL path', () => {
  it('returns v1 for /api/v1/ prefix', () => {
    expect(detectVersion(req('http://localhost/api/v1/health'))).toBe('v1');
  });

  it('returns v1 for /api/v1 without trailing slash', () => {
    expect(detectVersion(req('http://localhost/api/v1'))).toBe('v1');
  });

  it('returns v2 for /api/v2/ prefix', () => {
    expect(detectVersion(req('http://localhost/api/v2/documents'))).toBe('v2');
  });

  it('returns v2 for /api/v2 without trailing slash', () => {
    expect(detectVersion(req('http://localhost/api/v2'))).toBe('v2');
  });

  it('returns v2 (default) for unversioned path', () => {
    expect(detectVersion(req('http://localhost/api/health'))).toBe('v2');
  });
});

// ---------------------------------------------------------------------------
// detectVersion — API-Version header (second priority)
// ---------------------------------------------------------------------------
describe('detectVersion — API-Version header', () => {
  it('reads bare number "1"', () => {
    expect(detectVersion(req('http://localhost/api/health', { 'API-Version': '1' }))).toBe('v1');
  });

  it('reads "v1" with prefix', () => {
    expect(detectVersion(req('http://localhost/api/health', { 'API-Version': 'v1' }))).toBe('v1');
  });

  it('reads "2" as v2', () => {
    expect(detectVersion(req('http://localhost/api/health', { 'API-Version': '2' }))).toBe('v2');
  });

  it('falls back to v2 for unsupported header value', () => {
    expect(detectVersion(req('http://localhost/api/health', { 'API-Version': '99' }))).toBe('v2');
  });

  it('URL path takes priority over header', () => {
    // Path says v1, header says v2 → path wins
    expect(
      detectVersion(req('http://localhost/api/v1/health', { 'API-Version': '2' }))
    ).toBe('v1');
  });
});

// ---------------------------------------------------------------------------
// detectVersion — query param (third priority)
// ---------------------------------------------------------------------------
describe('detectVersion — query param', () => {
  it('reads ?api_version=1', () => {
    expect(detectVersion(req('http://localhost/api/health?api_version=1'))).toBe('v1');
  });

  it('reads ?api_version=v2', () => {
    expect(detectVersion(req('http://localhost/api/health?api_version=v2'))).toBe('v2');
  });

  it('header takes priority over query param', () => {
    expect(
      detectVersion(req('http://localhost/api/health?api_version=1', { 'API-Version': '2' }))
    ).toBe('v2');
  });
});

// ---------------------------------------------------------------------------
// isSupported / isDeprecated
// ---------------------------------------------------------------------------
describe('isSupported', () => {
  it('returns true for v1', () => expect(isSupported('v1')).toBe(true));
  it('returns true for v2', () => expect(isSupported('v2')).toBe(true));
  it('returns false for v3 (unknown)', () => expect(isSupported('v3')).toBe(false));
  it('returns false for empty string', () => expect(isSupported('')).toBe(false));
});

describe('isDeprecated', () => {
  it('v1 is deprecated', () => expect(isDeprecated('v1')).toBe(true));
  it('v2 is not deprecated', () => expect(isDeprecated('v2')).toBe(false));
});

// ---------------------------------------------------------------------------
// convertV1ResumeToV2 — pure function, no I/O
// ---------------------------------------------------------------------------
describe('convertV1ResumeToV2', () => {
  it('maps personalInfo fields to flat name/email', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada Lovelace', email: 'ada@example.com' },
      jobTitle: 'Software Engineer',
    });
    expect(result.name).toBe('Ada Lovelace');
    expect(result.email).toBe('ada@example.com');
  });

  it('builds prompt from jobTitle', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Data Scientist',
    });
    expect(result.prompt).toContain('Data Scientist');
  });

  it('includes years of experience in prompt', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      yearsOfExperience: 5,
    });
    expect(result.prompt).toContain('5 years');
  });

  it('converts comma-separated skills string into prompt text', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      skills: 'TypeScript, React, Node.js',
    });
    expect(result.prompt).toContain('TypeScript');
    expect(result.prompt).toContain('React');
    expect(result.prompt).toContain('Node.js');
  });

  it('appends additionalContext at the end of the prompt', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      additionalContext: 'Focus on backend systems.',
    });
    expect(result.prompt).toContain('Focus on backend systems.');
  });

  it('omits empty skills gracefully', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      skills: '',
    });
    expect(result.prompt).not.toContain('Key skills');
  });

  it('omits whitespace-only skills without appending "Key skills: ."', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      skills: '   ,  ,  ',
    });
    expect(result.prompt).not.toContain('Key skills');
  });

  it('omits whitespace-only additionalContext', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      additionalContext: '   ',
    });
    expect(result.prompt).toBe('Create a professional resume for an Engineer position.');
  });

  it('passes through empty name and email strings (route layer enforces non-empty)', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: '', email: '' },
      jobTitle: 'Engineer',
    });
    expect(result.name).toBe('');
    expect(result.email).toBe('');
  });

  it('passes through empty jobTitle string (route layer enforces non-empty)', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: '',
    });
    expect(result.prompt).toContain('Create a professional resume for a');
    expect(result.name).toBe('Ada');
    expect(result.email).toBe('ada@example.com');
  });

  it('throws when personalInfo is null (route layer prevents this reaching the converter)', () => {
    expect(() =>
      convertV1ResumeToV2({ personalInfo: null as never, jobTitle: 'Engineer' })
    ).toThrow();
  });

  it('ignores non-string skills value without throwing', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      skills: 123 as never,
    });
    expect(result.prompt).not.toContain('Key skills');
  });

  it('ignores non-string additionalContext value without throwing', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 'Ada', email: 'ada@example.com' },
      jobTitle: 'Engineer',
      additionalContext: { note: 'x' } as never,
    });
    expect(result.prompt).toBe('Create a professional resume for an Engineer position.');
  });

  it('passes through numeric name/email (isNonEmptyString guard in route catches non-strings before converter)', () => {
    const result = convertV1ResumeToV2({
      personalInfo: { name: 42 as never, email: 'ada@example.com' },
      jobTitle: 'Engineer',
    });
    expect(result.name).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// convertV1DocumentToV2 — pure function, no I/O
// ---------------------------------------------------------------------------
describe('convertV1DocumentToV2', () => {
  it('renames name → title and type → documentType', () => {
    const result = convertV1DocumentToV2({ name: 'My Doc', type: 'resume' });
    expect(result.title).toBe('My Doc');
    expect(result.documentType).toBe('resume');
  });

  it('renames data → content when present', () => {
    const result = convertV1DocumentToV2({ name: 'X', type: 'y', data: { foo: 'bar' } });
    expect(result.content).toEqual({ foo: 'bar' });
  });

  it('renames tags → metadata when present', () => {
    const result = convertV1DocumentToV2({ name: 'X', type: 'y', tags: { env: 'prod' } });
    expect(result.metadata).toEqual({ env: 'prod' });
  });

  it('renames parts → sections when present', () => {
    const result = convertV1DocumentToV2({ name: 'X', type: 'y', parts: [1, 2] });
    expect(result.sections).toEqual([1, 2]);
  });

  it('does not include undefined optional fields in output', () => {
    const result = convertV1DocumentToV2({ name: 'X', type: 'y' });
    expect(result).not.toHaveProperty('content');
    expect(result).not.toHaveProperty('metadata');
    expect(result).not.toHaveProperty('sections');
  });

  it('passes through empty name string (route layer enforces non-empty)', () => {
    const result = convertV1DocumentToV2({ name: '', type: 'resume' });
    expect(result.title).toBe('');
    expect(result.documentType).toBe('resume');
  });

  it('passes through empty type string (route layer enforces non-empty)', () => {
    const result = convertV1DocumentToV2({ name: 'My Doc', type: '' });
    expect(result.title).toBe('My Doc');
    expect(result.documentType).toBe('');
  });

  it('throws when body is null (route layer prevents this reaching the converter)', () => {
    expect(() => convertV1DocumentToV2(null as never)).toThrow();
  });

  it('passes through numeric name (isNonEmptyString guard in route catches non-strings before converter)', () => {
    const result = convertV1DocumentToV2({ name: 99 as never, type: 'resume' });
    expect(result.title).toBe(99);
  });
});
