# Newsletter/Waitlist System Documentation

## Overview

The DraftDeckAI Newsletter/Waitlist System provides a complete double opt-in email subscription experience. Users can subscribe to the newsletter from the homepage and receive confirmation emails to verify their subscription.

## Features

- **Double Opt-In Confirmation**: Users receive a confirmation email with a unique verification link
- **Email Validation**: Comprehensive validation to ensure valid email addresses
- **Duplicate Prevention**: Prevents duplicate subscriptions
- **Token Management**: 24-hour expiration tokens for security
- **Supabase Integration**: Stores leads in a PostgreSQL database
- **Responsive UI**: Beautiful, accessible newsletter subscription form
- **Error Handling**: Comprehensive error states and user feedback
- **Rate Limiting**: Prevents abuse with IP-based rate limiting

## Architecture

### Database

#### Table: `newsletter_leads`

```sql
CREATE TABLE public.newsletter_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source_page text NOT NULL DEFAULT 'homepage',
  confirmed boolean DEFAULT false,
  confirmation_token text UNIQUE,
  token_expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);
```

**Columns:**
- `id`: Unique identifier
- `email`: Subscriber email address
- `source_page`: Where the subscription came from (e.g., 'homepage', 'pricing')
- `confirmed`: Whether the email has been verified
- `confirmation_token`: UUID token for email verification (expires after 24 hours)
- `token_expires_at`: When the confirmation token expires
- `created_at`: Subscription creation timestamp
- `updated_at`: Last update timestamp

### API Endpoints

#### 1. Subscribe to Newsletter

**Endpoint:** `POST /api/newsletter`

**Request:**
```json
{
  "email": "user@example.com",
  "sourcePage": "homepage"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Check your email to confirm your subscription!"
}
```

**Response (Already Confirmed - 200):**
```json
{
  "success": true,
  "message": "You are already subscribed to our newsletter!",
  "alreadySubscribed": true
}
```

**Response (Invalid Email - 400):**
```json
{
  "error": "Invalid email address",
  "details": ["Please enter a valid email address"]
}
```

**Response (Duplicate - 409):**
```json
{
  "error": "Email already exists in our newsletter"
}
```

**Response (Rate Limited - 429):**
```json
{
  "error": "Too many requests. Please try again later."
}
```

#### 2. Confirm Newsletter Subscription

**Endpoint:** `GET /api/newsletter/confirm?token=<confirmation_token>`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Your subscription has been confirmed! Welcome to our newsletter."
}
```

**Response (Expired - 410):**
```json
{
  "error": "Confirmation link has expired. Please subscribe again."
}
```

**Response (Invalid - 404):**
```json
{
  "error": "Invalid or expired confirmation link"
}
```

#### 3. Send Confirmation Email (Internal)

**Endpoint:** `POST /api/newsletter/send-confirmation`

**Note:** This is an internal endpoint used by the newsletter API to send confirmation emails.

**Request:**
```json
{
  "email": "user@example.com",
  "token": "uuid-confirmation-token",
  "expiresAt": "2024-05-21T12:00:00Z"
}
```

**Headers:**
```
x-internal-secret: <INTERNAL_API_SECRET>
```

## Frontend Components

### NewsletterSubscribe Component

**Location:** `components/newsletter-subscribe.tsx`

A controlled form component for newsletter subscription with built-in validation and state management.

**Props:**
```typescript
interface NewsletterSubscribeProps {
  sourcePage?: string;        // Source identifier (default: 'homepage')
  onSuccess?: () => void;     // Callback when subscription succeeds
  className?: string;         // Additional CSS classes
}
```

**Usage:**
```tsx
import { NewsletterSubscribe } from '@/components/newsletter-subscribe';

