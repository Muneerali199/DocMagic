# Security Checklist ✅

## Before Pushing to GitHub

### ✅ Completed
- [x] All sensitive keys moved to `.env` file
- [x] `.env` file is in `.gitignore`
- [x] `.env.example` created with placeholder values
- [x] Removed hardcoded Stripe Price IDs from code
- [x] Removed debug logging that exposes secrets
- [x] Using environment variables throughout codebase

### Files That Are Safe to Commit
✅ **Components:**
- `components/pricing/pricing-plans.tsx` - Uses `process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_*`

✅ **API Routes:**
- `app/api/stripe/create-checkout-session/route.ts` - Uses `process.env.STRIPE_SECRET_KEY`
- `app/api/stripe/create-portal-session/route.ts` - Uses environment variables
- `app/api/webhooks/stripe/route.ts` - Uses `process.env.STRIPE_WEBHOOK_SECRET`

✅ **Utilities:**
- `lib/stripe.ts` - Uses `process.env.STRIPE_SECRET_KEY`
- `lib/supabase/client.ts` - Uses `process.env.NEXT_PUBLIC_SUPABASE_*`
- `lib/supabase/server.ts` - Uses environment variables

### Files That Must NOT Be Committed
❌ `.env` - Contains actual secret keys
❌ `.env.local` - Local overrides
❌ `.env.*.local` - Environment-specific local files

## Environment Variables Overview

### Public Variables (Embedded in Client Bundle)
These are safe to expose because they're meant to be public:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Protected by RLS)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Public by design)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_*` (Public Price IDs)

### Private Variables (Server-Side Only)
These are **NEVER** sent to the client:
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Full database access
- `STRIPE_SECRET_KEY` ⚠️ Can charge cards
- `STRIPE_WEBHOOK_SECRET` ⚠️ Validates webhooks
- `GEMINI_API_KEY` ⚠️ Costs money
- `MISTRAL_API_KEY` ⚠️ Costs money
- `UNSPLASH_ACCESS_KEY` ⚠️ Rate limits
- `TESTMAIL_API_KEY` ⚠️ Email service

## Pre-Commit Checklist

Before running `git push`:

1. ✅ Run this command to check for accidentally committed secrets:
   ```bash
   git diff --cached | grep -E "(sk_live|sk_test|whsec_|AIza|eyJ)"
   ```

2. ✅ Verify `.env` is gitignored:
   ```bash
   git status --ignored
   ```
   
   Should show: `.env` in ignored files

3. ✅ Check no hardcoded secrets in staged files:
   ```bash
   git diff --cached
   ```

4. ✅ Ensure `.env.example` has only placeholder values

## Deployment Security

### Vercel/Netlify
1. Add all environment variables in dashboard
2. Use different keys for production (live Stripe keys)
3. Set up Stripe webhooks with production URL
4. Enable HTTPS (automatic on Vercel/Netlify)

### Production Checklist
- [ ] Use Stripe **live** keys (not test)
- [ ] Create **live** products in Stripe
- [ ] Update Price IDs with live values
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test full payment flow with real card
- [ ] Set up proper error monitoring (Sentry)
- [ ] Enable rate limiting on API routes
- [ ] Review Supabase RLS policies

## If Keys Are Accidentally Committed

1. **Immediately rotate all exposed keys:**
   - Stripe: https://dashboard.stripe.com/apikeys
   - Supabase: Project Settings → API
   - Others: Respective dashboards

2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push:**
   ```bash
   git push origin --force --all
   ```

4. **Update environment variables everywhere**

## Best Practices

✅ **DO:**
- Keep `.env` in `.gitignore`
- Use different keys for dev/staging/production
- Rotate keys regularly
- Use strong webhook secrets
- Enable Stripe fraud detection
- Monitor API usage and costs

❌ **DON'T:**
- Hardcode secrets in code
- Share `.env` files via Slack/email
- Use production keys in development
- Commit API keys to version control
- Use the same keys across projects

## Additional Resources

- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
