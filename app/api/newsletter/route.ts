import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { emailSchema, sanitizeInput } from '@/lib/validation';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { checkRateLimit, logSecurityEvent } from '@/lib/security';
import { incrementRequestCount, incrementErrorCount } from '@/app/api/metrics/route';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Newsletter subscription schema
const newsletterSubscribeSchema = z.object({
  email: emailSchema,
  sourcePage: z.string().max(100, 'Source page is too long').default('homepage'),
});

type NewsletterSubscribeRequest = z.infer<typeof newsletterSubscribeSchema>;

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request.headers);
  const log = logger.withContext({ requestId });
  incrementRequestCount();

  try {
    // Rate limiting check - more lenient for newsletter signup (10 requests per hour per IP)
    const rateLimit = await checkRateLimit(
      request,
      { requests: 10, windowMs: 60 * 60 * 1000 } // 1 hour
    );

    if (!rateLimit.allowed) {
      log.warn('Rate limit exceeded for newsletter subscription', {
        ip: request.ip || 'unknown',
      });
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = newsletterSubscribeSchema.safeParse(body);

    if (!validation.success) {
      log.warn('Newsletter subscription validation failed', {
        errors: validation.error.errors,
      });
      return NextResponse.json(
        {
          error: 'Invalid email address',
          details: validation.error.errors.map((e) => e.message),
        },
        { status: 400 }
      );
    }

    const { email, sourcePage } = validation.data;

    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if email already exists
    const { data: existingLead, error: fetchError } = await supabase
      .from('newsletter_leads')
      .select('id, confirmed, email, confirmation_token, token_expires_at')
      .eq('email', email.toLowerCase())
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows" error, which is expected
      throw fetchError;
    }

    let confirmationToken: string;
    let tokenExpiresAt: Date;
    let isNewSubscription = false;

    // If email exists and is already confirmed, return success message
    if (existingLead) {
      if (existingLead.confirmed) {
        log.info('Newsletter subscription already confirmed', {
          email: email.toLowerCase(),
        });
        return NextResponse.json(
          {
            success: true,
            message: 'You are already subscribed to our newsletter!',
            alreadySubscribed: true,
          },
          { status: 200 }
        );
      }

      // If not confirmed, update the token and resend confirmation email
      log.info('Resending newsletter confirmation email', {
        email: email.toLowerCase(),
      });

      confirmationToken = crypto.randomUUID();
      tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { error: updateError } = await supabase
        .from('newsletter_leads')
        .update({
          confirmation_token: confirmationToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingLead.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new newsletter lead with confirmation token
      confirmationToken = crypto.randomUUID();
      tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      isNewSubscription = true;

      const { error: insertError } = await supabase
        .from('newsletter_leads')
        .insert({
          email: email.toLowerCase(),
          source_page: sourcePage,
          confirmation_token: confirmationToken,
          token_expires_at: tokenExpiresAt.toISOString(),
          confirmed: false,
        });

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation
          log.warn('Email already in newsletter database', {
            email: email.toLowerCase(),
          });
          return NextResponse.json(
            { error: 'Email already exists in our newsletter' },
            { status: 409 }
          );
        }
        throw insertError;
      }
    }

    log.info('Newsletter subscription created successfully', {
      email: email.toLowerCase(),
      sourcePage,
      isNewSubscription,
    });

    // Log security event
    await logSecurityEvent({
      type: 'newsletter_subscription',
      description: 'User subscribed to newsletter',
      metadata: {
        email: email.toLowerCase(),
        sourcePage,
      },
    });

    // Send confirmation email asynchronously (non-blocking)
    try {
      const internalSecret = process.env.INTERNAL_API_SECRET || 'dev-secret-key';
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Use native fetch to send email - don't wait for response
      if (typeof fetch !== 'undefined') {
        fetch(`${baseUrl}/api/newsletter/send-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': internalSecret,
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            token: confirmationToken,
            expiresAt: tokenExpiresAt.toISOString(),
          }),
        }).catch((error) => {
          log.error('Failed to queue confirmation email', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            email,
          });
        });
      }
    } catch (error) {
      log.error('Error sending confirmation email', { error, email });
      // Don't fail the subscription request if email sending fails
    }

    // Return success - email will be sent asynchronously
    return NextResponse.json(
      {
        success: true,
        message: 'Check your email to confirm your subscription!',
      },
      { status: 200 }
    );
  } catch (error) {
    incrementErrorCount();
    log.error('Newsletter subscription error', { error });
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
