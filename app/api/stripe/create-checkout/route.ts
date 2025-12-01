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

    // Get user data from database
    const { data: userData, error: userDbError } = await supabase
      .from("users")
      .select("*, subscription:subscriptions(*)")
      .eq("email", session.user.email)
      .single();

    if (userDbError || !userData) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (userData.subscription && userData.subscription.length > 0) {
      return new NextResponse("Already subscribed", { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${DOMAIN}/settings?success=true`,
      cancel_url: `${DOMAIN}/settings?canceled=true`,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: userData.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userData.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}