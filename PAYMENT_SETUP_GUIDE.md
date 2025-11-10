# Complete Payment Gateway Setup Guide

## 🎯 Overview
This guide will help you set up a complete Stripe payment gateway with subscription management for DocMagic.

## ✅ What's Been Created

### 1. Database Schema (`supabase/migrations/20251109000000_add_payment_system.sql`)
- ✅ `subscription_plans` - Store different pricing tiers
- ✅ `user_subscriptions` - Track user subscriptions
- ✅ `payment_history` - Record all payment transactions
- ✅ `usage_tracking` - Monitor feature usage
- ✅ Row Level Security (RLS) policies
- ✅ Database functions for limit checking

### 2. Stripe Integration (`lib/stripe.ts`)
- ✅ Customer creation/retrieval
- ✅ Checkout session creation
- ✅ Billing portal access
- ✅ Subscription management functions

### 3. API Endpoints
- ✅ `/api/stripe/create-checkout-session` - Start subscription
- ✅ `/api/stripe/create-portal-session` - Manage billing
- ✅ `/api/webhooks/stripe` - Handle Stripe events

### 4. Frontend Components
- ✅ `components/pricing/pricing-plans.tsx` - Beautiful pricing page
- ✅ `app/subscription/page.tsx` - Subscription management
- ✅ `app/subscription/success/page.tsx` - Success page

### 5. Authentication Middleware
- ✅ `lib/auth/middleware.ts` - Auth and usage limit checks

## 📋 Setup Instructions

### Step 1: Get Stripe API Keys

1. **Create/Login to Stripe Account**
   - Go to https://dashboard.stripe.com/
   - Create account or sign in

2. **Get API Keys**
   - Go to Developers → API keys
   - Copy **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - Copy **Secret key** (starts with `sk_test_` or `sk_live_`)

3. **Add to `.env` file**
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   ```

### Step 2: Create Stripe Products & Prices

1. **Go to Stripe Dashboard → Products**

2. **Create Individual Monthly Plan**
   - Name: Individual Monthly
   - Price: $9.99 USD
   - Billing: Recurring - Monthly
   - Copy the Price ID (starts with `price_`)

3. **Create Individual Yearly Plan**
   - Name: Individual Yearly
   - Price: $95.88 USD
   - Billing: Recurring - Yearly
   - Copy the Price ID

4. **Create Organization Monthly Plan**
   - Name: Organization Monthly
   - Price: $49.99 USD
   - Billing: Recurring - Monthly
   - Copy the Price ID

5. **Create Organization Yearly Plan**
   - Name: Organization Yearly
   - Price: $479.88 USD
   - Billing: Recurring - Yearly
   - Copy the Price ID

6. **Add Price IDs to `.env`**
   ```env
   STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY=price_xxxxx
   STRIPE_PRICE_ID_INDIVIDUAL_YEARLY=price_xxxxx
   STRIPE_PRICE_ID_ORGANIZATION_MONTHLY=price_xxxxx
   STRIPE_PRICE_ID_ORGANIZATION_YEARLY=price_xxxxx
   ```

### Step 3: Set Up Stripe Webhooks

1. **Install Stripe CLI (for testing)**
   ```powershell
   # Download from: https://stripe.com/docs/stripe-cli
   # Or use: choco install stripe-cli
   ```

2. **For Local Development**
   ```powershell
   # Start your Next.js app
   npm run dev

   # In another terminal, forward webhooks
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   
   # Copy the webhook secret (starts with whsec_)
   ```

3. **Add Webhook Secret to `.env`**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

4. **For Production**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy webhook secret and add to production environment variables

### Step 4: Run Database Migration

1. **Connect to Supabase**
   ```powershell
   # Go to Supabase dashboard
   # Navigate to SQL Editor
   ```

2. **Run the Migration**
   - Open `supabase/migrations/20251109000000_add_payment_system.sql`
   - Copy all contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify Tables Created**
   - Check Table Editor for:
     - subscription_plans
     - user_subscriptions
     - payment_history
     - usage_tracking

4. **Update Stripe Price IDs in Database**
   ```sql
   UPDATE subscription_plans 
   SET stripe_price_id = 'your_actual_price_id_from_stripe'
   WHERE name = 'Individual Monthly';
   
   -- Repeat for all 4 plans
   ```

### Step 5: Add Environment Variables

Complete `.env` file should have:

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
GOOGLE_API_KEY=your_google_key
MISTRAL_API_KEY=your_mistral_key

# NEW - Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# NEW - Stripe Price IDs
STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_INDIVIDUAL_YEARLY=price_xxxxx
STRIPE_PRICE_ID_ORGANIZATION_MONTHLY=price_xxxxx
STRIPE_PRICE_ID_ORGANIZATION_YEARLY=price_xxxxx

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 6: Test the Payment Flow

1. **Use Stripe Test Cards**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date
   - Any 3-digit CVC

2. **Test Flow**
   ```
   1. Go to /pricing
   2. Click "Subscribe Now"
   3. Sign in if not authenticated
   4. You'll be redirected to Stripe Checkout
   5. Use test card: 4242 4242 4242 4242
   6. Complete payment
   7. You'll be redirected to /subscription/success
   8. Check /subscription to see your active plan
   ```

3. **Verify in Stripe Dashboard**
   - Go to Payments → see test payment
   - Go to Customers → see new customer
   - Go to Subscriptions → see active subscription

### Step 7: Protect Routes with Authentication

Example for presentation creation:

```typescript
// app/api/generate/presentation/route.ts
import { requireAuth, checkUsageLimit, trackUsage } from '@/lib/auth/middleware';

