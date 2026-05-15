# Fix: Post-Sign-Up Redirect to "Something Went Wrong" Page

## Root Cause Analysis

After tracing the full sign-up flow, I identified **two root causes** that combine to produce the "Something went wrong" error page:

### 1. Password Validation Mismatch (Primary — Silent API Error)

| Location | Rule |
|---|---|
| **Client-side** (`register/page.tsx` L146) | `password.length < 6` — allows 6-char passwords |
| **Server-side** (`lib/validation.ts` L19-23) | `min(8)` + must have uppercase, lowercase, and digit |

A user can submit a 6-7 character simple password that passes the client check, but the server's `validateAndSanitize()` **throws** (line 71), which is caught by the outer `catch` block and returns a `500` with `"Validation failed: ..."`. The client-side `handleSubmit` then enters its `catch`, shows a toast, **but doesn't re-throw** — the user sees the toast briefly, however **Supabase's own `signUp` was never called**, so no account exists despite the user thinking it did.

However, when the password *is* valid on both sides, there's a second issue:

### 2. `createRouteHandlerClient` Import (Secondary — Callback Crash)

In `app/auth/callback/route.ts` (line 1):
```ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
```
This package (`@supabase/auth-helpers-nextjs`) is the **legacy** helper. The rest of the codebase uses `@supabase/ssr` via `lib/supabase/server.ts`. If `@supabase/auth-helpers-nextjs` is not installed or has version incompatibilities with the current `cookies()` API (Next.js 14+), the callback route **crashes at runtime** → Next.js renders `app/error.tsx` ("Something went wrong!").

This primarily affects **OAuth sign-ups** (Google/GitHub) and **email verification callbacks**, since those redirect through `/auth/callback`.

### 3. Email-based Registration — Client UX is Actually Correct (mostly)

For email/password registration, the `handleSubmit` in `register/page.tsx`:
- Calls `POST /api/auth/register`
- On success → sets `success = true` → shows "Verify Your Email" screen
- On error → shows toast

**This path does NOT redirect to an error page** — unless the password validation mismatch causes a confusing `500` response that the user interprets as "something went wrong."

---

## Proposed Changes

### Fix 1: Align Client-Side Password Validation with Server

**File:** `app/auth/register/page.tsx`

- Change minimum password length from `6` to `8`
- Add visual feedback for the uppercase + lowercase + digit requirement
- Update the password placeholder text

### Fix 2: Fix the Auth Callback Route

**File:** `app/auth/callback/route.ts`

- Replace the legacy `createRouteHandlerClient` with the project's own `createRoute` from `lib/supabase/server.ts`
- This ensures the callback works correctly with the Next.js version in use

### Fix 3: Improve the Error Page

**File:** `app/error.tsx`

- Add a proper styled error page with navigation options (Sign In, Home)
- Currently it's a bare `<div>` with no styling or useful links

### Fix 4 (Bonus — from conversation): Keep the Forgot Password Link

Per the GitHub discussion, the maintainer suggested removing the Forgot Password option, but the contributor correctly pointed out users need it. **Keep it as-is** — the current Sign In page already has it and it should stay.

---

## Files to Modify

| # | File | Change |
|---|---|---|
| 1 | `app/auth/register/page.tsx` | Align password validation (min 8, complexity), update UI hints |
| 2 | `app/auth/callback/route.ts` | Replace legacy `createRouteHandlerClient` with `createRoute` |
| 3 | `app/error.tsx` | Improve error page with styling and navigation |
| 4 | `lib/validation.ts` | No change needed (server rules are correct) |

## Impact

- ✅ Prevents silent 500s from password validation mismatch
- ✅ Fixes OAuth and email-verification callback crashes  
- ✅ Better error recovery UX if something does go wrong
- ✅ Keeps Forgot Password functionality intact
