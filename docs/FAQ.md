<div align="center">

# ❓ DraftDeckAI — Frequently Asked Questions

**Quick answers for users and contributors alike.**

[![Live Demo](https://img.shields.io/badge/Live-draftdeckai.com-6366f1?style=for-the-badge)](https://draftdeckai.com)
[![GSSoC 2026](https://img.shields.io/badge/GSSoC-2026-orange?style=for-the-badge)](https://gssoc.girlscript.tech/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📑 Table of Contents

### User FAQ
- [What is DraftDeckAI?](#what-is-draftdeckai)
- [Is DraftDeckAI free to use?](#is-draftdeckai-free-to-use)
- [How does the credits system work?](#how-does-the-credits-system-work)
- [How many credits does each action cost?](#how-many-credits-does-each-action-cost)
- [What happens when I run out of credits?](#what-happens-when-i-run-out-of-credits)
- [Which AI models power DraftDeckAI?](#which-ai-models-power-draftdeckai)
- [Is my data secure?](#is-my-data-secure)
- [What export formats are supported?](#what-export-formats-are-supported)
- [How do I manage my account?](#how-do-i-manage-my-account)
- [Which browsers are supported?](#which-browsers-are-supported)
- [Can I use DraftDeckAI for commercial purposes?](#can-i-use-draftdeckai-for-commercial-purposes)

### Contributor FAQ
- [What API keys do I need to start developing?](#what-api-keys-do-i-need-to-start-developing)
- [Can I run the project without Stripe?](#can-i-run-the-project-without-stripe)
- [How do I reset my local Supabase database?](#how-do-i-reset-my-local-supabase-database)
- [What is the minimal setup for development?](#what-is-the-minimal-setup-for-development)
- [What branch naming conventions should I follow?](#what-branch-naming-conventions-should-i-follow)
- [How do I submit a pull request?](#how-do-i-submit-a-pull-request)
- [How are GSSoC contributions tracked?](#how-are-gssoc-contributions-tracked)

### Common Errors & Fixes
- [Invalid API Key error](#invalid-api-key-error)
- [Supabase connection failed](#supabase-connection-failed)
- [npm install failures](#npm-install-failures)
- [Build failures on Vercel / Netlify](#build-failures-on-vercel--netlify)
- [AI generation not working](#ai-generation-not-working)

---

## 👤 User FAQ

### What is DraftDeckAI?

DraftDeckAI is an open-source, AI-powered document creation platform. It helps you generate professional resumes, presentations, letters, and diagrams using natural language descriptions. Visit the [live site](https://draftdeckai.com) to try it instantly.

---

### Is DraftDeckAI free to use?

Yes. Every account receives **50 free credits per month**, which reset automatically. The platform is open-source under the [MIT License](./LICENSE), so you can also self-host it at no cost.

---

### How does the credits system work?

Credits are the usage currency inside DraftDeckAI. Each AI-powered action consumes a set number of credits. Free-tier accounts receive **50 credits per month** that reset on a monthly cycle. If you need more, premium plans are available via Stripe (when enabled).

---

### How many credits does each action cost?

| Action | Credits |
|---|---|
| Generate Resume | 5 |
| Generate Presentation | 10 |
| Generate Letter | 3 |
| Generate Diagram | 5 |
| ATS Score Check | 2 |

> **Example:** With 50 free credits you could generate 10 resumes, or 5 presentations, or a mix of different actions each month.

---

### What happens when I run out of credits?

When your credits reach zero, AI-generation actions will be paused until your credits reset at the start of the next billing cycle. You will still be able to view and download previously created documents.

---

### Which AI models power DraftDeckAI?

DraftDeckAI currently supports:

| Provider | Model | Used For |
|---|---|---|
| **Google Gemini** | Gemini Pro | Resume, letter, presentation, and diagram generation |
| **Mistral AI** | Mistral Large | Alternative AI provider (configurable) |
| **Nebius (FLUX)** | FLUX.1-schnell | Presentation slide image generation |
| **Groq** | Mixtral-8x7b | Campaign generator (fast inference) |

The AI provider is configured via environment variables. At minimum, you need **either** `GEMINI_API_KEY` **or** `MISTRAL_API_KEY` for core features.

---

### Is my data secure?

DraftDeckAI is designed with security in mind. Current measures include:

- **Authentication** — Powered by Supabase Auth with JWT-based sessions and protected routes by default.
- **Data storage** — Documents are stored in your Supabase PostgreSQL database; you retain full control of the hosting environment.
- **Encryption** — Traffic is encrypted in transit (e.g., HTTPS when deployed to Vercel/Netlify). Passwords are hashed by default (e.g., bcrypt via Supabase Auth).
- **Input validation** — Input validation is applied at API boundaries (e.g., Zod schemas), along with SQL injection protection and XSS prevention.
- **Third-party data sharing** — Documents are not shared with external analytics services under the default configuration.

For the canonical security policy and implementation details, see [SECURITY.md](./SECURITY.md).

---

### What export formats are supported?

| Document Type | Export Format |
|---|---|
| Resume | PDF |
| Presentation | PDF |
| Letter | PDF |
| Diagram | PNG / SVG |

PDF exports are generated client-side so your data never leaves the browser during export.

---

### How do I manage my account?

- **Sign up / Log in** — Email and password authentication via Supabase Auth.
- **Reset password** — Use the "Forgot Password" link on the login page; a reset email will be sent.
- **View credits** — Your remaining credits are displayed in the dashboard.
- **Delete account** — Contact support or manage your account through the Supabase dashboard if self-hosting.

---

### Which browsers are supported?

DraftDeckAI works on all modern browsers:

| Browser | Minimum Version |
|---|---|
| Google Chrome | 90+ |
| Mozilla Firefox | 90+ |
| Microsoft Edge | 90+ |
| Apple Safari | 15+ |

> **Note:** Internet Explorer is **not** supported. For the best experience, use the latest version of Chrome or Firefox.

---

### Can I use DraftDeckAI for commercial purposes?

Yes. DraftDeckAI is licensed under the [MIT License](./LICENSE), which permits personal and commercial use, modification, and distribution.

---

## 🛠 Contributor FAQ

> **New to open source?** Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for a complete setup walkthrough and our [Code of Conduct](./Code_of_Conduct.md) for community guidelines.

### What API keys do I need to start developing?

API keys are split into **required** and **optional** categories:

#### ✅ Required

| Key | Where to Get It |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Same Supabase dashboard |
| `GEMINI_API_KEY` **or** `MISTRAL_API_KEY` | [Google AI Studio](https://ai.google.dev/) or [Mistral Console](https://console.mistral.ai/) |

#### ⚙️ Optional

| Key | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payment testing (can be disabled) |
| `NEBIUS_API_KEY` | Presentation slide images |
| `PEXELS_API_KEY` | Stock images |
| `RAPIDAPI_KEY` | LinkedIn profile import |
| `OPENAI_API_KEY` | PDF / manual LinkedIn import |
| `GROQ_API_KEY` | Campaign generator |

Copy `.env.example` to `.env` (or `.env.local`) and fill in at least the required keys.

---

### Can I run the project without Stripe?

Yes. Set the following in your `.env` file:

```env
NEXT_PUBLIC_ENABLE_STRIPE=false
```

This disables all payment-related features. The rest of the application — AI generation, document export, credits system — works normally without Stripe.

---

### How do I reset my local Supabase database?

If you are using a cloud Supabase project:

1. Open the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Table Editor** and manually truncate or delete rows.
3. Re-run any seed scripts in the `supabase/` directory if provided.

If you are using the Supabase CLI locally:

```bash
# Reset the database (drops all data and re-applies migrations)
npx supabase db reset

# Re-apply migrations only
npx supabase db push
```

> **⚠️ Warning:** `db reset` destroys all local data. Make sure you don't need it before running this command.

---

### What is the minimal setup for development?

To get a working local environment with the fewest dependencies:

1. **Node.js 18+** and **npm** installed.
2. A free **Supabase** project (for auth and database).
3. A free **Google Gemini API key** (for AI features).
4. **Stripe disabled** (`NEXT_PUBLIC_ENABLE_STRIPE=false`).

```bash
# 1. Clone and install
git clone https://github.com/<your-username>/DraftDeckAI.git
cd DraftDeckAI
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env — fill in Supabase + Gemini keys, set NEXT_PUBLIC_ENABLE_STRIPE=false

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready to contribute.

---

### What branch naming conventions should I follow?

Use the conventional prefixes below:

| Type | Format | Example |
|---|---|---|
| Feature | `feature/<description>` | `feature/ai-prompt-optimization` |
| Bug fix | `fix/<description>` | `fix/resume-export-error` |
| Documentation | `docs/<description>` | `docs/create-faq-md` |
| Chore | `chore/<description>` | `chore/dependency-updates` |

Always branch from `main` and keep your branch up to date:

```bash
git checkout main
git pull upstream main
git checkout -b docs/create-faq-md
```

---

### How do I submit a pull request?

1. **Get assigned** — Comment on the issue you want to work on and wait for assignment.
2. **Fork & branch** — Fork the repo and create a branch using the naming convention above.
3. **Make changes** — Implement your work and verify locally (`npm run lint && npm run build`).
4. **Commit** — Use [conventional commits](https://www.conventionalcommits.org/): e.g., `docs(faq): create FAQ.md for users and contributors`.
5. **Open a PR** — Target the `main` branch. Fill out the PR template, link the issue with `Fixes #<number>`, and include screenshots if applicable.
6. **Respond to review** — Maintainers typically review within 24–48 hours.

For the full PR process, see [CONTRIBUTING.md → Pull Request Process](./CONTRIBUTING.md#-pull-request-process).

---

### How are GSSoC contributions tracked?

- Add the **GSSoC 2026** label to your PR description.
- Reference the issue number using `Fixes #<issue>`.
- Maintainers tag qualifying PRs for GSSoC leaderboard tracking.
- See [CONTRIBUTING.md → GSSoC](./CONTRIBUTING.md#-girlscript-summer-of-code-2026-gssoc) for more.

---

## 🔧 Common Errors & Fixes

### Invalid API Key error

**Symptom:** `401 Unauthorized` or `Invalid API Key` when using AI features.

**Fix:**

1. Open your `.env` (or `.env.local`) file.
2. Verify the key has no leading/trailing spaces or quotes:
   ```env
   # ✅ Correct
   GEMINI_API_KEY=AIzaSyD...your-key

   # ❌ Wrong — no quotes around the value
   GEMINI_API_KEY="AIzaSyD...your-key"
   ```
3. Confirm the key is active in the provider's dashboard ([Google AI Studio](https://ai.google.dev/) or [Mistral Console](https://console.mistral.ai/)).
4. Restart the dev server after any `.env` change:
   ```bash
   # Stop the server (Ctrl+C), then:
   npm run dev
   ```

---

### Supabase connection failed

**Symptom:** `Failed to fetch` or `Supabase client not initialized` errors.

**Fix:**

1. Check that all three Supabase variables are set in `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```
2. Ensure the URL starts with `https://` and does **not** have a trailing slash.
3. Verify the project is **active** (not paused) in the [Supabase Dashboard](https://supabase.com/dashboard).
4. If using a free Supabase plan, the project may auto-pause after inactivity — click **Restore** in the dashboard.

---

### npm install failures

**Symptom:** `npm install` fails with dependency resolution errors.

**Fix:**

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete existing modules and lockfile
rm -rf node_modules package-lock.json

# 3. Re-install
npm install

# 4. If peer dependency conflicts persist, use legacy resolution
npm install --legacy-peer-deps
```

> **Tip:** Make sure you are running **Node.js 18+** (`node -v` to check).

---

### Build failures on Vercel / Netlify

**Symptom:** `npm run build` fails locally or during CI/CD deployment.

**Common causes and fixes:**

| Cause | Fix |
|---|---|
| Missing environment variables | Add all required env vars in the hosting dashboard (Vercel → Settings → Environment Variables). |
| TypeScript errors | Run `npm run lint` locally and fix all reported issues before pushing. |
| Module not found | Run `npm install` and commit the updated `package-lock.json`. |
| Out of memory | In Vercel, set `NODE_OPTIONS=--max-old-space-size=4096` in environment variables. |

```bash
# Test the production build locally before deploying
npm run build
```

---

### AI generation not working

**Symptom:** Clicking "Generate" does nothing, or you see a generic error message.

**Fix:**

1. **Check your credits** — You may have 0 credits remaining. Wait for the monthly reset or upgrade your plan.
2. **Verify the API key** — See [Invalid API Key error](#invalid-api-key-error) above.
3. **Check the browser console** — Open DevTools (F12) → Console tab for detailed error messages.
4. **Rate limits** — AI providers enforce rate limits. If you hit them, wait a few minutes and retry.
5. **Network issues** — Ensure your browser can reach the AI provider (not blocked by VPN, firewall, or ad-blocker).
6. **Restart the dev server** — If running locally, stop and restart with `npm run dev`.

---

## 📚 Related Documentation

| Document | Description |
|---|---|
| [README.md](./README.md) | Project overview, quick start, and tech stack |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Detailed contribution guide and dev setup |
| [SECURITY.md](./SECURITY.md) | Security policies and best practices |
| [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) | Technical architecture overview |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and release notes |
| [Code_of_Conduct.md](./Code_of_Conduct.md) | Community guidelines |

---

<div align="center">

**Still have questions?** [Open an issue](https://github.com/Muneerali199/DraftDeckAI/issues) or join our [WhatsApp community](https://chat.whatsapp.com/JblK45aOdv9Ao0YhnMcPcQ) for help.

**Built with ❤️ by the DraftDeckAI community** ✨

</div>
