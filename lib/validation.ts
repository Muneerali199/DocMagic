import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email('Invalid email format').max(254);

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Registration schema
export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Resume generation schema
export const resumeGenerationSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters').max(5000, 'Prompt too long'),
  name: nameSchema,
  email: emailSchema,
});

// Presentation generation schema
export const presentationGenerationSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters').max(200, 'Topic too long'),
  slides: z.number().min(1).max(50, 'Maximum 50 slides allowed'),
  style: z.enum(['professional', 'creative', 'minimal', 'corporate']).optional(),
});

// Letter generation schema
export const letterGenerationSchema = z.object({
  type: z.enum(['cover', 'recommendation', 'resignation', 'complaint', 'thank-you']),
  recipient: nameSchema,
  content: z.string().min(50, 'Content must be at least 50 characters').max(3000, 'Content too long'),
});

// Sanitize HTML input to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Sanitize user input for database storage
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 10000); // Limit length and trim whitespace
}

// Validate and sanitize request body
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  
  return result.data;
}

// Check for common SQL injection patterns
export function detectSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\/\*|\*\/)/,
    /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Rate limiting key generator
export function generateRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}