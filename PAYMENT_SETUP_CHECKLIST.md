# 🎯 Payment Gateway Setup Checklist

Use this checklist to track your progress setting up the payment system.

## Phase 1: Stripe Account Setup (15 min)

### Create Stripe Account
- [ ] Go to https://dashboard.stripe.com/register
- [ ] Create account or sign in
- [ ] Verify email address
- [ ] Complete business information

### Get API Keys
- [ ] Go to Developers → API Keys
- [ ] Copy **Publishable key** (starts with `pk_test_`)
- [ ] Copy **Secret key** (starts with `sk_test_`)
- [ ] Add to `.env`:
  ```env
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  ```

### Create Products & Prices
- [ ] Go to Products → Add Product

#### Individual Monthly
- [ ] Name: "Individual Monthly"
- [ ] Description: "Perfect for individuals and freelancers"
- [ ] Price: $9.99 USD
- [ ] Billing: Recurring - Monthly
- [ ] Copy Price ID: `price_________________`
- [ ] Add to `.env` as `STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY`

#### Individual Yearly
- [ ] Name: "Individual Yearly"
- [ ] Description: "Save 20% with annual billing"
- [ ] Price: $95.88 USD
- [ ] Billing: Recurring - Yearly
- [ ] Copy Price ID: `price_________________`
- [ ] Add to `.env` as `STRIPE_PRICE_ID_INDIVIDUAL_YEARLY`

#### Organization Monthly
- [ ] Name: "Organization Monthly"
- [ ] Description: "For teams and organizations"
- [ ] Price: $49.99 USD
- [ ] Billing: Recurring - Monthly
- [ ] Copy Price ID: `price_________________`
- [ ] Add to `.env` as `STRIPE_PRICE_ID_ORGANIZATION_MONTHLY`

#### Organization Yearly
- [ ] Name: "Organization Yearly"  
- [ ] Description: "Save 20% with annual billing"
- [ ] Price: $479.88 USD
- [ ] Billing: Recurring - Yearly
- [ ] Copy Price ID: `price_________________`
- [ ] Add to `.env` as `STRIPE_PRICE_ID_ORGANIZATION_YEARLY`

## Phase 2: Database Setup (10 min)

### Run Migration
- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Open file: `supabase/migrations/20251109000000_add_payment_system.sql`
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click "RUN"
- [ ] Verify success message

### Verify Tables Created
- [ ] Go to Table Editor
- [ ] Check table exists: `subscription_plans`
- [ ] Check table exists: `user_subscriptions`
- [ ] Check table exists: `payment_history`
- [ ] Check table exists: `usage_tracking`

### Update Stripe Price IDs in Database
- [ ] Go back to SQL Editor
- [ ] Run these commands (replace with your actual Price IDs):

```sql
-- Update Individual Monthly
UPDATE subscription_plans 
SET stripe_price_id = 'price_your_actual_price_id_here'
WHERE name = 'Individual Monthly';

-- Update Individual Yearly
UPDATE subscription_plans 
SET stripe_price_id = 'price_your_actual_price_id_here'
WHERE name = 'Individual Yearly';

-- Update Organization Monthly
UPDATE subscription_plans 
SET stripe_price_id = 'price_your_actual_price_id_here'
WHERE name = 'Organization Monthly';

-- Update Organization Yearly
UPDATE subscription_plans 
SET stripe_price_id = 'price_your_actual_price_id_here'
WHERE name = 'Organization Yearly';

-- Verify all updated
SELECT name, stripe_price_id FROM subscription_plans;
```

- [ ] All 4 plans show real Stripe Price IDs

## Phase 3: Webhook Setup (10 min)

### Local Development
- [ ] Install Stripe CLI
  - Windows: Download from https://github.com/stripe/stripe-cli/releases
  - Or: `choco install stripe-cli`
  - Mac: `brew install stripe/stripe-cli/stripe`

- [ ] Login to Stripe CLI
  ```powershell
  stripe login
  ```

- [ ] Start your Next.js app
  ```powershell
  npm run dev
  ```

