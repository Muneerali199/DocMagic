import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  console.log("👉 Request received at /api/stripe/create-checkout");

  try {
    const body = await req.json();
    const { priceId , email,userId} = body;

    console.log("👉 Request body:", body);

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId in request body" }, { status: 400 });
    }

    const stripeSecretKey = process.env.SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey || !appUrl) {
      console.error("❌ Missing environment variables", { stripeSecretKey, appUrl });
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });

 const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }],
  success_url: `${appUrl}?status=success`,
  cancel_url: `${appUrl}`,
  customer_email: email,
  billing_address_collection: 'required',
  metadata: {
    userId: userId, // ✅ Ye tumhe frontend se pass karna hoga
  },
});



    console.log("✅ Stripe session created:", session.url);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("❌ Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
