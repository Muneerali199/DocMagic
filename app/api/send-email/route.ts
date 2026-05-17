import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { emailSchema, sanitizeHtml, sanitizeInput } from '@/lib/validation';
import { createRoute } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { logSecurityEvent } from '@/lib/security';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { incrementRequestCount, incrementErrorCount } from '@/app/api/metrics/route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting store: 5 requests per 15 minutes per user ID
const rateLimitStore = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_LIMIT_MAX_ENTRIES = 10_000;

function pruneExpired(now: number) {
  for (const [key, value] of rateLimitStore) {
    if (now > value.reset) rateLimitStore.delete(key);
  }
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  if (rateLimitStore.size > RATE_LIMIT_MAX_ENTRIES) pruneExpired(now);
  let data = rateLimitStore.get(userId);

  if (!data || now > data.reset) {
    data = { count: 1, reset: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(userId, data);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, reset: data.reset };
  }

  if (data.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, reset: data.reset };
  }

  data.count++;
  rateLimitStore.set(userId, data);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - data.count, reset: data.reset };
}

const sendEmailSchema = z.object({
  to: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  content: z.string().max(5000, 'Content is too long').optional().nullable(),
  fromName: z.string().max(100, 'From name is too long').optional().nullable(),
  fromEmail: z.string().max(254, 'From email is too long').refine((val: string) => {
    if (!val) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }, 'Invalid from email').optional().nullable(),
  letterContent: z.object({
    from: z.object({
      name: z.string().max(100).optional().nullable(),
      address: z.string().max(200).optional().nullable(),
    }).optional().nullable(),
    to: z.object({
      name: z.string().max(100).optional().nullable(),
      address: z.string().max(200).optional().nullable(),
    }).optional().nullable(),
    date: z.string().max(100).optional().nullable(),
    subject: z.string().max(200).optional().nullable(),
    content: z.string().max(10000, 'Letter content is too long').optional().nullable(),
  }),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request.headers);
  const log = logger.withContext({ requestId });
  incrementRequestCount();

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // 1. Authentication Verification
    const authHeader = request.headers.get('authorization') ?? '';
    const match = /^Bearer\s+(.+)$/i.exec(authHeader);
    const token = match?.[1]?.trim();

    let supabase;
    if (token) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
    } else {
      supabase = await createRoute();
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logSecurityEvent('UNAUTHORIZED_EMAIL_ATTEMPT', { authError, ip }, ip);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to send emails' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Request Body Parsing & Validation (Run before rate limit so malformed requests don't consume quota)
    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validationResult = sendEmailSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e: any) => e.message).join(', ');
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errorMessage}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { to, subject, content, fromName, fromEmail, letterContent } = validationResult.data;

    // 3. Rate Limiting Check
    const rateLimitResult = checkRateLimit(user.id);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED_EMAIL', { userId: user.id, ip }, ip);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Maximum 5 emails allowed per 15 minutes.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Sanitize string contents to prevent XSS/injection attacks inside HTML email rendering
    const sanitizedFromName = fromName ? sanitizeHtml(fromName) : '';
    const sanitizedFromEmail = fromEmail ? sanitizeHtml(fromEmail) : '';
    const sanitizedSubject = sanitizeHtml(subject);
    const sanitizedPersonalMessage = content ? sanitizeHtml(content) : '';
    
    const sanitizedLetterContent = {
      from: {
        name: letterContent.from?.name ? sanitizeHtml(letterContent.from.name) : '',
        address: letterContent.from?.address ? sanitizeHtml(letterContent.from.address) : '',
      },
      to: {
        name: letterContent.to?.name ? sanitizeHtml(letterContent.to.name) : '',
        address: letterContent.to?.address ? sanitizeHtml(letterContent.to.address) : '',
      },
      date: letterContent.date ? sanitizeHtml(letterContent.date) : '',
      subject: letterContent.subject ? sanitizeHtml(letterContent.subject) : '',
      content: letterContent.content ? sanitizeHtml(letterContent.content) : '',
    };

    const hasFullSmtpConfig =
      !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
    const allowTestSmtp = process.env.NODE_ENV !== 'production';
    const hasPartialSmtpConfig =
      !!process.env.EMAIL_HOST || !!process.env.EMAIL_USER || !!process.env.EMAIL_PASS;

    if (hasPartialSmtpConfig && !hasFullSmtpConfig) {
      throw new Error('EMAIL_HOST, EMAIL_USER, and EMAIL_PASS must be configured together');
    }

    if (!hasFullSmtpConfig && !allowTestSmtp) {
      throw new Error('SMTP is not configured for this environment');
    }

    let smtpHost = process.env.EMAIL_HOST ?? 'smtp.ethereal.email';
    let smtpUser = process.env.EMAIL_USER;
    let smtpPass = process.env.EMAIL_PASS;

    if (!hasFullSmtpConfig) {
      const testAccount = await nodemailer.createTestAccount();
      smtpHost = 'smtp.ethereal.email';
      smtpUser = testAccount.user;
      smtpPass = testAccount.pass;
    }

    const smtpPort = Number(process.env.EMAIL_PORT ?? '587');

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Format the letter content for email
    const formattedContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 20px;">
          ${sanitizedFromName ? `<p style="margin-bottom: 5px;"><strong>${sanitizedFromName}</strong></p>` : ''}
          ${sanitizedFromEmail ? `<p style="margin-bottom: 5px;">${sanitizedFromEmail}</p>` : ''}
          ${sanitizedLetterContent.from.address ? `<p style="margin-bottom: 5px;">${sanitizedLetterContent.from.address}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>${sanitizedLetterContent.date || ''}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          ${sanitizedLetterContent.to.name ? `<p style="margin-bottom: 5px;"><strong>${sanitizedLetterContent.to.name}</strong></p>` : ''}
          ${sanitizedLetterContent.to.address ? `<p style="margin-bottom: 5px;">${sanitizedLetterContent.to.address}</p>` : ''}
        </div>
        
        ${sanitizedLetterContent.subject ? `<div style="margin-bottom: 20px;"><p><strong>Subject: ${sanitizedLetterContent.subject}</strong></p></div>` : ''}
        
        <div style="line-height: 1.6; white-space: pre-line;">
          ${sanitizedLetterContent.content || ''}
        </div>
      </div>
    `;

    // Additional personal message if provided
    const personalMessageHtml = sanitizedPersonalMessage ? 
      `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p><em>Personal message:</em></p>
        <p>${sanitizedPersonalMessage}</p>
      </div>` : '';

    // Send email using structured address object form
    const info = await transporter.sendMail({
      from: {
        name: sanitizedFromName || '',
        address: process.env.EMAIL_FROM || 'noreply@draftdeckai.com',
      },
      replyTo: sanitizedFromEmail || undefined,
      to,
      subject: sanitizedSubject,
      html: `${formattedContent}${personalMessageHtml}`,
      text: `${sanitizedLetterContent.content || ''}\n\n${sanitizedPersonalMessage ? `Personal message: ${sanitizedPersonalMessage}` : ''}`,
    });

    // Get the Ethereal URL for viewing the test email (only for Ethereal emails)
    const previewUrl =
      !hasFullSmtpConfig && allowTestSmtp ? nodemailer.getTestMessageUrl(info) : null;

    // Log successful email dispatch internally without PII
    const recipientDomain = to.split('@')[1];
    logSecurityEvent('EMAIL_SENT_SUCCESSFULLY', { userId: user.id, messageId: info.messageId, recipientDomain, ip }, ip);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
        previewUrl
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    incrementErrorCount();
    // Safe error responses: Do not leak raw provider/server internals in API responses.
    // Keep detailed errors only in server logs.
    log.error('Error sending email:', error);
    logSecurityEvent('EMAIL_SEND_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', ip }, ip);
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}