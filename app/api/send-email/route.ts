import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { RequestValidationError, safeParseBody, sanitizeObject, sendEmailSchema } from '@/lib/validation';
import { createRoute } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { logSecurityEvent, checkRateLimit, SECURITY_CONFIG } from '@/lib/security';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { incrementRequestCount, incrementErrorCount } from '@/app/api/metrics/route';
import { withErrorHandling } from '@/lib/error-handler';


export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting configuration for email endpoint
const EMAIL_RATE_LIMIT = {
  requests: 5,
  windowMs: 15 * 60 * 1000 // 15 minutes
};

async function postHandler(request: NextRequest) {
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
      logSecurityEvent('UNAUTHORIZED_EMAIL_ATTEMPT', { authError, ip, requestId }, ip);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to send emails' }),
        { status: 401, headers: { 'Content-Type': 'application/json', 'x-request-id': requestId } }
      );
    }

    // 2. Request Body Parsing & Validation (Run before rate limit so malformed requests don't consume quota)
    let validatedEmail;
    try {
      validatedEmail = await safeParseBody(request, sendEmailSchema);
    } catch (validationError) {
      if (!(validationError instanceof RequestValidationError)) {
        throw validationError;
      }
      return new Response(
        JSON.stringify({ error: validationError.message, details: validationError.details }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'x-request-id': requestId } }
      );
    }

    const { to, subject, content, fromName, fromEmail, letterContent } = validatedEmail;

    // 3. Rate Limiting Check using the shared utility
    const rateLimitResult = checkRateLimit(user.id, EMAIL_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED_EMAIL', { userId: user.id, ip, requestId }, ip);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Maximum 5 emails allowed per 15 minutes.',
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
            'x-request-id': requestId,
          }
        }
      );
    }

    // Use the reusable sanitizeObject helper for consistent sanitization across nested fields
    const sanitizedBody = sanitizeObject({
      fromName,
      fromEmail,
      subject,
      content,
      letterContent
    });

    const {
      fromName: sanitizedFromName,
      fromEmail: sanitizedFromEmail,
      subject: sanitizedSubject,
      content: sanitizedPersonalMessage,
      letterContent: sanitizedLetterContent
    } = sanitizedBody;

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
    logSecurityEvent('EMAIL_SENT_SUCCESSFULLY', { userId: user.id, messageId: info.messageId, recipientDomain, ip, requestId }, ip);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: info.messageId,
        previewUrl
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'x-request-id': requestId } }
    );
  } catch (error) {
    incrementErrorCount();
    // Safe error responses: Do not leak raw provider/server internals in API responses.
    // Keep detailed errors only in server logs.
    log.error('Error sending email:', error);
    logSecurityEvent('EMAIL_SEND_ERROR', { error: error instanceof Error ? error.message : 'Unknown error', ip, requestId }, ip);
    
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'x-request-id': requestId } }
    );
  }
}

export const POST = withErrorHandling(postHandler);
