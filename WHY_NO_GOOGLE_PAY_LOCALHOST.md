# Why Google Pay/Apple Pay Don't Show in Stripe Checkout

## 🔍 The Reality

You're seeing **Card** and **Link** options, but **NOT** Google Pay or Apple Pay. Here's why:

## ⚠️ Requirements for Digital Wallets

### Google Pay Shows When:
1. ✅ Using **Google Chrome** browser
2. ✅ Signed into a **Google account**
3. ✅ Have a **card saved** in Google Pay
4. ✅ On **HTTPS** (secure connection)
5. ✅ In **production** (not localhost)

### Apple Pay Shows When:
1. ✅ Using **Safari** browser
2. ✅ On **Apple device** (Mac, iPhone, iPad)
3. ✅ Have **Apple Pay set up** with cards
4. ✅ On **HTTPS** (secure connection)
5. ✅ In **production** (not localhost)

## 🚫 Why They Don't Show on Localhost

**Most common reasons:**

### 1. **Localhost is Not HTTPS**
- Digital wallets require **secure HTTPS** connection
- `http://localhost:3000` is **NOT HTTPS**
- Stripe disables wallets on insecure connections

### 2. **Test Mode Limitations**
- Some wallet features are limited in Stripe test mode
- Full wallet functionality only works in **production**

### 3. **Browser/Device Requirements**
- Google Pay only on Chrome with Google account
- Apple Pay only on Safari with Apple device

## ✅ How to Test Digital Wallets

### Option 1: Use Stripe's Test Domains (Recommended)
Stripe provides test domains that support HTTPS:

1. Deploy to **Vercel** (free):
   ```bash
   vercel deploy
   ```
2. Or use **ngrok** for HTTPS tunnel:
   ```bash
   ngrok http 3000
   ```
3. Use the HTTPS URL to test

### Option 2: Check Stripe Dashboard
Your Stripe Dashboard shows:
- ✅ Google Pay: **Enabled**
- ✅ Apple Pay: **Enabled**  
- ✅ Link: **Enabled**

These WILL work in production!

### Option 3: Production Testing
1. Deploy to production (Vercel/Netlify)
2. Use real Stripe **live keys**
3. Test with $1 payment
4. Wallets will appear!

## 🔧 Current Configuration

Your code is **correctly configured**:

```typescript
payment_method_types: ['card']
billing_address_collection: 'auto'
```

This setup means:
- ✅ **Card** - Always shows
- ✅ **Link** - Shows if customer used it before
- ⏳ **Google Pay** - Shows when requirements met
- ⏳ **Apple Pay** - Shows when requirements met

## 📱 What Customers Will See (Production)

### Desktop Chrome (Google Account):
- 💳 Card payment
- 🔵 Google Pay button
- ⚡ Link (if previously used)

### Safari on Mac/iPhone:
- 💳 Card payment
- 🍎 Apple Pay button
- ⚡ Link (if previously used)

### Other Browsers:
- 💳 Card payment
- ⚡ Link (if previously used)

## 🎯 Next Steps

### To See Digital Wallets Now:

**Option 1: Deploy to Vercel (5 minutes)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Will give you HTTPS URL like: https://your-app.vercel.app
```

**Option 2: Use ngrok (2 minutes)**
```bash
# Download ngrok: https://ngrok.com/download

# Run your app
npm run dev

# In new terminal:
ngrok http 3000

# Use the HTTPS URL provided
```

**Option 3: Just Deploy to Production**
- Your code is ready
- Wallets will work automatically in production
- No changes needed

## ✅ Verification

### Check if Wallets are Enabled:
1. Go to your Stripe Dashboard
2. Settings → Payment methods
3. Confirm these show "Enabled":
   - Google Pay ✅
   - Apple Pay ✅
   - Link ✅

### Production Checklist:
- [ ] Deploy to HTTPS domain
- [ ] Use production Stripe keys
- [ ] Test on Chrome (Google Pay)
- [ ] Test on Safari (Apple Pay)
- [ ] Verify wallets appear

## 💡 Important Notes

1. **Localhost Limitation is Normal**
   - Most developers don't see wallets on localhost
   - This is a security feature, not a bug
   - Your configuration is correct

2. **Link Should Work on Localhost**
   - Link (⚡) may appear even on localhost
   - If customer used Link before
   - Or if they click "Save my info for 1-click checkout"

3. **Your Code is Production-Ready**
   - No changes needed
   - Wallets will automatically appear when deployed
   - Stripe handles everything based on customer's device/browser

## 🔗 References

- [Stripe: Google Pay Requirements](https://stripe.com/docs/payments/google-pay)
- [Stripe: Apple Pay Requirements](https://stripe.com/docs/apple-pay)
- [Stripe Checkout Wallets](https://stripe.com/docs/payments/checkout/wallets)

---

**TL;DR:** Digital wallets require HTTPS in production. Your code is correct - just deploy to see them work! 🚀
