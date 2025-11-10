# Quick Start: Payment Methods with Stripe Subscriptions

## ⚠️ IMPORTANT: Subscription Payment Limitations

**For recurring subscriptions**, Stripe has strict limitations on payment methods:

### ✅ Supported for Recurring Subscriptions:
- 💳 **Cards** (Visa, Mastercard, Amex, etc.) - **RECOMMENDED**
- 🏦 **US Bank Account** (ACH) - US only
- 🇪🇺 **SEPA Direct Debit** - Europe only

### ❌ NOT Supported for Recurring Subscriptions:
- ❌ **UPI** (Google Pay, PhonePe, Paytm) - One-time payments only
- ❌ **PayPal** - Requires separate PayPal Billing Agreement
- ❌ **Cash App** - One-time payments only
- ❌ **Wallets** - One-time payments only

## 🎯 Current Configuration

Your application is configured with:
- ✅ **Card payments** (worldwide)
- ✅ Works with all major credit/debit cards
- ✅ Supports recurring billing
- ✅ 3D Secure authentication for security

## 💡 Solution for UPI/Alternative Payment Methods

If you want to accept UPI and other payment methods, you have **two options**:

### Option 1: Offer Annual Plans with One-Time Payment
- Change subscription model to **yearly billing only**
- Create one-time payment checkout (not recurring)
- This allows UPI, PayPal, Cash App, etc.
- Customer pays once per year

**Code modification needed:**
```typescript
mode: 'payment', // instead of 'subscription'
payment_method_types: ['card', 'paypal', 'cashapp'],
```

### Option 2: Use Razorpay (India-Specific)
- Razorpay is an Indian payment gateway
- Native support for UPI, cards, wallets, net banking
- Supports UPI AutoPay (recurring UPI payments)
- Better suited for Indian market

**Popular alternative to Stripe for India:**
- Razorpay: https://razorpay.com
- Paytm for Business: https://business.paytm.com
- Instamojo: https://www.instamojo.com

### Option 3: Hybrid Approach (Recommended)
- Use **Stripe for cards** (international customers)
- Use **Razorpay for UPI** (Indian customers)
- Detect customer location and show appropriate payment option
- More complex but best user experience

## 🔧 Current Working Setup

### Test the Payment System

1. **Your dev server should be running**
   - If not: `npm run dev`

2. **Open pricing page**
   ```
   http://localhost:3000/pricing
   ```

3. **Click "Subscribe Now"** on any paid plan