export function MyComponent() {
  return (
    <NewsletterSubscribe
      sourcePage="my-page"
      onSuccess={() => console.log('Subscribed!')}
    />
  );
}
```

**States:**
- `idle`: Initial state
- `loading`: Form is submitting
- `success`: Email confirmed
- `error`: Validation or server error
- `already-subscribed`: Email already confirmed

### NewsletterSection Component

**Location:** `components/newsletter-section.tsx`

A complete section component for the homepage with title, description, benefits, and subscription form.

**Usage:**
```tsx
import { NewsletterSection } from '@/components/newsletter-section';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <NewsletterSection />
      <Footer />
    </>
  );
}
```

### Confirmation Page

**Location:** `app/confirm-newsletter/page.tsx`

Handles email verification via token from the confirmation link.

**Features:**
- Verifies token validity
- Checks token expiration
- Updates user status to confirmed
- Provides user feedback and next steps
- Responsive design with proper loading states

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME=DraftDeckAI
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Internal API Security (optional in development)
INTERNAL_API_SECRET=dev-secret-key-change-in-production

# Email Configuration (optional - uses Ethereal for testing in development)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_PORT=587
EMAIL_FROM="Your Name <noreply@example.com>"
```

## Testing

### Manual Testing Workflow

1. **Subscribe:**
   - Go to the homepage
   - Fill in a test email address
   - Click "Subscribe"
   - Verify the success message

2. **Confirm Email:**
   - In development: Check the Ethereal email preview URL in console logs
   - In production: Check your email inbox
   - Click the confirmation link
   - Verify the confirmation page

3. **Duplicate Handling:**
   - Try subscribing with the same email again
   - Should show "Already subscribed" message

4. **Invalid Email:**
   - Try subscribing with an invalid email (e.g., "test@gmail")
   - Should show validation error

5. **Rate Limiting:**
   - Try subscribing 11+ times within an hour
   - Should get rate limit error after 10 attempts

### API Testing with cURL

```bash
# Subscribe
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "sourcePage": "homepage"
  }'

# Confirm (replace TOKEN with actual token)
curl http://localhost:3000/api/newsletter/confirm?token=TOKEN
```

## Security Considerations

1. **Email Validation**: Uses Zod schema with regex and domain validation
2. **Token Security**: 24-hour expiration, unique UUID generation
3. **Rate Limiting**: IP-based limits (10 per hour for subscriptions)
4. **CORS**: Requests validated through Next.js API routes
5. **Database**: Row Level Security (RLS) policies for data access
6. **Sanitization**: HTML sanitization for user input
7. **Internal API Secret**: Protects internal endpoints in production

## Database Indexes

The migration creates the following indexes for performance:

- `newsletter_leads_email_idx`: Speeds up email lookups and uniqueness checks
- `newsletter_leads_token_idx`: Speeds up confirmation token lookups
- `newsletter_leads_confirmed_idx`: Speeds up queries for confirmed subscribers

## Future Enhancements

Potential improvements:

1. **Unsubscribe Link**: Add one-click unsubscribe in confirmation emails
2. **Admin Panel**: Dashboard to view subscriber statistics
3. **Segmentation**: Different newsletter types/interests
4. **Automation**: Scheduled newsletter emails via Supabase functions
5. **Analytics**: Track open rates and click-through rates
6. **Internationalization**: Support multiple languages
7. **Resend Logic**: Automatic resend of failed confirmations
8. **Bulk Import**: Allow admins to import subscriber lists

## Troubleshooting

### Emails Not Sending

1. Check if `EMAIL_HOST` is configured
2. In development: Look for Ethereal preview URL in console
3. Check `INTERNAL_API_SECRET` matches between endpoints

### Token Expiration Issues

1. Tokens expire after 24 hours
2. User can re-subscribe to get a new token
3. Check `token_expires_at` in database

### Database Errors

1. Ensure migration has been applied: `npm run setup-db`
2. Check Supabase keys are correct
3. Verify Row Level Security policies

## Support

For issues or questions about the newsletter system:

1. Check the [Contributing Guidelines](../CONTRIBUTING.md)
2. Open an issue on [GitHub](https://github.com/Muneerali199/DraftDeckAI/issues)
3. Contact support at support@draftdeckai.com
