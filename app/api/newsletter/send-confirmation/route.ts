import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { logSecurityEvent } from '@/lib/security';
import { incrementRequestCount, incrementErrorCount } from '@/app/api/metrics/route';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function createEmailTransport() {
  const hasFullSmtpConfig =
    !!process.env.EMAIL_HOST && !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
  const allowTestSmtp = process.env.NODE_ENV !== 'production';

  let smtpHost = process.env.EMAIL_HOST ?? 'smtp.ethereal.email';
  let smtpUser = process.env.EMAIL_USER;
  let smtpPass = process.env.EMAIL_PASS;

  if (!hasFullSmtpConfig) {
    if (!allowTestSmtp) {
      throw new Error('SMTP is not configured for this environment');
    }
    const testAccount = await nodemailer.createTestAccount();
    smtpHost = 'smtp.ethereal.email';
    smtpUser = testAccount.user;
    smtpPass = testAccount.pass;
  }

  const smtpPort = Number(process.env.EMAIL_PORT ?? '587');

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

function generateConfirmationEmailHTML(confirmationLink: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; color: white; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .content p { margin: 0 0 16px 0; }
          .button-container { text-align: center; margin: 30px 0; }
          .button { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
          .button:hover { opacity: 0.9; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          .footer p { margin: 5px 0; }
          .icon { font-size: 24px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">✉️</div>
            <h1>Confirm Your Newsletter Subscription</h1>
          </div>
          <div class="content">
            <p>Hello!</p>
            <p>Thank you for subscribing to our newsletter! We're excited to have you on board.</p>
            <p>To complete your subscription and start receiving our latest updates, please confirm your email by clicking the button below:</p>
            
            <div class="button-container">
              <a href="${confirmationLink}" class="button">Confirm Subscription</a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              <strong>Or copy and paste this link in your browser:</strong><br>
              <a href="${confirmationLink}" style="color: #667eea; word-break: break-all;">${confirmationLink}</a>
            </p>
            
            <p>This link will expire in 24 hours.</p>
            
            <p>If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
            
            <div class="footer">
              <p><strong>Why are we sending this?</strong></p>
              <p>We use double opt-in to ensure that subscriptions are requested by the actual email owner. This protects both you and us.</p>
              <p style="margin-top: 15px;">
                <strong>Questions?</strong> Reply to this email or visit our support page at ${process.env.NEXT_PUBLIC_APP_URL}/contact
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request.headers);
  const log = logger.withContext({ requestId });
  incrementRequestCount();

  try {
    // Verify this is an internal request (from our server)
    const internalSecret = request.headers.get('x-internal-secret');
    const isProduction = process.env.NODE_ENV === 'production';
    const configuredSecret = process.env.INTERNAL_API_SECRET;

    // In production, always require the secret
    if (isProduction) {
      if (!internalSecret || internalSecret !== configuredSecret) {
        log.warn('Unauthorized newsletter email request (production)', {
          ip: request.ip || 'unknown',
        });
        await logSecurityEvent({
          type: 'unauthorized_newsletter_email',
          description: 'Unauthorized attempt to send newsletter email',
          metadata: { ip: request.ip || 'unknown', environment: 'production' },
        });
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      // In development, log a warning if secret is missing or wrong
      if (!internalSecret || (configuredSecret && internalSecret !== configuredSecret)) {
        log.warn('Newsletter email sent without valid internal secret (development mode)', {
          ip: request.ip || 'unknown',
        });
      }
    }

    const body = await request.json();
    const { email, token, expiresAt } = body;

    if (!email || !token) {
      log.warn('Missing required fields for newsletter email');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const confirmationLink = `${appUrl}/confirm-newsletter?token=${token}`;

    const transporter = await createEmailTransport();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"${process.env.NEXT_PUBLIC_APP_NAME || 'DraftDeckAI'}" <noreply@draftdeckai.com>`,
      to: email,
      subject: '✉️ Confirm Your Newsletter Subscription - DraftDeckAI',
      html: generateConfirmationEmailHTML(confirmationLink, email),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    log.info('Newsletter confirmation email sent successfully', {
      email,
      messageId: info.messageId,
    });

    // If using test account, log the preview URL
    if (process.env.NODE_ENV !== 'production' && !process.env.EMAIL_HOST) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      log.info('Email preview URL (test mode)', {
        previewUrl,
        email,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Confirmation email sent successfully',
        messageId: info.messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    incrementErrorCount();
    log.error('Newsletter email sending error', { error });
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
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
