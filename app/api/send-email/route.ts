import { NextResponse, NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { emailSchema, sanitizeInput } from '@/lib/validation';
import { logSecurityEvent, SECURITY_CONFIG } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting per user (in-memory store)
const rateLimitStore = new Map<string, { count: number; reset: number }>();

// Email content validation schema
const sendEmailSchema = z.object({
  to: emailSchema,
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  content: z.string().max(5000, 'Message content is too long').optional(),
  fromName: z.string().max(100, 'Name is too long').optional(),
  fromEmail: emailSchema.optional(),
  letterContent: z.object({
    content: z.string().max(10000, 'Letter content is too long'),
    subject: z.string().max(200, 'Letter subject is too long').optional(),
    date: z.string().optional(),
    from: z.object({
      address: z.string().optional(),
    }).optional(),
    to: z.object({
      name: z.string().optional(),
      address: z.string().optional(),
    }).optional(),
  }),
});

// Check rate limit per user
function checkRateLimit(userId: string): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = SECURITY_CONFIG.RATE_LIMITS.API.windowMs;
  const maxRequests = 10; // Max 10 emails per 15 minutes per user
  
  let data = rateLimitStore.get(userId);
  
  // Reset if window expired
  if (!data || now > data.reset) {
    data = { count: 1, reset: now + windowMs };
    rateLimitStore.set(userId, data);
    return { allowed: true, remaining: maxRequests - 1, reset: data.reset };
  }

  // Check if limit exceeded
  if (data.count >= maxRequests) {
    return { allowed: false, remaining: 0, reset: data.reset };
  }

  // Increment count
  data.count++;
  rateLimitStore.set(userId, data);
  
  return { allowed: true, remaining: maxRequests - data.count, reset: data.reset };
}

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. AUTHENTICATION CHECK - Require authenticated user
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      logSecurityEvent('SEND_EMAIL_UNAUTHORIZED', {
        reason: 'No authentication token provided',
        ip: request.ip || request.headers.get('x-forwarded-for'),
      }, request.ip);
      
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to send emails.' },
        { status: 401 }
      );
    }

    // Verify token with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      logSecurityEvent('SEND_EMAIL_AUTH_FAILED', {
        reason: authError?.message || 'Invalid token',
        ip: request.ip || request.headers.get('x-forwarded-for'),
      }, request.ip);
      
      return NextResponse.json(
        { error: 'Invalid or expired authentication token.' },
        { status: 401 }
      );
    }

    // ✅ 2. RATE LIMITING - Check if user has exceeded limit
    const rateLimitCheck = checkRateLimit(user.id);
    
    if (!rateLimitCheck.allowed) {
      logSecurityEvent('SEND_EMAIL_RATE_LIMITED', {
        userId: user.id,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        resetTime: new Date(rateLimitCheck.reset).toISOString(),
      }, request.ip);
      
      return NextResponse.json(
        { 
          error: 'Too many email requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitCheck.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitCheck.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // ✅ 3. INPUT VALIDATION - Validate and sanitize all inputs
    const body = await request.json();
    
    // Validate against schema
    const validationResult = sendEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join('; ');
      logSecurityEvent('SEND_EMAIL_VALIDATION_FAILED', {
        userId: user.id,
        errors,
      }, request.ip);
      
      return NextResponse.json(
        { error: 'Invalid input. Please check your submission.' },
        { status: 400 }
      );
    }

    const { to, subject, content, fromName, fromEmail, letterContent } = validationResult.data;

    // Additional sanitization to prevent XSS
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedContent = sanitizeInput(content || '');
    const sanitizedFromName = sanitizeInput(fromName || '');

    // Create a test SMTP transporter using Ethereal
    // For testing purposes, we'll create a test account
    const testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter object using the test account
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || testAccount.user,
        pass: process.env.EMAIL_PASS || testAccount.pass,
      },
    });

    // Format the letter content for email
    const formattedContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 20px;">
          ${fromName ? `<p style="margin-bottom: 5px;"><strong>${sanitizedFromName}</strong></p>` : ''}
          ${fromEmail ? `<p style="margin-bottom: 5px;">${sanitizeInput(fromEmail)}</p>` : ''}
          ${letterContent.from?.address ? `<p style="margin-bottom: 5px;">${sanitizeInput(letterContent.from.address)}</p>` : ''}
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>${sanitizeInput(letterContent.date || '')}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          ${letterContent.to?.name ? `<p style="margin-bottom: 5px;"><strong>${sanitizeInput(letterContent.to.name)}</strong></p>` : ''}
          ${letterContent.to?.address ? `<p style="margin-bottom: 5px;">${sanitizeInput(letterContent.to.address)}</p>` : ''}
        </div>
        
        ${letterContent.subject ? `<div style="margin-bottom: 20px;"><p><strong>Subject: ${sanitizeInput(letterContent.subject)}</strong></p></div>` : ''}
        
        <div style="line-height: 1.6; white-space: pre-line;">
          ${sanitizeInput(letterContent.content)}
        </div>
      </div>
    `;

    // Additional personal message if provided
    const personalMessage = sanitizedContent ? 
      `<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p><em>Personal message:</em></p>
        <p>${sanitizedContent}</p>
      </div>` : '';

    // Send email
    const info = await transporter.sendMail({
      from: `"${sanitizedFromName}" <${fromEmail || process.env.EMAIL_FROM || 'noreply@draftdeckai.com'}>`,
      to,
      subject: sanitizedSubject,
      html: `${formattedContent}${personalMessage}`,
      text: `${letterContent.content || ''}\n\n${sanitizedContent ? `Personal message: ${sanitizedContent}` : ''}`,
    });

    // Get the Ethereal URL for viewing the test email (only for Ethereal emails)
    const previewUrl = process.env.EMAIL_HOST ? null : nodemailer.getTestMessageUrl(info);

    // Log successful email send
    logSecurityEvent('SEND_EMAIL_SUCCESS', {
      userId: user.id,
      recipientDomain: to.split('@')[1], // Log domain only, not full email
      messageId: info.messageId,
    }, request.ip);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? previewUrl : undefined,
    });
  } catch (error) {
    const isValidError = error instanceof Error;
    const errorMessage = isValidError ? error.message : 'Unknown error occurred';
    const errorName = isValidError ? error.name : 'UnknownError';

    // ✅ 4. SAFE ERROR RESPONSES - Don't leak internal details
    console.error('Error sending email:', {
      error: errorName,
      message: errorMessage,
      stack: isValidError && process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    logSecurityEvent('SEND_EMAIL_ERROR', {
      errorType: errorName,
      isValidationError: errorMessage.includes('Validation failed'),
    });

    // Return safe error response without exposing internal details
    if (errorMessage.includes('Validation failed')) {
      return NextResponse.json(
        { error: 'Invalid input. Please check your submission.' },
        { status: 400 }
      );
    }

    if (errorMessage.includes('Email sending failed')) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}