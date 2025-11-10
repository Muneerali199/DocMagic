# 🚨 Quick Fix Guide

## Issues Found & Solutions

### ✅ Issue 1: Auth Route 404 Error - FIXED!
**Error**: `GET http://localhost:3000/auth/sign-in?redirect=%2Fpricing 404 (Not Found)`

**Root Cause**: Your auth routes use `/auth/signin` not `/auth/sign-in` (no hyphen)

**Solution**: ✅ Already fixed in the code!
- Updated `components/pricing/pricing-plans.tsx`
- Updated `app/subscription/page.tsx`
- Changed all `/auth/sign-in` to `/auth/signin`

---

## 📋 What You Need to Do Next

### Step 1: Verify Database Migration ⏱️ 2 minutes

You said you ran the migration - let's verify it worked:

**Option A: Use the Diagnostic Page (Easiest)**
```
1. Make sure dev server is running: npm run dev
2. Visit: http://localhost:3000/diagnostic
3. Check if all tables show ✅
```

**Option B: Run Verification SQL**
```
1. Open Supabase Dashboard → SQL Editor
2. Run the file: supabase/verify_payment_migration.sql
3. Check results - should show 4 tables exist
```

### Step 2: Update Stripe Price IDs in Database ⏱️ 3 minutes

Your `.env` has placeholder Price IDs. You need to:

**A. Create Products in Stripe**
1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Create these 4 products:

```
Product 1: Individual Monthly
- Price: $9.99 USD
- Recurring: Monthly
- Copy the Price ID (starts with price_)

Product 2: Individual Yearly
- Price: $95.88 USD
- Recurring: Yearly
- Copy the Price ID

Product 3: Organization Monthly
- Price: $49.99 USD
- Recurring: Monthly
- Copy the Price ID

Product 4: Organization Yearly
- Price: $479.88 USD
- Recurring: Yearly
- Copy the Price ID
```

**B. Update .env**
Replace the placeholders with your real Price IDs:
```env
STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY=price_xxxxx (your real ID)
STRIPE_PRICE_ID_INDIVIDUAL_YEARLY=price_xxxxx (your real ID)
STRIPE_PRICE_ID_ORGANIZATION_MONTHLY=price_xxxxx (your real ID)
STRIPE_PRICE_ID_ORGANIZATION_YEARLY=price_xxxxx (your real ID)
```

**C. Update Database**
Run this SQL in Supabase:
```sql
UPDATE subscription_plans 
SET stripe_price_id = 'price_YOUR_REAL_ID_HERE'
WHERE name = 'Individual Monthly';

UPDATE subscription_plans 
SET stripe_price_id = 'price_YOUR_REAL_ID_HERE'
WHERE name = 'Individual Yearly';

UPDATE subscription_plans 
SET stripe_price_id = 'price_YOUR_REAL_ID_HERE'
WHERE name = 'Organization Monthly';

UPDATE subscription_plans 
SET stripe_price_id = 'price_YOUR_REAL_ID_HERE'
WHERE name = 'Organization Yearly';
```

### Step 3: Restart Dev Server ⏱️ 1 minute

After updating `.env`:
```powershell
# Stop the server (Ctrl+C)
npm run dev
```

### Step 4: Test the Flow ⏱️ 5 minutes

```
1. Go to: http://localhost:3000/pricing
2. Should see 3 pricing cards
3. Click "Subscribe Now" on Individual Monthly
4. Should redirect to /auth/signin (not 404!)
5. Sign in with your account
6. Should redirect to Stripe checkout
7. Use test card: 4242 4242 4242 4242
8. Complete payment
9. Should redirect to /subscription/success
```

---

## 🔍 Diagnostic Tools

### Quick Diagnostic Page
```
URL: http://localhost:3000/diagnostic

This page shows:
✅ Environment variables status
✅ Database tables status
✅ Subscription plans
✅ Next steps
✅ Quick links
```

### Verify Migration SQL
```
File: supabase/verify_payment_migration.sql

Run in Supabase SQL Editor to check:
- Tables exist
- Plans are inserted
- Functions created
- RLS policies active
- Indexes created
```

---

## ⚡ Quick Commands

```powershell
# Start dev server
npm run dev

# Open Stripe CLI for webhooks (in new terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check if Stripe keys are valid
stripe --version
stripe login
```

---

## 🎯 Expected Results After Setup

1. ✅ Pricing page loads at `/pricing`
2. ✅ Clicking Subscribe redirects to `/auth/signin` (not 404)
3. ✅ After sign in, redirects to Stripe checkout
4. ✅ Payment succeeds with test card
5. ✅ Redirects to `/subscription/success`
6. ✅ Can view subscription at `/subscription`
7. ✅ Can manage billing via Stripe portal

---

## 🆘 Still Having Issues?

### If you see 404 on /auth/signin
Check if the file exists:
```
app/auth/signin/page.tsx
```
If not, you might need to create it.

### If database tables don't exist
Re-run the migration:
```
1. Open Supabase → SQL Editor
2. Copy entire contents of: supabase/migrations/20251109000000_add_payment_system.sql
3. Paste and run
4. Should see "Success" message
```

### If Stripe checkout fails
1. Check browser console for errors
2. Verify STRIPE_SECRET_KEY in .env
3. Verify Price IDs are real (not placeholders)
4. Check Stripe Dashboard → Logs for errors

### If webhooks don't work
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Copy webhook secret to .env
4. Restart dev server

---

## 📊 Current Status

Based on your `.env` file:
- ✅ Stripe publishable key: Set
- ✅ Stripe secret key: Set  
- ✅ Webhook secret: Set
- ⚠️ Price IDs: Placeholders (need real IDs from Stripe Dashboard)

Next action: **Create Stripe products and update Price IDs**

---

## 🎉 You're Almost There!

The code is ready, you just need to:
1. ✅ Verify migration ran (use /diagnostic page)
2. 🔄 Create Stripe products → Get real Price IDs
3. 🔄 Update .env and database with real Price IDs
4. ✅ Restart server
5. ✅ Test payment flow

Total time remaining: **~10 minutes**

---

**Need help?** Check:
- `/diagnostic` page for system status
- `PAYMENT_SETUP_CHECKLIST.md` for detailed steps
- `PAYMENT_QUICK_START.md` for quick reference
