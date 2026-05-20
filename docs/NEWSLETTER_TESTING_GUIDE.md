# Newsletter System - Testing & Verification Checklist

## Pre-Testing Setup

### 1. Database Migration
Run the database setup to create the `newsletter_leads` table:

```bash
npm run setup-db
```

Or manually apply the migration in Supabase:
- Go to Supabase Dashboard → SQL Editor
- Run the migration SQL from: `supabase/migrations/20260520000000_add_newsletter_table.sql`

### 2. Environment Variables
Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_SECRET=dev-secret-key-change-in-production
```

### 3. Start Development Server
```bash
npm run dev
```

Server should be running on `http://localhost:3000`

---

## Testing Checklist

### ✅ UI/Frontend Tests

#### Newsletter Section Visibility
- [ ] Navigate to homepage (`http://localhost:3000`)
- [ ] Scroll down to find "Join Our Newsletter" section
- [ ] Verify section has proper styling with gradient background
- [ ] Check that benefits list is visible (Weekly Tips, New Features First, Special Offers)
- [ ] Verify section is responsive on mobile view

#### Newsletter Form States
- [ ] **Idle State**: Form appears with email input and Subscribe button
- [ ] **Loading State**: Button shows "Subscribing..." with spinner after clicking Subscribe
- [ ] **Success State**: Success message displays with checkmark icon
- [ ] **Error State**: Validation error messages appear appropriately

---

### ✅ Functional Tests

#### Test 1: Valid Email Subscription
**Steps:**
1. Fill in a valid test email (e.g., `test.user@example.com`)
2. Click "Subscribe" button
3. Wait for response

**Expected Behavior:**
- ✓ Form shows "Subscribing..." state
- ✓ Success message: "Check your email to confirm your subscription!"
- ✓ Email input clears
- ✓ Form shows success state with green styling

**Database Check:**
```sql
SELECT * FROM newsletter_leads WHERE email = 'test.user@example.com';
```
Should show:
- `confirmed: false`
- `confirmation_token: <uuid>`
- `token_expires_at: <24 hours from now>`

---

#### Test 2: Invalid Email Format
**Steps:**
1. Enter invalid email: `test@gmail` (missing domain extension)
2. Click "Subscribe" button

**Expected Behavior:**
- ✓ Shows error message: "Please enter a valid email address"
- ✓ Form remains in error state with red styling
- ✓ Submit button is not disabled

---

#### Test 3: Empty Email Input
**Steps:**
1. Leave email field empty
2. Click "Subscribe" button

**Expected Behavior:**
- ✓ Shows error message: "Please enter your email address"
- ✓ Error state with red styling

---

#### Test 4: Duplicate Email Handling
**Steps:**
1. Subscribe with email: `duplicate@test.com`
2. Wait for success
3. Try subscribing again with the same email

**Expected Behavior:**
- ✓ First subscription: Success message
- ✓ Second subscription: Shows "You are already subscribed to our newsletter!"
- ✓ Form shows "already-subscribed" state

---

#### Test 5: Email Confirmation Flow
**Steps:**
1. Subscribe with new email: `confirm@test.com`
2. Check console logs for Ethereal email preview URL (in development)
3. Click on preview URL to open Ethereal email UI
4. Copy confirmation link from email
5. Open confirmation link in browser

**Expected Behavior:**
- ✓ Confirmation page loads
- ✓ Shows "Subscription Confirmed! ✨" message
- ✓ Shows CheckCircle icon in green
- ✓ Displays "What's Next?" section with next steps
- ✓ Shows "Back to Home" and "Go to Dashboard" buttons

**Database Check:**
```sql
SELECT * FROM newsletter_leads WHERE email = 'confirm@test.com';
```
Should show:
- `confirmed: true`
- `confirmation_token: NULL`
- `token_expires_at: NULL`

---

