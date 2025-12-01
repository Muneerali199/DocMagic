import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createRoute } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST() {
  try {
    const supabase = await createRoute();
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get user data with subscription
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, subscription:subscriptions(stripe_subscription_id)')
      .eq('email', session.user.email)
      .single();

    if (userError || !userData) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user has a subscription
    if (!userData.subscription || !userData.subscription[0]?.stripe_subscription_id) {
      return new NextResponse("No subscription found", { status: 400 });
    }

    // Create Stripe billing portal session
    const stripeSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id!,
      return_url: `${DOMAIN}/settings`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}