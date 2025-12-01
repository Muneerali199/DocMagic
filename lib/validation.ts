import { z } from 'zod';

const TRUSTED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com',
  'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com', 'proton.me',
  'zoho.com', 'mail.com', 'gmx.com', 'yandex.com', 'tutanota.com'
];

const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  if (TRUSTED_EMAIL_DOMAINS.includes(domain)) return true;
  
  if (domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.endsWith('.edu.au') || 
      domain.endsWith('.edu.cn') || domain.endsWith('.edu.in')) return true;
  
  if (/^\d+@qq\.com$/.test(email) || /^\d{10,}@/.test(email)) return false;
  
  return false;
};

export const emailSchema = z
  .string()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address')
  .max(254, 'Email address is too long')
  .refine(isValidEmailDomain, {
    message: 'Please use a valid email from a recognized provider (Gmail, Outlook, Yahoo, etc.)'
  });

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s.'-]+$/, 'Name contains invalid characters');

export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const resumeGenerationSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt too long'),
  name: nameSchema,
  email: emailSchema,
});

export const presentationGenerationSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(200, 'Topic too long'),
  slides: z.number().min(1).max(50, 'Maximum 50 slides allowed'),
  style: z.enum(['professional', 'creative', 'minimal', 'corporate']).optional(),
});

export const letterGenerationSchema = z.object({
  type: z.enum(['cover', 'recommendation', 'resignation', 'complaint', 'thank-you']),
  recipient: nameSchema,
  content: z.string().min(50, 'Content must be at least 50 characters').max(3000, 'Content too long'),
});

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 10000);
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error('Validation failed: ' + result.error.errors.map(e => e.message).join(', '));
  }
  return result.data;
}

export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b.*['";])/i,
    /(\bUNION\s+(ALL\s+)?SELECT\b)/i,
    /(;--|\/\*|\*\/|--\s|#)/,
    /(0x[0-9a-f]+)/i,
    /(\'\s*(OR|AND)\s*\'\s*=\s*\')|(\'\s*(OR|AND)\s*\d+\s*=\s*\d+)/i,
  ];
  return sqlPatterns.some(pattern => pattern.test(input));
}

export function generateRateLimitKey(ip: string, endpoint: string): string {
  return ip + ':' + endpoint;
}