#### Test 6: Expired Token Handling
**Steps:**
1. Manually update a newsletter lead to have an expired token:
```sql
UPDATE newsletter_leads 
SET token_expires_at = NOW() - INTERVAL '1 hour'
WHERE email = 'expired@test.com';
```
2. Try to confirm with that token from the confirmation page

**Expected Behavior:**
- ✓ Shows "Link Expired" heading
- ✓ Error message: "Confirmation link has expired. Please subscribe again."
- ✓ Shows "Subscribe Again" button

---

#### Test 7: Invalid Token Handling
**Steps:**
1. Navigate to confirmation page with invalid token:
```
http://localhost:3000/confirm-newsletter?token=invalid-token-123
```

**Expected Behavior:**
- ✓ Shows "Invalid Link" heading
- ✓ Error message: "Invalid confirmation link. Please check your email again."
- ✓ Shows "Subscribe Again" button

---

#### Test 8: Rate Limiting
**Steps:**
1. Rapidly click "Subscribe" 11+ times within a minute (or spam form with different emails)
2. Watch for rate limit error

**Expected Behavior:**
- ✓ After 10 requests in 1 hour: Error message "Too many requests. Please try again later."
- ✓ Form shows error state

---

#### Test 9: Form Interaction After Error
**Steps:**
1. Enter invalid email
2. See error message
3. Correct the email and try again

**Expected Behavior:**
- ✓ Error state clears when user starts typing
- ✓ Can successfully submit corrected email
- ✓ Success message appears

---

### ✅ API Tests

#### Test API Endpoint Directly (using cURL or Postman)

**Subscribe Endpoint:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "sourcePage": "api-test"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Check your email to confirm your subscription!"
}
```

**Confirm Endpoint:**
```bash
curl "http://localhost:3000/api/newsletter/confirm?token=ACTUAL-TOKEN-HERE"
```

Expected Response:
```json
{
  "success": true,
  "message": "Your subscription has been confirmed! Welcome to our newsletter."
}
```

---

### ✅ Email Tests

#### Test Email Sending
**In Development (Ethereal Test Account):**
1. Subscribe with any email
2. Check Next.js dev server console for output like:
```
Email preview URL (test mode)
http://preview-ethereal-email-url.com
```
3. Click the preview URL
4. Verify:
   - [ ] Email subject: "✉️ Confirm Your Newsletter Subscription - DraftDeckAI"
   - [ ] Email from: "DraftDeckAI <noreply@draftdeckai.com>"
   - [ ] Email contains confirmation link
   - [ ] Email has nice HTML formatting with gradient header
   - [ ] Link format: `http://localhost:3000/confirm-newsletter?token=<uuid>`

---

### ✅ Mobile Responsiveness Tests

#### Test on Mobile Devices/Viewports
- [ ] **Newsletter Section**: Proper spacing and layout on mobile
- [ ] **Form**: Input and button stack vertically on small screens
- [ ] **Success Message**: Readable and well-formatted
- [ ] **Confirmation Page**: Properly centered with good padding
- [ ] **Icons**: Properly sized for mobile
- [ ] **Text**: All text is readable without horizontal scrolling

**Test Viewports:**
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone)
- [ ] 768px (Tablet)
- [ ] 1024px (Desktop)

---

### ✅ Accessibility Tests

#### Keyboard Navigation
- [ ] Tab through form elements
- [ ] Focus states are visible
- [ ] Enter key submits the form
- [ ] Error messages are announced

#### Screen Reader
- [ ] Labels are associated with inputs
- [ ] Icon-only elements have proper aria-labels
- [ ] Status messages are announced
- [ ] Form fields have proper semantic HTML

---

### ✅ Integration Tests

#### Test 1: Complete User Journey
1. User lands on homepage
2. Sees newsletter section
3. Enters email
4. Receives confirmation email
5. Clicks confirmation link
6. Sees confirmation page
7. User data marked as confirmed in database

**Expected Timeline:**
- Subscribe → Response in <2 seconds
- Email send → ~1-3 seconds
- Confirm → Instant (database update)

