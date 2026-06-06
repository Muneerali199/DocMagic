import {
  sanitizeHtml,
  sanitizeInput,
  detectSqlInjection,
  emailSchema,
  passwordSchema,
  validateAndSanitize,
  resumeGenerationSchema,
  LIMITS,
} from '../validation';

describe('sanitizeHtml', () => {
  it('escapes <script>', () =>
    expect(sanitizeHtml('<script>alert(1)</script>')).not.toContain('<script>'));
  it('escapes quotes', () => expect(sanitizeHtml('"hi"')).toBe('&quot;hi&quot;'));
  it('leaves plain text', () => expect(sanitizeHtml('Hello')).toBe('Hello'));
});

describe('sanitizeInput', () => {
  it('trims', () => expect(sanitizeInput('  hi  ')).toBe('hi'));
  it('removes null bytes', () => expect(sanitizeInput('a\0b')).toBe('ab'));
  it('truncates', () =>
    expect(sanitizeInput('a'.repeat(20000)).length).toBe(LIMITS.CONTENT_MAX));
});

describe('detectSqlInjection', () => {
  it('detects UNION SELECT', () =>
    expect(detectSqlInjection("' UNION SELECT * FROM users")).toBe(true));
  it('detects DROP TABLE', () =>
    expect(detectSqlInjection("'; DROP TABLE users;")).toBe(true));
  it('allows normal text', () => expect(detectSqlInjection('Hello Alice')).toBe(false));
});

describe('emailSchema', () => {
  it('accepts valid', () => expect(emailSchema.safeParse('a@b.com').success).toBe(true));
  it('rejects invalid', () => expect(emailSchema.safeParse('notanemail').success).toBe(false));
});

describe('passwordSchema', () => {
  it('accepts strong', () =>
    expect(passwordSchema.safeParse('Test1passwd').success).toBe(true));
  it('rejects short', () => expect(passwordSchema.safeParse('short').success).toBe(false));
  it('rejects no digit', () =>
    expect(passwordSchema.safeParse('NoDigitHere').success).toBe(false));
});

describe('validateAndSanitize', () => {
  it('returns valid data', () =>
    expect(() =>
      validateAndSanitize(resumeGenerationSchema, {
        prompt: 'A valid resume prompt for a software engineer',
        name: 'Alice',
        email: 'a@b.com',
      })
    ).not.toThrow());
  it('throws on invalid', () =>
    expect(() =>
      validateAndSanitize(resumeGenerationSchema, { prompt: 'x', name: '', email: 'bad' })
    ).toThrow('Validation failed'));
});
