# Payment Gateway Flow Diagram

## 🔄 Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

1. USER VISITS PRICING PAGE
   │
   ▼
┌──────────────────┐
│   /pricing       │  ← Beautiful pricing cards
│                  │  ← Individual vs Organization
│  [Subscribe]     │  ← Monthly vs Yearly toggle
└──────────────────┘
   │
   ▼
2. AUTHENTICATION CHECK
   │
   ├─ Not Signed In? ──→ Redirect to /auth/sign-in
   │
   ▼
3. CREATE CHECKOUT SESSION
   │
   ▼
┌──────────────────────────────────────────┐
│  POST /api/stripe/create-checkout-session│
│                                          │
│  1. Get user from Supabase Auth         │
│  2. Get/Create Stripe customer ID       │
│  3. Create Stripe checkout session      │
│  4. Return checkout URL                 │
└──────────────────────────────────────────┘
   │
   ▼
4. REDIRECT TO STRIPE
   │
   ▼
┌──────────────────┐
│  Stripe Checkout │  ← Secure Stripe hosted page
│                  │  ← User enters card details
│  [💳 Pay Now]    │  ← Test: 4242 4242 4242 4242
└──────────────────┘
   │
   ▼
5. PAYMENT PROCESSING
   │
   ├─ Success ──────────┐
   │                    │
   ▼                    ▼
┌────────────────┐   ┌─────────────────────────┐
│ Stripe Webhook │   │ User Redirected         │
│                │   │ /subscription/success   │
│ Events:        │   └─────────────────────────┘
│ - checkout.    │
│   session.     │
│   completed    │
│                │
│ - customer.    │
│   subscription │
│   .created     │
└────────────────┘
   │
   ▼
6. UPDATE DATABASE
   │
   ▼
┌──────────────────────────────────────────┐
│  POST /api/webhooks/stripe               │
│                                          │
│  1. Verify webhook signature            │
│  2. Process event                       │
│  3. Update user_subscriptions table     │
│  4. Record in payment_history           │
└──────────────────────────────────────────┘
   │
   ▼
7. USER HAS ACTIVE SUBSCRIPTION ✅
```

## 📊 Database Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE STRUCTURE                        │
└─────────────────────────────────────────────────────────────┘

subscription_plans (Pre-populated)
┌──────────────────────────────────────┐
│ id | name | price | stripe_price_id │
├──────────────────────────────────────┤
│ 1  | Individual Monthly | $9.99     │
│ 2  | Individual Yearly  | $95.88    │
│ 3  | Organization Monthly| $49.99   │
│ 4  | Organization Yearly | $479.88  │
└──────────────────────────────────────┘
           │
           ▼ (Referenced by)
user_subscriptions (Created on payment)
┌─────────────────────────────────────────────────────┐
│ id | user_id | plan_id | stripe_subscription_id  │
│    |         | status  | current_period_end      │
├─────────────────────────────────────────────────────┤
│ 1  | user123 | plan2   | sub_abc123 | active    │
│    |         |         | 2025-12-01              │
└─────────────────────────────────────────────────────┘
           │
           ▼ (Tracks payments)
payment_history (Updated on each payment)
┌──────────────────────────────────────────────────────┐
│ id | user_id | amount | status | stripe_invoice_id │
├──────────────────────────────────────────────────────┤
│ 1  | user123 | $9.99  | succeeded | inv_abc123    │
│ 2  | user123 | $9.99  | succeeded | inv_def456    │
└──────────────────────────────────────────────────────┘

usage_tracking (Records every action)
┌──────────────────────────────────────────────────────┐
│ id | user_id | resource_type | action | created_at │
├──────────────────────────────────────────────────────┤
│ 1  | user123 | presentation  | create | 2025-11-01 │
│ 2  | user123 | resume        | create | 2025-11-02 │
│ 3  | user123 | presentation  | export | 2025-11-03 │
└──────────────────────────────────────────────────────┘
```

## 🔒 Protection Flow (When Creating Documents)

```
┌─────────────────────────────────────────────────────────┐
│        DOCUMENT CREATION WITH PROTECTION                 │
└─────────────────────────────────────────────────────────┘

User clicks "Create Presentation"
   │
   ▼
┌──────────────────────────────────────┐
│ POST /api/generate/presentation      │
└──────────────────────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 1. AUTH CHECK       │
│ ✅ Signed in?       │
└─────────────────────┘
   │
   ├─ NO ──→ 401 Unauthorized ──→ Redirect to /auth/sign-in
   │
   ▼ YES
┌─────────────────────────────────────┐
│ 2. USAGE LIMIT CHECK                │
│ call check_user_limit()             │
│                                     │
│ Query database:                     │
│ - Get user's subscription plan      │
│ - Get plan's limits                 │
│ - Count this month's usage          │
│                                     │
│ Free tier: 3/month                  │
│ Individual: 999/month               │
│ Organization: 9999/month            │
└─────────────────────────────────────┘
   │
   ├─ LIMIT REACHED ──→ 403 Forbidden ──→ Show upgrade prompt
   │
   ▼ UNDER LIMIT
┌─────────────────────┐
│ 3. GENERATE DOCUMENT│
│ AI creates content  │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 4. TRACK USAGE      │
│ INSERT INTO         │
│ usage_tracking      │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│ 5. RETURN DOCUMENT  │
│ + Usage stats       │
└─────────────────────┘
   │
   ▼
SUCCESS ✅
```

