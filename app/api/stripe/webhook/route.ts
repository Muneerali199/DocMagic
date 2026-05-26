import { logger } from '@/lib/logger';
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createRoute } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature");

    // Validate webhook signature
    if (!signature) {
      logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Missing Stripe signature');
      return new NextResponse('Missing signature', { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Missing Stripe webhook secret');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Webhook signature verification failed:', error.message);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;
    const supabase = await createRoute();

    // Validate event types we handle
    const allowedEventTypes = [
      "checkout.session.completed",
      "invoice.payment_succeeded",
      "customer.subscription.updated",
      "customer.subscription.deleted"
    ];

    if (!allowedEventTypes.includes(event.type)) {
      
      return new NextResponse(null, { status: 200 });
    }

    if (event.type === "checkout.session.completed") {
      // Validate required fields
      if (!session.subscription || !session.metadata?.userId) {
        logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Missing required session data');
        return new NextResponse('Invalid session data', { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Create subscription in Supabase with validation
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: session.metadata.userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        });

      if (error) {
        logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Error creating subscription:', error);
        return new NextResponse('Database Error', { status: 500 });
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      if (!session.subscription) {
        logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Missing subscription in invoice event');
        return new NextResponse('Invalid invoice data', { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Update subscription in Supabase
      const { error } = await supabase
        .from('subscriptions')
        .update({
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      if (error) {
        logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Error updating subscription:', error);
        return new NextResponse('Database Error', { status: 500 });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    logger.error({ route: 'app/api/stripe/webhook/route.ts' }, 'Webhook processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}