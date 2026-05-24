/**
 * lib/validation.ts — Fix #6 (XSS/SQLi) + Fix #17 (safe parse) + Fix #20 (limits)
 */
import { z, ZodSchema, type ZodIssue } from 'zod';

export const LIMITS = {
  NAME_MAX: 200,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  PROMPT_MIN: 10,
  PROMPT_MAX: 5_000,
  CONTENT_MAX: 10_000,
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 2_000,
  MAX_BODY_BYTES: 1_048_576,
} as const;

export class RequestValidationError extends Error {
  readonly details: string[];

  constructor(message: string, details: string[] = []) {
    super(message);
    this.name = 'RequestValidationError';
    this.details = details;
  }
}

export function sanitizeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeInput(s: string, max = LIMITS.CONTENT_MAX): string {
  return s.replace(/\0/g, '').replace(/\r\n/g, '\n').trim().slice(0, max);
}

export function sanitizeObject<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return sanitizeHtml(data) as unknown as T;
  if (Array.isArray(data)) return data.map((item) => sanitizeObject(item)) as unknown as T;
  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }
  return data;
}

export function detectSqlInjection(s: string): boolean {
  return [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|TRUNCATE)\b.*['";-])/i,
    /(\bUNION\s+(ALL\s+)?SELECT\b)/i,
    /(;--|\/\*|\*\/|--\s|#\s)/,
    /(\bOR\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/i,
    /WAITFOR\s+DELAY/i,
  ].some((p) => p.test(s));
}

export const emailSchema = z
  .string()
  .email()
  .max(LIMITS.EMAIL_MAX)
  .refine((e) => /^[^@]+@[^@]+\.[^@]+$/.test(e));

export const passwordSchema = z
  .string()
  .min(LIMITS.PASSWORD_MIN, `Min ${LIMITS.PASSWORD_MIN} chars`)
  .max(LIMITS.PASSWORD_MAX)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Needs upper, lower, digit');

export const nameSchema = z
  .string()
  .min(1)
  .max(LIMITS.NAME_MAX)
  .regex(/^[a-zA-Z0-9\s.'"\\-]+$/, 'Invalid chars');

export const promptSchema = z
  .string()
  .min(LIMITS.PROMPT_MIN, `Min ${LIMITS.PROMPT_MIN} chars`)
  .max(LIMITS.PROMPT_MAX);

export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const resumeGenerationSchema = z.object({
  prompt: promptSchema,
  name: nameSchema,
  email: emailSchema,
});

export const presentationGenerationSchema = z.object({
  prompt: promptSchema,
  pageCount: z.coerce.number().int().min(1).max(100).default(8),
  template: z.string().max(100).optional(),
});

const emptyToUndefined = (value: unknown) => value === null || value === '' ? undefined : value;
const optionalText = (max = LIMITS.CONTENT_MAX) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());
const optionalName = z.preprocess(emptyToUndefined, nameSchema.optional());
const optionalEmail = z.preprocess(emptyToUndefined, emailSchema.optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().trim().url().max(2048).optional());

export const letterGenerationSchema = z.object({
  prompt: optionalText(LIMITS.PROMPT_MAX),
  fromName: optionalName,
  fromAddress: optionalText(500),
  toName: optionalName,
  toAddress: optionalText(500),
  letterType: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(50).optional()),
  jobDescription: z.preprocess(emptyToUndefined, z.string().trim().min(20).max(LIMITS.CONTENT_MAX).optional()),
  jobUrl: optionalUrl,
  fromEmail: optionalEmail,
  skills: z.preprocess(emptyToUndefined, z.union([
    z.string().trim().max(2_000).transform((value) =>
      value.split(',').map((skill) => skill.trim()).filter(Boolean),
    ),
    z.array(z.string().trim().max(100)).max(50),
  ]).optional()),
  experience: optionalText(5_000),
  tone: optionalText(100),
  length: optionalText(50),
  lockedSections: z.object({
    name: z.boolean().optional(),
    skills: z.boolean().optional(),
    experience: z.boolean().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  const isCoverLetter = Boolean(data.jobDescription && data.fromName);
  if (isCoverLetter) return;

  const requiredFields: Array<keyof typeof data> = ['prompt', 'fromName', 'toName', 'letterType'];
  for (const field of requiredFields) {
    if (!data[field]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${field} is required`,
      });
    }
  }
});

const emailLetterPartySchema = z.object({
  name: z.string().max(100).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
});

export const sendEmailSchema = z.object({
  to: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  content: z.string().max(5000, 'Content is too long').optional().nullable(),
  fromName: z.string().max(100, 'From name is too long').optional().nullable(),
  fromEmail: emailSchema.optional().nullable(),
  letterContent: z.object({
    from: emailLetterPartySchema.optional().nullable(),
    to: emailLetterPartySchema.optional().nullable(),
    date: z.string().max(100).optional().nullable(),
    subject: z.string().max(200).optional().nullable(),
    content: z.string().max(10000, 'Letter content is too long').optional().nullable(),
  }),
}).transform((data) => ({
  ...data,
  letterContent: {
    ...data.letterContent,
    from: data.letterContent.from ?? {},
    to: data.letterContent.to ?? {},
  },
}));

export const documentCreateSchema = z.object({
  title: z.string().min(1).max(LIMITS.TITLE_MAX),
  documentType: z.string().min(1).max(50),
  content: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
  sections: z.array(z.unknown()).max(100).optional(),
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

function formatZodIssues(issues: ZodIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}

export async function safeParseBody<T>(
  request: Request,
  schema: ZodSchema<T>,
  options: { maxBodyBytes?: number } = {},
): Promise<T> {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.toLowerCase().includes('application/json')) {
    throw new RequestValidationError('Invalid request body', ['Content-Type must be application/json']);
  }

  const cl = Number(request.headers.get('content-length') ?? 0);
  const maxBodyBytes = options.maxBodyBytes ?? LIMITS.MAX_BODY_BYTES;
  if (Number.isFinite(cl) && cl > maxBodyBytes) {
    throw new RequestValidationError('Request body too large', [`Maximum request body size is ${maxBodyBytes} bytes`]);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new RequestValidationError('Invalid JSON payload', ['Request body must be valid JSON']);
  }

  const r = schema.safeParse(raw);
  if (!r.success) {
    throw new RequestValidationError('Invalid request body', formatZodIssues(r.error.errors));
  }

  return r.data;
}

export function validateAndSanitize<T>(schema: ZodSchema<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success)
    throw new Error('Validation failed: ' + r.error.errors.map((e) => e.message).join(', '));
  return r.data;
}