---

### ✅ Database Tests

#### Verify Table Structure
```sql
-- Check table exists
SELECT * FROM newsletter_leads LIMIT 1;

-- Check columns exist
\d newsletter_leads

-- Verify constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'newsletter_leads';
```

#### Verify Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'newsletter_leads';
```

Should show indexes for:
- email
- confirmation_token
- confirmed

#### Check RLS Policies
```sql
SELECT policyname, policy_definition 
FROM pg_policies 
WHERE tablename = 'newsletter_leads';
```

---

### ✅ Security Tests

#### Test CORS Protection
Try calling API from different origin:
```javascript
// In browser console from different domain
fetch('http://localhost:3000/api/newsletter', {
  method: 'POST',
  body: JSON.stringify({email: 'test@test.com'})
})
```

#### Test SQL Injection
- [ ] Try email with SQL: `'; DROP TABLE newsletter_leads; --`
  - Expected: Email validation error (not executed)

#### Test XSS Prevention
- [ ] Try email with script: `<script>alert('xss')</script>@test.com`
  - Expected: Email validation error

---

## Performance Tests

### Response Time Benchmarks

- [ ] Subscribe endpoint: < 2s
- [ ] Confirm endpoint: < 1s
- [ ] Email send: < 5s
- [ ] Database query: < 500ms

### Load Testing (Optional)

Using Apache Bench or similar:
```bash
ab -n 100 -c 10 -p data.json -T application/json http://localhost:3000/api/newsletter
```

---

## Browser Compatibility Tests

Test on multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (Chrome Mobile, Safari iOS)

---

## Cleanup/Teardown

After testing, clean up test data:

```sql
-- Delete test subscriptions
DELETE FROM newsletter_leads WHERE email LIKE '%test%';
DELETE FROM newsletter_leads WHERE email LIKE '%api%';

-- Verify cleanup
SELECT COUNT(*) FROM newsletter_leads;
```

---

## Known Limitations

1. **Email Sending in Development**: Uses Ethereal test account, emails are not real
2. **Token Expiration**: Currently 24 hours, not configurable
3. **No Unsubscribe**: Currently no unsubscribe functionality (recommended future enhancement)
4. **No Resend**: If user doesn't receive email, they must subscribe again

---

## Test Results Summary

Create a test results log:

```markdown
## Newsletter System Test Results - [DATE]

### Environment
- Node Version: [Version]
- Database: Supabase
- Email Provider: Ethereal (test)

### Test Results
- UI Tests: ✓ Passed (9/9)
- API Tests: ✓ Passed (3/3)
- Email Tests: ✓ Passed (2/2)
- Database Tests: ✓ Passed (4/4)
- Security Tests: ✓ Passed (3/3)
- Mobile Tests: ✓ Passed (5/5)

### Issues Found
- [List any issues]

### Performance Results
- Subscribe: 1.2s
- Confirm: 0.8s
- Email Send: 2.1s

### Recommendations
- [List any recommendations]
```

---

## Troubleshooting Failed Tests

### Email Not Sending
1. Check if SMTP is configured
2. In development, look for Ethereal URL in console
3. Verify `INTERNAL_API_SECRET` is set

### Database Errors
1. Run `npm run setup-db` to apply migrations
2. Verify Supabase connection
3. Check RLS policies aren't blocking access

### Rate Limiting Too Strict
1. Check IP detection is working
2. Verify rate limit config: 10 requests/hour
3. Test with different IP (use VPN if needed)

### Token Expiration Issues
1. Check system time is correct
2. Verify `NOW()` function in Supabase
3. Token should expire 24 hours after creation

---

## Reporting Issues

If tests fail, please include:
1. Test case that failed
2. Expected vs actual behavior
3. Error messages/screenshots
4. Browser and OS
5. Steps to reproduce
6. Console logs/network logs

Then open an issue: https://github.com/Muneerali199/DraftDeckAI/issues
