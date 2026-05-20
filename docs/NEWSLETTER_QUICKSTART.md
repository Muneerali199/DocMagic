# Newsletter System - Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Apply Database Migration
```bash
npm run setup-db
```

### Step 2: Verify Environment
Ensure `.env.local` has:
```env
INTERNAL_API_SECRET=dev-secret-key-change-in-production
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Test
1. Open http://localhost:3000
2. Scroll to "Join Our Newsletter" section
3. Enter test email
4. Click Subscribe
5. Check console for Ethereal email preview URL
6. Click confirmation link

✅ Done!

---

## 📂 File Structure at a Glance

```
Core Implementation:
├── app/api/newsletter/
│   ├── route.ts                    # POST: Subscribe
│   ├── confirm/route.ts            # GET: Confirm token
│   └── send-confirmation/route.ts  # POST: Send email (internal)
├── components/
│   ├── newsletter-subscribe.tsx    # Form component
│   └── newsletter-section.tsx      # Homepage section
├── app/confirm-newsletter/page.tsx # Confirmation page

Database:
└── supabase/migrations/20260520000000_add_newsletter_table.sql

Documentation:
├── docs/NEWSLETTER_SYSTEM.md       # Complete reference
├── docs/NEWSLETTER_TESTING_GUIDE.md # Testing checklist
└── NEWSLETTER_IMPLEMENTATION_SUMMARY.md # Summary
```

---

## 🔗 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/newsletter` | POST | Subscribe to newsletter |
| `/api/newsletter/confirm` | GET | Confirm subscription with token |
| `/api/newsletter/send-confirmation` | POST | Send confirmation email (internal) |

---

## 📋 Request/Response Examples

### Subscribe
```bash
POST /api/newsletter
Content-Type: application/json

{
  "email": "user@example.com",
  "sourcePage": "homepage"
}

# Response (200)
{
  "success": true,
  "message": "Check your email to confirm your subscription!"
}
```

### Confirm
```bash
GET /api/newsletter/confirm?token=abc123-def456-...

# Response (200)
{
  "success": true,
  "message": "Your subscription has been confirmed! Welcome to our newsletter."
}
```

---

## 🎨 Component Usage

### Add Newsletter Form Anywhere
```tsx
import { NewsletterSubscribe } from '@/components/newsletter-subscribe';

export function MyPage() {
  return (
    <NewsletterSubscribe
      sourcePage="my-page"
      onSuccess={() => alert('Success!')}
    />
  );
}
```

### Full Newsletter Section
```tsx
import { NewsletterSection } from '@/components/newsletter-section';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}
```

---

## 🗄️ Database Schema

### Table: `newsletter_leads`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key, auto-generated |
| email | TEXT | Unique, indexed |
| source_page | TEXT | Where subscription came from |
| confirmed | BOOLEAN | Subscription status |
| confirmation_token | TEXT | 24-hour expiry token |
| token_expires_at | TIMESTAMP | Token expiration time |
| created_at | TIMESTAMP | Subscription date |
| updated_at | TIMESTAMP | Last update |

### Useful Queries

```sql
-- All subscribers
SELECT COUNT(*) FROM newsletter_leads WHERE confirmed = true;

-- Unconfirmed
SELECT COUNT(*) FROM newsletter_leads WHERE confirmed = false;

-- By source
SELECT source_page, COUNT(*) FROM newsletter_leads 
GROUP BY source_page;

-- Recent signups
SELECT email, created_at FROM newsletter_leads 
ORDER BY created_at DESC LIMIT 10;
```

---

## 🧪 Testing Checklist

Quick verification:
- [ ] Form appears on homepage
- [ ] Valid email subscribes successfully
- [ ] Invalid email shows error
- [ ] Duplicate email shows "already subscribed"
- [ ] Confirmation email received
- [ ] Token verification works
- [ ] Confirmation page displays success

See `docs/NEWSLETTER_TESTING_GUIDE.md` for complete test suite.

---

## ⚙️ Configuration

### Required
```env
INTERNAL_API_SECRET=your-secret-key
```