## 🎯 Subscription Management Flow

```
User visits /subscription
   │
   ▼
┌────────────────────────────────────┐
│ Query user_subscriptions           │
│ JOIN subscription_plans            │
│                                    │
│ Display:                           │
│ - Current plan name                │
│ - Monthly/Yearly price             │
│ - Billing cycle dates              │
│ - Status (active/canceled)         │
│ - Cancellation info (if any)       │
└────────────────────────────────────┘
   │
   ▼
User clicks "Manage Billing"
   │
   ▼
┌────────────────────────────────────┐
│ POST /api/stripe/create-portal-    │
│      session                       │
│                                    │
│ 1. Get stripe_customer_id          │
│ 2. Create portal session           │
│ 3. Return portal URL               │
└────────────────────────────────────┘
   │
   ▼
Redirect to Stripe Customer Portal
   │
   ▼
┌────────────────────────────────────┐
│ Stripe Billing Portal              │
│                                    │
│ User can:                          │
│ - Update payment method            │
│ - Change subscription plan         │
│ - View invoices                    │
│ - Cancel subscription              │
│ - Update billing address           │
└────────────────────────────────────┘
   │
   ▼
Changes trigger webhooks ──→ Update database automatically
```

## 🔔 Webhook Events Flow

```
Stripe sends webhook to /api/webhooks/stripe
   │
   ▼
┌────────────────────────────────────┐
│ Verify signature with              │
│ STRIPE_WEBHOOK_SECRET              │
└────────────────────────────────────┘
   │
   ├─ Invalid ──→ Return 400
   │
   ▼ Valid
┌────────────────────────────────────┐
│ Process event based on type:       │
│                                    │
│ checkout.session.completed         │
│ ├─→ Create user_subscriptions      │
│ └─→ Record payment_history         │
│                                    │
│ customer.subscription.updated      │
│ └─→ Update user_subscriptions      │
│                                    │
│ customer.subscription.deleted      │
│ └─→ Set status = 'canceled'        │
│                                    │
│ invoice.payment_succeeded          │
│ └─→ Record in payment_history      │
│                                    │
│ invoice.payment_failed             │
│ ├─→ Update status = 'past_due'     │
│ └─→ Record failed payment          │
└────────────────────────────────────┘
   │
   ▼
Database automatically updated ✅
User sees changes in /subscription
```

## 🎨 Frontend Pages Map

```
/pricing
├─ Shows 3 pricing tiers
│  ├─ Free (0$)
│  ├─ Individual ($9.99 or $95.88)
│  └─ Organization ($49.99 or $479.88)
│
├─ Monthly/Yearly toggle
│
└─ Click "Subscribe" ──→ /api/stripe/create-checkout-session

/subscription
├─ Shows current plan
├─ Billing cycle dates
├─ Status badge
├─ Cancellation warnings
└─ Buttons:
   ├─ "Manage Billing" ──→ Stripe Portal
   └─ "Change Plan" ──→ /pricing

/subscription/success
├─ Success animation
├─ Welcome message
└─ Next steps:
   ├─ "Create Presentation"
   └─ "Manage Subscription"
```

## 📱 API Routes Map

```
/api
├─ /stripe
│  ├─ /create-checkout-session (POST)
│  │  └─ Creates Stripe checkout
│  │
│  └─ /create-portal-session (POST)
│     └─ Opens billing portal
│
├─ /webhooks
│  └─ /stripe (POST)
│     └─ Handles Stripe events
│
└─ /generate
   ├─ /presentation (POST) [PROTECTED]
   ├─ /resume (POST) [NEEDS PROTECTION]
   ├─ /cv (POST) [NEEDS PROTECTION]
   ├─ /letter (POST) [NEEDS PROTECTION]
   └─ /diagram (POST) [NEEDS PROTECTION]
```

## 🔐 Security Layers

```
Layer 1: Authentication
└─ Supabase Auth checks user is signed in

Layer 2: Usage Limits
└─ Database function checks monthly quota

Layer 3: Stripe Webhook Verification
└─ Signature validation prevents fake events

Layer 4: Row Level Security (RLS)
└─ Users can only see their own data

Layer 5: HTTPS
└─ All traffic encrypted in production
```

## 💰 Revenue Flow

```
Monthly Recurring Revenue (MRR) Calculation:

Individual Monthly: $9.99 × # of subscribers
Individual Yearly: $95.88 ÷ 12 × # of subscribers
Organization Monthly: $49.99 × # of subscribers
Organization Yearly: $479.88 ÷ 12 × # of subscribers

Total MRR = Sum of all above

Annual Recurring Revenue (ARR) = MRR × 12
```

---

**This visual guide shows how every piece connects together! 🎯**

For implementation details, see:
- `PAYMENT_SETUP_GUIDE.md` - Step-by-step setup
- `PAYMENT_QUICK_START.md` - Quick reference
- `PAYMENT_IMPLEMENTATION_SUMMARY.md` - Feature overview
