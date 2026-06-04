import { logger } from "@/lib/logger";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createRoute } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripeSubscriptionIdSchema = z
  .string()
  .regex(
    /^sub_[A-Za-z0-9]+$/,
    "subscription must be a valid Stripe subscription ID",
  );

const checkoutSessionPayloadSchema = z.object({
  subscription: stripeSubscriptionIdSchema,
  metadata: z.object({
    userId: z.string().uuid("metadata.userId must be a valid UUID"),
  }),
});

const invoicePayloadSchema = z.object({
  subscription: stripeSubscriptionIdSchema,
});

function getStripeId(value: unknown): unknown {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return (value as { id?: unknown }).id;
  }
  return value;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature");

    // Validate webhook signature
    if (!signature) {
      logger.error(
        { route: "app/api/stripe/webhook/route.ts" },
        "Missing Stripe signature",
      );
      return new NextResponse("Missing signature", { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logger.error(
        { route: "app/api/stripe/webhook/route.ts" },
        "Missing Stripe webhook secret",
      );
      return new NextResponse("Server configuration error", { status: 500 });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error: any) {
      logger.error(
        { route: "app/api/stripe/webhook/route.ts" },
        "Webhook signature verification failed:",
        error.message,
      );
      return new NextResponse(`Webhook Error: ${error.message}`, {
        status: 400,
      });
    }

    const session = event.data.object as any;
    const supabase = await createRoute();

    // Validate event types we handle
    const allowedEventTypes = [
      "checkout.session.completed",
      "invoice.payment_succeeded",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ];

    if (!allowedEventTypes.includes(event.type)) {
      return new NextResponse(null, { status: 200 });
    }

    if (event.type === "checkout.session.completed") {
      const parsedSession = checkoutSessionPayloadSchema.safeParse({
        subscription: getStripeId(session.subscription),
        metadata: session.metadata,
      });

      if (!parsedSession.success) {
        logger.error(
          {
            route: "app/api/stripe/webhook/route.ts",
            issues: parsedSession.error.flatten().fieldErrors,
          },
          "Invalid checkout session payload",
        );
        return new NextResponse("Invalid session data", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        parsedSession.data.subscription,
      );

      // Upsert so Stripe retries for the same subscription are idempotent.
      const { error } = await supabase.from("subscriptions").upsert(
        {
          user_id: parsedSession.data.metadata.userId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        },
        { onConflict: "stripe_subscription_id" },
      );

      if (error) {
        logger.error(
          { route: "app/api/stripe/webhook/route.ts" },
          "Error upserting subscription:",
          error,
        );
        return new NextResponse("Database Error", { status: 500 });
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const parsedInvoice = invoicePayloadSchema.safeParse({
        subscription: getStripeId(session.subscription),
      });

      if (!parsedInvoice.success) {
        logger.error(
          {
            route: "app/api/stripe/webhook/route.ts",
            issues: parsedInvoice.error.flatten().fieldErrors,
          },
          "Invalid invoice payload",
        );
        return new NextResponse("Invalid invoice data", { status: 400 });
      }

      const subscription = await stripe.subscriptions.retrieve(
        parsedInvoice.data.subscription,
      );

      // Update subscription in Supabase
      const { data: updatedRows, error } = await supabase
        .from("subscriptions")
        .update({
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id)
        .select("id");

      if (error) {
        logger.error(
          { route: "app/api/stripe/webhook/route.ts" },
          "Error updating subscription:",
          error,
        );
        return new NextResponse("Database Error", { status: 500 });
      }

      if (!updatedRows?.length) {
        logger.error(
          {
            route: "app/api/stripe/webhook/route.ts",
            stripeSubscriptionId: subscription.id,
          },
          "Invoice webhook did not match an existing subscription",
        );
        return new NextResponse("Subscription not found", { status: 409 });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    logger.error(
      { route: "app/api/stripe/webhook/route.ts" },
      "Webhook processing error:",
      error,
    );
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
