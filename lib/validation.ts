/**
 * lib/validation.ts — Fix #6 (XSS/SQLi) + Fix #17 (safe parse) + Fix #20 (limits)
 */
import { z, ZodSchema } from 'zod';

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
  topic: z.string().min(3).max(200),
  slides: z.number().int().min(1).max(50),
  style: z.enum(['professional', 'creative', 'minimal', 'corporate']).optional(),
});

export const letterGenerationSchema = z.object({
  type: z.enum(['cover', 'recommendation', 'resignation', 'complaint', 'thank-you']),
  recipient: nameSchema,
  content: z.string().min(50).max(LIMITS.DESCRIPTION_MAX),
});

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

export async function safeParseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) throw new Error('Content-Type must be application/json');
  const cl = Number(request.headers.get('content-length') ?? 0);
  if (cl > LIMITS.MAX_BODY_BYTES) throw new Error('Request body too large');
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
  const r = schema.safeParse(raw);
  if (!r.success)
    throw new Error('Validation failed: ' + r.error.errors.map((e) => e.message).join(', '));
  return r.data;
}

export function validateAndSanitize<T>(schema: ZodSchema<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success)
    throw new Error('Validation failed: ' + r.error.errors.map((e) => e.message).join(', '));
  return r.data;
}
