import { NextRequest, NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';
import { getStripeCustomerId, createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRoute();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found. Please sign in and try again.'
      }, { status: 401 });
    }

    const { priceId, planType } = await req.json();

    if (!priceId || !planType) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        details: 'Price ID and plan type are required'
      }, { status: 400 });
    }

    // Get or create Stripe customer
    const customerId = await getStripeCustomerId(user.id, user.email!);

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId: user.id,
      userEmail: user.email!,
      successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
      planType: planType as 'individual' | 'organization',
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