export async function POST(req: Request) {
  // Check authentication
  const { authenticated, user } = await requireAuth(req);
  if (!authenticated || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check usage limits
  const usageCheck = await checkUsageLimit(user.id, 'presentation');
  if (!usageCheck.allowed) {
    return NextResponse.json({ 
      error: usageCheck.message || 'Limit reached'
    }, { status: 403 });
  }

  // Generate presentation...
  const presentationId = 'newly_created_id';

  // Track usage
  await trackUsage(user.id, 'presentation', presentationId, 'create');

  return NextResponse.json({ success: true });
}
```

## 🧪 Testing Checklist

- [ ] Can view pricing plans
- [ ] Sign in required before checkout
- [ ] Stripe checkout opens correctly
- [ ] Test card payment works
- [ ] Webhook receives events (check terminal logs)
- [ ] Subscription appears in database
- [ ] Success page shows correctly
- [ ] Subscription management page works
- [ ] Can access billing portal
- [ ] Usage limits work
- [ ] Authentication protects routes

## 🚀 Going Live

1. **Switch to Live Mode**
   - Get live API keys from Stripe
   - Create live products and prices
   - Update environment variables

2. **Update Webhook Endpoint**
   - Add production webhook in Stripe Dashboard
   - Use production URL
   - Update STRIPE_WEBHOOK_SECRET

3. **Enable Billing Portal**
   - Go to Stripe → Settings → Billing Portal
   - Enable customer portal
   - Configure allowed actions

## 📊 Monitoring

- **Stripe Dashboard**: Monitor payments, subscriptions, and customers
- **Supabase Dashboard**: Check database tables and usage
- **Application Logs**: Monitor webhook processing and errors

## 🆘 Troubleshooting

### Webhook Not Receiving Events
- Check Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook secret in `.env`
- Check terminal logs for errors

### TypeScript Errors
- Run: `npm install --save-dev @stripe/stripe-js stripe`
- Regenerate Supabase types (see below)

### Subscription Not Showing
- Check webhook logs in Stripe Dashboard
- Verify database migration ran successfully
- Check Supabase logs for errors

## 🔄 Regenerate Supabase Types (Optional)

```powershell
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## 📝 Next Steps

1. Add usage tracking to all document creation endpoints
2. Create admin dashboard to view subscriptions
3. Add email notifications for payment events
4. Implement team features for organization plans
5. Add analytics to track conversion rates

## 💡 Features to Add

- [ ] Annual discount banners
- [ ] Free trial period
- [ ] Promo codes
- [ ] Referral program
- [ ] Usage analytics dashboard
- [ ] Email invoices
- [ ] Custom branding for organizations
- [ ] Team member management

---

## ✅ Summary

You now have:
- ✅ Complete database schema
- ✅ Stripe integration
- ✅ Beautiful pricing page
- ✅ Subscription management
- ✅ Webhook handling
- ✅ Usage tracking system
- ✅ Authentication middleware

**All services now require sign-in** (when you implement the middleware)
**Payment gateway supports Individual and Organization plans**
**Both monthly and yearly billing options available**