### Optional (for production email)
```env
EMAIL_HOST=smtp.provider.com
EMAIL_USER=your-email@provider.com
EMAIL_PASS=your-password
EMAIL_PORT=587
EMAIL_FROM="DraftDeckAI <noreply@draftdeckai.com>"
```

### In Development
- Uses Ethereal test account automatically
- Check console logs for preview URL
- No real emails sent

---

## 🔒 Security Features

✅ Email validation with regex
✅ Rate limiting (10 per hour per IP)
✅ UUID-based tokens
✅ 24-hour expiration
✅ HTML sanitization
✅ Row Level Security (RLS)
✅ Database indexes
✅ Internal API secret verification

---

## 📊 Monitoring Queries

### Real-time Stats
```sql
-- Daily signups
SELECT DATE(created_at) as date, COUNT(*) as count
FROM newsletter_leads
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Confirmation rate
SELECT 
  COUNT(CASE WHEN confirmed THEN 1 END)::float / COUNT(*) as confirmation_rate
FROM newsletter_leads;

-- Source distribution
SELECT source_page, COUNT(*) as count
FROM newsletter_leads
GROUP BY source_page
ORDER BY count DESC;
```

---

## 🐛 Troubleshooting

### Issue: Email not sending
**Solution**: Check Ethereal URL in console logs (development only)

### Issue: "Already subscribed" error
**Solution**: User's email is in database but not confirmed, click resend link

### Issue: Token expired
**Solution**: User needs to resubscribe (tokens valid for 24 hours only)

### Issue: Rate limited
**Solution**: User exceeded 10 requests/hour limit

See `docs/NEWSLETTER_SYSTEM.md` for more detailed troubleshooting.

---

## 🚢 Production Deployment

1. **Set Environment Variables**
   ```env
   INTERNAL_API_SECRET=<strong-random-string>
   EMAIL_HOST=smtp.sendgrid.com
   EMAIL_USER=apikey
   EMAIL_PASS=<sendgrid-api-key>
   EMAIL_PORT=587
   ```

2. **Apply Migration**
   ```bash
   npm run setup-db
   ```

3. **Configure SMTP Provider**
   - SendGrid, AWS SES, Mailgun, etc.
   - Update credentials in environment

4. **Test Email Sending**
   - Subscribe with test email
   - Verify email received

5. **Deploy Code**
   - Commit all files
   - Push to production branch
   - Deploy via Vercel/Netlify

---

## 📚 Documentation Links

- [Complete System Docs](./docs/NEWSLETTER_SYSTEM.md)
- [Testing Guide](./docs/NEWSLETTER_TESTING_GUIDE.md)
- [Implementation Summary](./NEWSLETTER_IMPLEMENTATION_SUMMARY.md)

---

## 💡 Pro Tips

1. **Test Emails in Development**
   - Check Ethereal preview URL after subscribing
   - Preview shows exactly what users will see

2. **Monitor Confirmation Rates**
   - Run `SELECT COUNT(*) WHERE confirmed FROM newsletter_leads`
   - Low rate might indicate email issues

3. **Segment by Source**
   - `source_page` tracks which page users subscribed from
   - Useful for analytics and targeted campaigns

4. **Use Custom Source Pages**
   ```tsx
   <NewsletterSubscribe sourcePage="pricing-page" />
   <NewsletterSubscribe sourcePage="about-page" />
   ```

5. **Track Success**
   ```tsx
   const [subscriberEmail, setSubscriberEmail] = useState('');
   
   <NewsletterSubscribe
     onSuccess={() => {
       // Log to analytics
       analytics.track('newsletter_subscribed');
       // Show modal, redirect, etc.
     }}
   />
   ```

---

## 📞 Support

- 📖 Read the docs first
- 🧪 Check testing guide
- 🐛 Report issues on GitHub
- 💬 Ask questions in discussions

---

## Version Info

- **Version**: 1.0.0
- **Status**: ✅ Production Ready
- **Last Updated**: May 20, 2026
- **Tested On**: Node 18+, PostgreSQL 14+, Next.js 14.2

---

**Happy Newslettering! 🚀📬**
