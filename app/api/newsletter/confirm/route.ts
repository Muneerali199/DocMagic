import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { getRequestId } from '@/lib/request-id';
import { logSecurityEvent } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const requestId = getRequestId(request.headers);
  const log = logger.withContext({ requestId });

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      log.warn('Newsletter confirmation attempted without token');
      return NextResponse.json(
        { error: 'Invalid confirmation link' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Find the lead by token
    const { data: lead, error: fetchError } = await supabase
      .from('newsletter_leads')
      .select('id, email, confirmed, token_expires_at')
      .eq('confirmation_token', token)
      .single();

    if (fetchError || !lead) {
      log.warn('Newsletter confirmation token not found', {
        token: token.substring(0, 8) + '...',
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Your email is already confirmed or the link is invalid.',
        },
        { status: 200 }
      );
    }

    // Check if token has expired
    const tokenExpiry = new Date(lead.token_expires_at);
    if (tokenExpiry < new Date()) {
      log.warn('Newsletter confirmation token expired', {
        email: lead.email,
      });
      return NextResponse.json(
        { error: 'Confirmation link has expired. Please subscribe again.' },
        { status: 410 }
      );
    }

    // Check if already confirmed
    if (lead.confirmed) {
      log.info('Newsletter already confirmed', {
        email: lead.email,
      });
      return NextResponse.json(
        { message: 'Your subscription is already confirmed!' },
        { status: 200 }
      );
    }

    // Update the lead to mark as confirmed
    const { error: updateError } = await supabase
      .from('newsletter_leads')
      .update({
        confirmed: true,
        confirmation_token: null,
        token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id);

    if (updateError) {
      throw updateError;
    }

    log.info('Newsletter subscription confirmed', {
      email: lead.email,
    });

    await logSecurityEvent({
      type: 'newsletter_confirmed',
      description: 'User confirmed newsletter subscription',
      metadata: {
        email: lead.email,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your subscription has been confirmed! Welcome to our newsletter.',
      },
      { status: 200 }
    );
  } catch (error) {
    log.error('Newsletter confirmation error', { error });
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