4. **Use test card:**
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25 (any future date)
   CVC: 123 (any 3 digits)
   Email: test@example.com
   ```

5. **Complete the checkout**
   - You'll be redirected to Stripe Checkout
   - Enter the test card details
   - Click "Subscribe"
   - Should redirect to success page

## ⚙️ If You Want to Enable More Payment Methods

### Step 1: Modify Code for One-Time Payments

Edit `lib/stripe.ts`:

```typescript
export const createCheckoutSession = async ({
  customerId,
  priceId,
  userId,
  userEmail,
  successUrl,
  cancelUrl,
  planType,
  isRecurring = true, // Add this parameter
}: {
  customerId: string;
  priceId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
  planType: 'individual' | 'organization';
  isRecurring?: boolean; // Add this
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isRecurring ? 'subscription' : 'payment',
      payment_method_types: isRecurring 
        ? ['card'] // Only cards for subscriptions
        : ['card', 'cashapp', 'paypal'], // More options for one-time
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planType: planType,
      },
      // Only add subscription_data if recurring
      ...(isRecurring && {
        subscription_data: {
          metadata: {
            userId: userId,
            planType: planType,
          },
        },
      }),
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};
```

### Step 2: Update Pricing Plans

Only offer **annual billing** for alternative payment methods:
- Monthly plans → Cards only
- Annual plans → Cards + UPI + PayPal + Cash App

## 📊 Payment Method Comparison

| Method | Recurring | One-Time | Fee | Availability |
|--------|-----------|----------|-----|--------------|
| **Card** | ✅ Yes | ✅ Yes | 2.9% + $0.30 | Worldwide |
| **UPI** | ❌ No | ✅ Yes | ~2% | India only |
| **PayPal** | ⚠️ Complex | ✅ Yes | 3.49% + $0.49 | Worldwide |
| **Cash App** | ❌ No | ✅ Yes | 2.75% | US only |
| **ACH** | ✅ Yes | ✅ Yes | 0.8% (max $5) | US only |
| **SEPA** | ✅ Yes | ✅ Yes | 0.8% | Europe |

## 🌍 Reality Check: Stripe's Limitations

**Stripe was built for the Western market** (US, Europe):
- Excellent card processing
- Limited support for Asian payment methods
- UPI only works for one-time payments
- Wallets not supported for subscriptions

**For Indian market specifically:**
- Consider Razorpay (better UPI support)
- Or use Stripe + Razorpay hybrid
- Or only offer annual plans (one-time UPI payment per year)

## 🎯 Recommendation

### For Your Use Case:

**Option A: Keep it Simple (Current)**
- ✅ Cards only
- ✅ Works worldwide
- ✅ Supports monthly + annual subscriptions
- ✅ No code changes needed
- ❌ No UPI support

**Option B: Add Annual-Only Alternative Methods**
- Offer monthly (cards only) + annual (cards + UPI + PayPal)
- Requires code modifications
- Better for Indian users
- More complex to maintain

**Option C: Integrate Razorpay for India**
- Detect Indian users → Show Razorpay
- International users → Show Stripe
- Best user experience
- Most complex implementation

## ✅ Current Status

Your payment system is:
- ✅ **Working** with card payments
- ✅ **Secure** (Stripe PCI compliant)
- ✅ **Production ready** for card-based subscriptions
- ⚠️ **Limited** to cards for recurring payments (Stripe limitation, not your code)

## 📚 Documentation

For full details on Stripe payment method limitations:
- Stripe Payment Methods: https://stripe.com/docs/payments/payment-methods
- Recurring Payments: https://stripe.com/docs/billing/subscriptions/payment-methods

---

**Need UPI for subscriptions?** Consider integrating Razorpay alongside Stripe for the best of both worlds!

1. **Login to Stripe**
   - Go to https://dashboard.stripe.com
   - Make sure you're in **Test Mode** (toggle in top-right)

2. **Go to Payment Methods Settings**
   - Click **Settings** ⚙️ in the sidebar
   - Click **Payment methods**
   - OR directly visit: https://dashboard.stripe.com/settings/payment_methods

3. **Enable Each Payment Method**

   #### For UPI (India) 🇮🇳
   - Find **UPI** in the list
   - Click **Turn on**
   - No additional setup needed in test mode
   - For live mode, you'll need Indian business registration

   #### For PayPal 🅿️
   - Find **PayPal** in the list
   - Click **Turn on**
   - Click **Connect PayPal**
   - Login with PayPal Business account (or create sandbox for testing)

   #### For Cash App 💵
   - Find **Cash App Pay**
   - Click **Turn on**
   - Accept terms (US only)

   #### For Link ⚡
   - Usually enabled by default
   - If not, find **Link** and turn on

   #### For ACH/Bank Transfer 🏦
   - Find **ACH Direct Debit** or **US Bank Account**
   - Click **Turn on**

### Step 2: Test in Your Application

1. **Start your dev server** (should already be running)
   ```powershell
   npm run dev
   ```

2. **Open pricing page**
   ```
   http://localhost:3000/pricing
   ```

3. **Click "Subscribe Now"** on any paid plan

4. **You should see multiple payment options** in Stripe Checkout:
   - Card input (always visible)
   - UPI option (if in India or VPN to India)
   - PayPal button
   - Other methods based on location

### Step 3: Test UPI Payment (India)

**Test UPI IDs:**
```
Success: success@razorpay
Failure: failure@razorpay
```

**Test Cards (Worldwide):**
```
Card Number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
```

## 🌍 How Payment Methods Appear

Payment methods are **automatically shown based on**:

1. **Customer's Location** (detected by IP)
   - India → Shows UPI + Cards
   - US → Shows Cards + Cash App + ACH + Link
   - Europe → Shows Cards + SEPA
   - Other → Shows Cards + available international methods

2. **Currency**
   - Your prices are in USD, so some methods may be limited
   - To enable UPI for Indian customers, consider adding INR pricing

3. **Enabled in Stripe Dashboard**
   - Only methods you've turned on will appear

## ⚠️ Important Notes

### UPI Limitations:
- ✅ Works for one-time payments
- ❌ **Does NOT support recurring subscriptions** (yet)
- For subscriptions with UPI, consider:
  - **Option 1**: Use UPI for first payment, then mandate card for recurring
  - **Option 2**: Use UPI only for annual plans (one payment per year)
  - **Option 3**: Send manual payment requests each month

### Recommended Approach:
```typescript
// For monthly subscriptions → Recommend cards
// For yearly subscriptions → Allow UPI (single payment)
```

## 🔧 Advanced: Currency-Based Payment Methods

If you want to offer UPI optimally for Indian customers, add INR pricing:

1. **Create INR prices in Stripe Dashboard**
   - Individual Monthly: ₹799/month (≈$9.99)
   - Individual Yearly: ₹7,999/year (≈$95.88)

2. **Detect customer's location** in your code
3. **Show INR or USD** based on location

## 📊 Monitoring Payments

### View All Payments:
1. Go to https://dashboard.stripe.com/payments
2. Filter by payment method type
3. See which methods are most popular

### Webhook Events Already Configured:
- ✅ `checkout.session.completed` → Payment received
- ✅ `customer.subscription.created` → New subscription
- ✅ `invoice.payment_succeeded` → Recurring payment successful
- ✅ `invoice.payment_failed` → Recurring payment failed

## 🚀 Going Live

When ready for production:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Complete business verification** for each payment method:
   - UPI → Indian business registration required
   - PayPal → Connect live PayPal account
   - Others → Usually automatic

3. **Update environment variables** with live keys
4. **Test with real (small) amounts**
5. **Monitor first few transactions**

## 🎨 UI Updates

Your pricing page now shows:
- ✅ Payment method icons
- ✅ Updated FAQ explaining all methods
- ✅ Location-based availability notice

## 📚 Full Documentation

For detailed setup instructions, see:
- `docs/PAYMENT_METHODS_SETUP.md` (comprehensive guide)
- Stripe Docs: https://stripe.com/docs/payments/payment-methods

## ❓ Quick FAQ

**Q: I enabled UPI but don't see it in checkout. Why?**
- Check if you're accessing from India (or use VPN)
- Stripe shows UPI only to Indian IP addresses in test mode
- In live mode, also requires Indian business verification

**Q: Can I disable some methods?**
- Yes! Edit `lib/stripe.ts`
- Remove unwanted methods from `payment_method_types` array

**Q: What are the fees?**
- Cards: 2.9% + $0.30
- UPI: ~2% (India)
- PayPal: 3.49% + $0.49
- ACH: 0.8% (capped at $5)
- Check: https://stripe.com/pricing

**Q: How do I know which method a customer used?**
- Check Stripe Dashboard → Payments tab
- Or in webhook data: `payment_intent.payment_method_types`

---

**🎉 You're all set!** Just enable the methods in Stripe Dashboard and test them out.
