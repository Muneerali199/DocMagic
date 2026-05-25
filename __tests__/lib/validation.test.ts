import {
  sanitizeHtml,
  sanitizeInput,
  detectSqlInjection,
  emailSchema,
  passwordSchema,
  nameSchema,
  promptSchema,
  registrationSchema,
  resumeGenerationSchema,
  presentationGenerationSchema,
  letterGenerationSchema,
  documentCreateSchema,
  paginationSchema,
  safeParseBody,
  validateAndSanitize,
  LIMITS,
} from '@/lib/validation';

// ---------------------------------------------------------------------------
// sanitizeHtml
// ---------------------------------------------------------------------------
describe('sanitizeHtml', () => {
  it('escapes ampersand', () => {
    expect(sanitizeHtml('a & b')).toBe('a &amp; b');
  });

  it('escapes less-than and greater-than', () => {
    expect(sanitizeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('escapes double quotes', () => {
    expect(sanitizeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeHtml("it's")).toBe("it&#x27;s");
  });

  it('escapes forward slashes', () => {
    expect(sanitizeHtml('a/b')).toBe('a&#x2F;b');
  });

  it('sanitizes a full script tag', () => {
    const input = '<script>alert("xss")</script>';
    const output = sanitizeHtml(input);
    expect(output).not.toContain('<');
    expect(output).not.toContain('>');
    expect(output).not.toContain('"');
    expect(output).toContain('&lt;script&gt;');
  });

  it('sanitizes event handler attribute injection', () => {
    const input = "<img src=x onerror='alert(1)'>";
    const output = sanitizeHtml(input);
    expect(output).not.toContain('<');
    expect(output).not.toContain('>');
    expect(output).not.toContain("'");
  });

  it('returns plain text unchanged (no special chars)', () => {
    expect(sanitizeHtml('Hello World')).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('escapes all entities in a combined string', () => {
    const input = `<a href="/path?q=1&r=2" onclick='do()'>click</a>`;
    const output = sanitizeHtml(input);
    expect(output).not.toMatch(/[<>"'\/]/);
    expect(output).toContain('&lt;');
    expect(output).toContain('&gt;');
    expect(output).toContain('&amp;');
    expect(output).toContain('&quot;');
  });
});

// ---------------------------------------------------------------------------
// sanitizeInput
// ---------------------------------------------------------------------------
describe('sanitizeInput', () => {
  it('removes null bytes', () => {
    expect(sanitizeInput('hel\0lo')).toBe('hello');
  });

  it('normalises CRLF to LF', () => {
    expect(sanitizeInput('line1\r\nline2')).toBe('line1\nline2');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('truncates to the default max (CONTENT_MAX)', () => {
    const long = 'a'.repeat(LIMITS.CONTENT_MAX + 100);
    expect(sanitizeInput(long).length).toBe(LIMITS.CONTENT_MAX);
  });

  it('truncates to a custom max', () => {
    const long = 'a'.repeat(50);
    expect(sanitizeInput(long, 10).length).toBe(10);
  });

  it('handles multi-byte unicode characters without corruption', () => {
    const emoji = '😀'.repeat(20);
    const result = sanitizeInput(emoji, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('removes multiple null bytes scattered in the string', () => {
    expect(sanitizeInput('a\0b\0c\0')).toBe('abc');
  });

  it('preserves newlines that are not part of CRLF', () => {
    expect(sanitizeInput('a\nb')).toBe('a\nb');
  });
});

// ---------------------------------------------------------------------------
// detectSqlInjection
// ---------------------------------------------------------------------------
describe('detectSqlInjection', () => {
  it('detects UNION SELECT', () => {
    expect(detectSqlInjection("' UNION SELECT password FROM users--")).toBe(true);
  });

  it('detects tautology OR 1=1', () => {
    expect(detectSqlInjection("' OR 1=1--")).toBe(true);
  });

  it('detects DROP TABLE with comment', () => {
    expect(detectSqlInjection("'; DROP TABLE users;--")).toBe(true);
  });

  it('detects SELECT ... FROM with trailing quote', () => {
    expect(detectSqlInjection("SELECT * FROM users WHERE id='1'")).toBe(true);
  });

  it('detects WAITFOR DELAY time-based injection', () => {
    expect(detectSqlInjection("'; WAITFOR DELAY '0:0:5'--")).toBe(true);
  });

  it('detects inline comment sequences', () => {
    expect(detectSqlInjection('admin/*comment*/--')).toBe(true);
  });

  it('returns false for a normal search query', () => {
    expect(detectSqlInjection('hello world how are you')).toBe(false);
  });

  it('returns false for an email address', () => {
    expect(detectSqlInjection('user@example.com')).toBe(false);
  });

  it('returns false for a URL', () => {
    expect(detectSqlInjection('https://example.com/path?q=test')).toBe(false);
  });

  it('is case-insensitive for SQL keywords', () => {
    expect(detectSqlInjection("' union select password from users--")).toBe(true);
    expect(detectSqlInjection("' Union All Select 1--")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------
describe('emailSchema', () => {
  it('accepts a valid email', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
  });

  it('rejects a string without @', () => {
    expect(emailSchema.safeParse('notanemail').success).toBe(false);
  });

  it('rejects an email exceeding EMAIL_MAX characters', () => {
    const long = 'a'.repeat(LIMITS.EMAIL_MAX) + '@b.com';
    expect(emailSchema.safeParse(long).success).toBe(false);
  });

  it('rejects an email with no TLD', () => {
    expect(emailSchema.safeParse('user@example').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts a valid password (upper, lower, digit)', () => {
    expect(passwordSchema.safeParse('Abcde1fgh').success).toBe(true);
  });

  it('rejects a password shorter than PASSWORD_MIN', () => {
    expect(passwordSchema.safeParse('Ab1').success).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    expect(passwordSchema.safeParse('abcde1fgh').success).toBe(false);
  });

  it('rejects a password with no digit', () => {
    expect(passwordSchema.safeParse('Abcdefghi').success).toBe(false);
  });

  it('rejects a password exceeding PASSWORD_MAX', () => {
    const long = 'Abcde1fgh' + 'a'.repeat(LIMITS.PASSWORD_MAX);
    expect(passwordSchema.safeParse(long).success).toBe(false);
  });
});

describe('nameSchema', () => {
  it('accepts a simple name', () => {
    expect(nameSchema.safeParse('John Doe').success).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(nameSchema.safeParse('').success).toBe(false);
  });

  it('rejects a name exceeding NAME_MAX characters', () => {
    const long = 'a'.repeat(LIMITS.NAME_MAX + 1);
    expect(nameSchema.safeParse(long).success).toBe(false);
  });

  it('rejects a name with disallowed characters', () => {
    expect(nameSchema.safeParse('Name<script>').success).toBe(false);
  });
});

describe('promptSchema', () => {
  it('accepts a valid prompt', () => {
    const p = 'a'.repeat(LIMITS.PROMPT_MIN);
    expect(promptSchema.safeParse(p).success).toBe(true);
  });

  it('rejects a prompt shorter than PROMPT_MIN', () => {
    expect(promptSchema.safeParse('short').success).toBe(false);
  });

  it('rejects a prompt exceeding PROMPT_MAX', () => {
    const long = 'a'.repeat(LIMITS.PROMPT_MAX + 1);
    expect(promptSchema.safeParse(long).success).toBe(false);
  });
});

describe('registrationSchema', () => {
  it('accepts valid registration data', () => {
    expect(
      registrationSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Secure1pass',
      }).success
    ).toBe(true);
  });

  it('rejects when email is missing', () => {
    expect(
      registrationSchema.safeParse({ name: 'Jane', password: 'Secure1pass' }).success
    ).toBe(false);
  });

  it('rejects when password is too weak', () => {
    expect(
      registrationSchema.safeParse({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'weak',
      }).success
    ).toBe(false);
  });
});

describe('resumeGenerationSchema', () => {
  it('accepts valid input', () => {
    expect(
      resumeGenerationSchema.safeParse({
        prompt: 'a'.repeat(LIMITS.PROMPT_MIN),
        name: 'John',
        email: 'john@example.com',
      }).success
    ).toBe(true);
  });

  it('rejects when prompt is too short', () => {
    expect(
      resumeGenerationSchema.safeParse({
        prompt: 'short',
        name: 'John',
        email: 'john@example.com',
      }).success
    ).toBe(false);
  });
});

describe('presentationGenerationSchema', () => {
  it('accepts a valid presentation request', () => {
    expect(
      presentationGenerationSchema.safeParse({ prompt: 'a'.repeat(LIMITS.PROMPT_MIN), pageCount: 10 }).success
    ).toBe(true);
  });

  it('rejects pageCount = 0', () => {
    expect(
      presentationGenerationSchema.safeParse({ prompt: 'a'.repeat(LIMITS.PROMPT_MIN), pageCount: 0 }).success
    ).toBe(false);
  });

  it('rejects pageCount > 100', () => {
    expect(
      presentationGenerationSchema.safeParse({ prompt: 'a'.repeat(LIMITS.PROMPT_MIN), pageCount: 101 }).success
    ).toBe(false);
  });

  it('rejects a prompt shorter than PROMPT_MIN', () => {
    expect(
      presentationGenerationSchema.safeParse({ prompt: 'short', pageCount: 5 }).success
    ).toBe(false);
  });
});

describe('letterGenerationSchema', () => {
  it('accepts a valid cover letter input', () => {
    expect(
      letterGenerationSchema.safeParse({
        jobDescription: 'a'.repeat(20),
        fromName: 'Jane Doe',
      }).success
    ).toBe(true);
  });

  it('rejects when required general letter fields are missing', () => {
    expect(
      letterGenerationSchema.safeParse({
        prompt: 'a'.repeat(LIMITS.PROMPT_MIN),
      }).success
    ).toBe(false);
  });

  it('rejects a jobDescription shorter than 20 characters', () => {
    expect(
      letterGenerationSchema.safeParse({ jobDescription: 'short', fromName: 'Jane' }).success
    ).toBe(false);
  });
});

describe('documentCreateSchema', () => {
  it('accepts a minimal valid document', () => {
    expect(
      documentCreateSchema.safeParse({ title: 'My Doc', documentType: 'resume' }).success
    ).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(
      documentCreateSchema.safeParse({ title: '', documentType: 'resume' }).success
    ).toBe(false);
  });

  it('rejects sections array with more than 100 items', () => {
    expect(
      documentCreateSchema.safeParse({
        title: 'Doc',
        documentType: 'resume',
        sections: Array(101).fill({}),
      }).success
    ).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('accepts valid limit and offset', () => {
    const r = paginationSchema.safeParse({ limit: 10, offset: 0 });
    expect(r.success).toBe(true);
  });

  it('applies defaults when fields are absent', () => {
    const r = paginationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.limit).toBe(50);
      expect(r.data.offset).toBe(0);
    }
  });

  it('rejects limit > 100', () => {
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('rejects negative offset', () => {
    expect(paginationSchema.safeParse({ limit: 10, offset: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// safeParseBody
// ---------------------------------------------------------------------------
describe('safeParseBody', () => {
  const makeRequest = (
    body: unknown,
    contentType = 'application/json',
    contentLength?: number
  ) => {
    const serialised = JSON.stringify(body);
    const headers: Record<string, string> = { 'Content-Type': contentType };
    if (contentLength !== undefined) headers['Content-Length'] = String(contentLength);
    return new Request('http://localhost', {
      method: 'POST',
      headers,
      body: serialised,
    });
  };

  it('parses and validates a valid JSON body', async () => {
    const req = makeRequest({ limit: 10, offset: 5 });
    const result = await safeParseBody(req, paginationSchema);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(5);
  });

  it('throws when Content-Type is not application/json', async () => {
    const req = makeRequest({ limit: 10 }, 'text/plain');
    await expect(safeParseBody(req, paginationSchema)).rejects.toThrow(
      'Invalid request body'
    );
  });

  it('throws when Content-Length exceeds MAX_BODY_BYTES', async () => {
    const req = {
      headers: {
        get: (h: string) => {
          if (h === 'content-type') return 'application/json';
          if (h === 'content-length') return String(LIMITS.MAX_BODY_BYTES + 1);
          return null;
        },
      },
      json: async () => ({}),
    } as unknown as Request;
    await expect(safeParseBody(req, paginationSchema)).rejects.toThrow('Request body too large');
  });

  it('throws on malformed JSON', async () => {
    const req = {
      headers: {
        get: (h: string) =>
          h === 'content-type' ? 'application/json' : null,
      },
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    } as unknown as Request;
    await expect(safeParseBody(req, paginationSchema)).rejects.toThrow('Invalid JSON payload');
  });

  it('throws when schema validation fails', async () => {
    const req = makeRequest({ limit: 9999 });
    await expect(safeParseBody(req, paginationSchema)).rejects.toThrow('Invalid request body');
  });
});

// ---------------------------------------------------------------------------
// validateAndSanitize
// ---------------------------------------------------------------------------
describe('validateAndSanitize', () => {
  it('returns parsed data for valid input', () => {
    const result = validateAndSanitize(paginationSchema, { limit: 20, offset: 0 });
    expect(result.limit).toBe(20);
  });

  it('throws for invalid input', () => {
    expect(() => validateAndSanitize(paginationSchema, { limit: -1 })).toThrow('Validation failed');
  });
});