- [ ] In a new terminal, forward webhooks
  ```powershell
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

- [ ] Copy the webhook signing secret (starts with `whsec_`)
- [ ] Add to `.env`:
  ```env
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```

- [ ] Keep the stripe listen command running while testing

## Phase 4: Environment Variables (5 min)

### Complete .env File
- [ ] Open `.env` file
- [ ] Verify all Stripe variables are set:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
GOOGLE_API_KEY=...
MISTRAL_API_KEY=...

# Stripe (NEW)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (NEW)
STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY=price_...
STRIPE_PRICE_ID_INDIVIDUAL_YEARLY=price_...
STRIPE_PRICE_ID_ORGANIZATION_MONTHLY=price_...
STRIPE_PRICE_ID_ORGANIZATION_YEARLY=price_...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] Save file
- [ ] Restart dev server: `npm run dev`

## Phase 5: Test Payment Flow (15 min)

### Test User Signup
- [ ] Go to http://localhost:3000/auth/sign-up
- [ ] Create test account
- [ ] Verify email received (if configured)
- [ ] Sign in successfully

### Test Pricing Page
- [ ] Go to http://localhost:3000/pricing
- [ ] Pricing page loads correctly
- [ ] See 3 pricing cards (Free, Individual, Organization)
- [ ] Toggle between Monthly/Yearly works
- [ ] Prices update correctly

### Test Checkout Flow
- [ ] Click "Subscribe Now" on Individual Monthly
- [ ] Redirects to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/25)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] ZIP: Any 5 digits (e.g., 12345)
- [ ] Click "Subscribe"
- [ ] Payment processes successfully

### Test Webhook Processing
- [ ] Check terminal running `stripe listen`
- [ ] See webhook events received:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `invoice.payment_succeeded`
- [ ] No errors in webhook processing

### Test Success Page
- [ ] Redirected to `/subscription/success`
- [ ] Success message displays
- [ ] Confetti or celebration animation shows
- [ ] "Create Presentation" button works
- [ ] "Manage Subscription" button works

### Test Subscription Page
- [ ] Go to http://localhost:3000/subscription
- [ ] Current plan shows correctly
- [ ] Billing cycle dates accurate
- [ ] Status shows "active"
- [ ] "Manage Billing" button works

### Test Billing Portal
- [ ] Click "Manage Billing"
- [ ] Redirects to Stripe Customer Portal
- [ ] Can see payment method
- [ ] Can see invoices
- [ ] Can cancel subscription (don't cancel yet!)

### Verify Database
- [ ] Open Supabase Table Editor
- [ ] Check `user_subscriptions`:
  - [ ] New row for your user
  - [ ] `status` = 'active'
  - [ ] `stripe_customer_id` populated
  - [ ] `stripe_subscription_id` populated
  - [ ] Dates look correct
  
- [ ] Check `payment_history`:
  - [ ] Payment recorded
  - [ ] Amount correct ($9.99)
  - [ ] Status 'succeeded'

### Test Usage Tracking (If Applied)
- [ ] Go to presentation creation
- [ ] Create a test presentation
- [ ] Check `usage_tracking` table
- [ ] New row created for your action

## Phase 6: Protect Other Routes (20 min)

### Apply Protection Pattern
For each creation endpoint, add authentication and usage checks:

- [ ] `/api/generate/resume/route.ts`
- [ ] `/api/generate/cv/route.ts`
- [ ] `/api/generate/letter/route.ts`
- [ ] `/api/generate/diagram/route.ts`
- [ ] `/api/generate/website/route.ts`

Use this pattern:
```typescript
import { createClient } from '@/lib/supabase/client';
import { checkUsageLimit, trackUsage } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  // Usage check
  const usageCheck = await checkUsageLimit(user.id, 'resource_type');
  if (!usageCheck.allowed) {
    return NextResponse.json({ error: usageCheck.message }, { status: 403 });
  }

  // ... create resource ...

  // Track usage
  await trackUsage(user.id, 'resource_type', resourceId, 'create');
}
```

## Phase 7: Test Protected Routes (10 min)

### Test Without Sign In
- [ ] Sign out
- [ ] Try to create presentation
- [ ] Should get 401 Unauthorized
- [ ] Redirected to sign in

### Test With Sign In (Free Tier)
- [ ] Create new test account
- [ ] Don't subscribe
- [ ] Create document 1 - SUCCESS
- [ ] Create document 2 - SUCCESS
- [ ] Create document 3 - SUCCESS
- [ ] Create document 4 - BLOCKED (limit reached)
- [ ] Error message shows upgrade prompt

### Test With Active Subscription
- [ ] Sign in with subscribed account
- [ ] Create 10+ documents
- [ ] All succeed (no limit)
- [ ] Usage tracked in database

## Phase 8: Production Preparation (Optional)

### Production Webhook
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] URL: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Select events:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_succeeded
  - [ ] invoice.payment_failed
- [ ] Copy webhook secret
- [ ] Add to production environment variables

### Live API Keys
- [ ] Switch to Live mode in Stripe Dashboard
- [ ] Get live publishable key
- [ ] Get live secret key
- [ ] Create live products (same as test)
- [ ] Update production environment variables

### Enable Billing Portal
- [ ] Go to Settings → Billing → Customer Portal
- [ ] Toggle "Allow customers to..."
- [ ] Customize branding (logo, colors)
- [ ] Set business details
- [ ] Save changes

## ✅ Final Verification

- [ ] Payment flow works end-to-end
- [ ] Webhooks update database correctly
- [ ] Subscription page shows accurate data
- [ ] Billing portal accessible
- [ ] Usage limits enforced
- [ ] Authentication required for all protected routes
- [ ] Free tier works (3 documents)
- [ ] Paid tier works (unlimited)
- [ ] No console errors
- [ ] No database errors

## 📊 Success Metrics

After setup, you should see:
- [ ] Test payment in Stripe Dashboard
- [ ] Customer created in Stripe
- [ ] Active subscription in Stripe
- [ ] Data in all 4 database tables
- [ ] Webhook events showing in Stripe logs
- [ ] No errors in application logs

## 🎉 You're Done!

Congratulations! Your payment gateway is fully set up and working!

### Next Steps:
1. [ ] Read `PAYMENT_FLOW_DIAGRAM.md` to understand the architecture
2. [ ] Review `PAYMENT_SETUP_GUIDE.md` for advanced configuration
3. [ ] Customize pricing and features as needed
4. [ ] Add more payment options (if desired)
5. [ ] Monitor Stripe Dashboard daily
6. [ ] Set up email notifications for failed payments
7. [ ] Consider adding a free trial period

### Resources:
- **Setup Guide**: `PAYMENT_SETUP_GUIDE.md`
- **Quick Reference**: `PAYMENT_QUICK_START.md`
- **Flow Diagram**: `PAYMENT_FLOW_DIAGRAM.md`
- **Implementation Summary**: `PAYMENT_IMPLEMENTATION_SUMMARY.md`

---

**Track your progress by checking off items as you complete them! ✅**

**Questions?** All documentation includes troubleshooting sections.

**Ready to go live?** Follow Phase 8 for production deployment.
