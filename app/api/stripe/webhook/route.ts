import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createRoute } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;
  const supabase = createRoute();

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    if (!session.metadata?.userId) {
      console.error("Missing userId in metadata");
      return new NextResponse("Bad Request: No userId", { status: 400 });
    }

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: session.metadata.userId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

    if (error) {
      console.error('Error creating subscription:', error);
      return new NextResponse('Database Error', { status: 500 });
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
      return new NextResponse('Database Error', { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
}
