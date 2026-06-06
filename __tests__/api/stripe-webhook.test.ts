import { describe, it, expect, beforeEach, jest } from "@jest/globals";

type Builder = Record<string, jest.Mock>;

const constructEvent = jest.fn();
const retrieveSubscription = jest.fn();
const getHeader = jest.fn();
const createClient = jest.fn();
const loggerError = jest.fn();
const loggerInfo = jest.fn();

jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent,
    },
    subscriptions: {
      retrieve: retrieveSubscription,
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: () => ({
    get: getHeader,
  }),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient,
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    error: loggerError,
    info: loggerInfo,
  },
}));

function makeBuilder(): Builder {
  const builder: Builder = {};
  for (const method of [
    "select",
    "eq",
    "single",
    "upsert",
    "update",
    "insert",
  ]) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  return builder;
}

function makeSupabase() {
  const tableBuilders = new Map<string, Builder>();
  for (const table of [
    "subscription_plans",
    "user_subscriptions",
    "payment_history",
  ]) {
    tableBuilders.set(table, makeBuilder());
  }
  const from = jest.fn((table: string) => {
    if (!tableBuilders.has(table)) {
      tableBuilders.set(table, makeBuilder());
    }
    return tableBuilders.get(table);
  });

  return { from, tableBuilders };
}

function makeRequest(body = '{"ok":true}') {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
  });
}

async function loadRoute() {
  jest.resetModules();
  const supabase = makeSupabase();
  createClient.mockReturnValue({ from: supabase.from });
  getHeader.mockReturnValue("valid-signature");

  const route = await import("@/app/api/webhooks/stripe/route");
  return { route, supabase };
}

function subscriptionFixture(overrides = {}) {
  return {
    id: "sub_123",
    metadata: { userId: "user-1" },
    status: "active",
    current_period_start: 1_700_000_000,
    current_period_end: 1_700_086_400,
    cancel_at_period_end: false,
    canceled_at: null,
    trial_start: null,
    trial_end: null,
    items: {
      data: [{ price: { id: "price_123" } }],
    },
    ...overrides,
  };
}

function eventFixture(type: string, object: unknown) {
  return {
    id: `evt_${type}`,
    type,
    data: { object },
  };
}

describe("Stripe webhook route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("returns 400 when the Stripe signature is missing", async () => {
    const { route } = await loadRoute();
    getHeader.mockReturnValue(null);

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "No signature" });
  });

  it("returns 400 when Stripe signature verification fails", async () => {
    const { route } = await loadRoute();
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Webhook signature verification failed",
    });
  });

  it("creates a user subscription for checkout.session.completed", async () => {
    const { route, supabase } = await loadRoute();
    const subscription = subscriptionFixture();
    retrieveSubscription.mockResolvedValue(subscription);
    constructEvent.mockReturnValue(
      eventFixture("checkout.session.completed", {
        metadata: { userId: "user-1" },
        customer: "cus_123",
        subscription: "sub_123",
      }),
    );

    supabase.tableBuilders
      .get("subscription_plans")!
      .single.mockResolvedValue({ data: { id: "plan_123" }, error: null });
    supabase.tableBuilders
      .get("user_subscriptions")!
      .upsert.mockResolvedValue({ error: null });

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(200);
    expect(retrieveSubscription).toHaveBeenCalledWith("sub_123");
    expect(supabase.from).toHaveBeenCalledWith("subscription_plans");
    expect(supabase.from).toHaveBeenCalledWith("user_subscriptions");
    expect(
      supabase.tableBuilders.get("user_subscriptions")!.upsert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        plan_id: "plan_123",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        status: "active",
      }),
    );
  });

  it("upserts current subscription details for customer.subscription.updated", async () => {
    const { route, supabase } = await loadRoute();
    constructEvent.mockReturnValue(
      eventFixture("customer.subscription.updated", subscriptionFixture()),
    );
    supabase.tableBuilders
      .get("subscription_plans")!
      .single.mockResolvedValue({ data: { id: "plan_123" }, error: null });
    supabase.tableBuilders
      .get("user_subscriptions")!
      .upsert.mockResolvedValue({ error: null });

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(200);
    expect(
      supabase.tableBuilders.get("user_subscriptions")!.upsert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        plan_id: "plan_123",
        stripe_subscription_id: "sub_123",
      }),
    );
  });

  it("marks subscriptions as canceled for customer.subscription.deleted", async () => {
    const { route, supabase } = await loadRoute();
    constructEvent.mockReturnValue(
      eventFixture("customer.subscription.deleted", subscriptionFixture()),
    );

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(200);
    const userSubscriptions = supabase.tableBuilders.get("user_subscriptions")!;
    expect(userSubscriptions.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "canceled" }),
    );
    expect(userSubscriptions.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("records payment history for invoice.payment_succeeded", async () => {
    const { route, supabase } = await loadRoute();
    constructEvent.mockReturnValue(
      eventFixture("invoice.payment_succeeded", {
        id: "in_123",
        customer: "cus_123",
        subscription: "sub_123",
        payment_intent: "pi_123",
        amount_paid: 1299,
        currency: "usd",
        payment_settings: { payment_method_types: ["card"] },
        hosted_invoice_url: "https://stripe.test/invoice",
        description: "Monthly plan",
      }),
    );
    supabase.tableBuilders
      .get("user_subscriptions")!
      .single.mockResolvedValue({
        data: { user_id: "user-1", id: "usub_1" },
        error: null,
      });
    supabase.tableBuilders
      .get("payment_history")!
      .insert.mockResolvedValue({ error: null });

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(200);
    expect(
      supabase.tableBuilders.get("payment_history")!.insert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        subscription_id: "usub_1",
        stripe_invoice_id: "in_123",
        amount: 12.99,
        status: "succeeded",
      }),
    );
  });

  it("marks the subscription past_due and records failed invoice payments", async () => {
    const { route, supabase } = await loadRoute();
    constructEvent.mockReturnValue(
      eventFixture("invoice.payment_failed", {
        id: "in_failed",
        customer: "cus_123",
        payment_intent: "pi_failed",
        amount_due: 2500,
        currency: "usd",
        payment_settings: { payment_method_types: ["card"] },
      }),
    );
    supabase.tableBuilders
      .get("user_subscriptions")!
      .single.mockResolvedValue({
        data: { user_id: "user-1", id: "usub_1" },
        error: null,
      });
    supabase.tableBuilders
      .get("payment_history")!
      .insert.mockResolvedValue({ error: null });

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(200);
    expect(
      supabase.tableBuilders.get("user_subscriptions")!.update,
    ).toHaveBeenCalledWith({
      status: "past_due",
    });
    expect(
      supabase.tableBuilders.get("payment_history")!.insert,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 25,
        status: "failed",
        stripe_invoice_id: "in_failed",
      }),
    );
  });

  it("acknowledges unhandled events without database writes", async () => {
    const { route, supabase } = await loadRoute();
    constructEvent.mockReturnValue(eventFixture("payment_intent.created", {}));

    const response = await route.POST(makeRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
