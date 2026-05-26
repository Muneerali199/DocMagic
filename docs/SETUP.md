# 🚀 DraftDeckAI - Local Development Setup Guide

Complete setup instructions for getting DraftDeckAI running locally on your machine.

---

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** 18.0.0 or higher ([download here](https://nodejs.org/))
- **npm** 9.0.0 or higher (comes with Node.js)
- **Git** ([download here](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Verify Installation
```bash
node --version      # Should be v18.0.0 or higher
npm --version       # Should be 9.0.0 or higher
git --version       # Any recent version
```

---

## 🔧 Step 1: Clone Repository

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/DraftDeckAI.git
cd DraftDeckAI

# Add upstream remote to sync with main repo
git remote add upstream https://github.com/Muneerali199/DraftDeckAI.git
```

---

## 📦 Step 2: Install Dependencies

```bash
npm install

# If you encounter issues:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🔑 Step 3: Configure Environment Variables

### Create `.env.local` File

Create a new file named `.env.local` in the **root directory** (same level as `package.json`):

```bash
touch .env.local    # On macOS/Linux
# or manually create .env.local in your editor
```

### Copy This Template

```env
# ============================================
# 🎯 REQUIRED - App won't start without these
# ============================================

# Supabase Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ============================================
# 🤖 REQUIRED - For AI Features (pick at least one)
# ============================================

# Google Gemini (Recommended - easiest to set up)
GEMINI_API_KEY=your_gemini_api_key_here

# Alternative: Mistral AI (Optional)
# MISTRAL_API_KEY=your_mistral_api_key_here

# Alternative: Qwen (Optional)
# QWEN_API_KEY=your_qwen_api_key_here

# ============================================
# 💳 OPTIONAL - Stripe Payments (for testing)
# ============================================

NEXT_PUBLIC_ENABLE_STRIPE=false
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
# STRIPE_SECRET_KEY=sk_test_xxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
# STRIPE_PRICE_ID=price_xxxxx

# ============================================
# 🖼️ OPTIONAL - Image APIs
# ============================================

# UNSPLASH_ACCESS_KEY=your_unsplash_key_here
# PEXELS_API_KEY=your_pexels_key_here

# ============================================
# 🌐 App Configuration
# ============================================

NEXT_PUBLIC_APP_NAME=DraftDeckAI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔐 Getting API Keys

### 1️⃣ Supabase (Required - Database & Auth)

**Time:** 5 minutes

1. Go to [supabase.com](https://supabase.com)
2. Click **"Sign Up"** and create an account
3. Click **"New Project"** button
4. Fill in project name: `draftdeckai-dev`
5. Set password for database
6. Click **"Create new project"**
7. Wait for project to initialize (2-3 minutes)
8. Go to **Settings** → **API**
9. Copy these three keys into `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

✅ **Done!** Supabase is ready.

---

### 2️⃣ Google Gemini API (Required - AI Generation)

**Time:** 5 minutes

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click **"Get API Key"** (free tier available)
3. Click **"Create API Key"**
4. Choose **"Create API key in new project"**
5. Copy the generated key
6. Paste into `.env.local` as `GEMINI_API_KEY`

✅ **Free tier includes:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for local development

⚠️ **Note:** If you hit limits, consider alternative AI providers (Mistral, Qwen)

---

### 3️⃣ Stripe (Optional - Only if testing payments)

**Time:** 5 minutes | ⏭️ **Skip for now**

To test payment functionality later:

1. Go to [stripe.com](https://stripe.com)
2. Click **"Start now"** → Create account
3. Skip onboarding (can be done later)
4. Go to **Developers** → **API Keys** (left sidebar)
5. Copy the **Publishable Key** and **Secret Key**
6. In `.env.local`, set `NEXT_PUBLIC_ENABLE_STRIPE=true` and add the keys

⚠️ **Note:** For development, you can leave Stripe disabled (`false`)

---

### 4️⃣ Image APIs (Optional - Only for image generation)

Choose one or both:

**Unsplash (Recommended)**
1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Create account → Create application
3. Copy Access Key → Add to `.env.local`

**Pexels**
1. Go to [pexels.com/api/](https://pexels.com/api/)
2. Signup → Create API key
3. Copy key → Add to `.env.local`

---

## ✅ Step 4: Verify Setup

Run this command to check if everything is configured:

```bash
npm run build

# Expected output:
# ✓ Build successful
# ✓ No errors
```

If you see errors about missing environment variables, you missed a required API key. Check Step 3 again.

---

## 🚀 Step 5: Start Development Server

```bash
npm run dev
```

You should see output like:
```
> draftdeckai@2.0.0 dev
> next dev

▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 3.2s
```

---

## 🌐 Step 6: Open in Browser

Open your browser and go to:

```
http://localhost:3000
```

You should see the DraftDeckAI homepage! 🎉

---

## 🧪 Testing Features Locally

### Resume Builder
1. Go to **Dashboard** → **New Resume**
2. Describe your experience
3. Watch AI generate a professional resume ✨

### Presentations
1. Go to **Dashboard** → **New Presentation**
2. Enter a topic (e.g., "Climate Change")
3. Watch AI create slides 🎯

### Diagram Builder
1. Go to **Dashboard** → **New Diagram**
2. Choose a diagram type
3. Add your content
4. Export as PNG/SVG 📊

### Letters
1. Go to **Dashboard** → **New Letter**
2. Paste a job URL (e.g., LinkedIn job posting)
3. AI tailors a cover letter ✉️

---

## 📝 Common Development Tasks

### Run Tests
```bash
npm test                # Run all tests
npm run test:watch     # Watch mode (re-runs on file changes)
```

### Check Code Quality
```bash
npm run lint            # Check linting errors
npm run lint:fix        # Auto-fix linting errors
npm run build           # Check for build errors
```

### Database Migrations
```bash
# Generate TypeScript types from database
npm run supabase:generate-types
```

### Update Dependencies
```bash
npm outdated            # Show outdated packages
npm update              # Update packages
```

---

## 🆘 Troubleshooting

### ❌ "Cannot find module" errors

**Solution:**
```bash
npm install
# Still failing?
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ "GEMINI_API_KEY not found"

**Solution:**
1. Check `.env.local` exists in root directory
2. Check variable name is exactly `GEMINI_API_KEY`
3. Check value is not empty
4. Restart dev server: `npm run dev`

```bash
# Verify on macOS/Linux
cat .env.local | grep GEMINI

# Verify on Windows (PowerShell)
Get-Content .env.local | Select-String "GEMINI"
```

---

### ❌ Port 3000 already in use

**Solution:**
```bash
# Kill process using port 3000
# macOS/Linux:
lsof -ti :3000 | xargs kill -9

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use different port:
npm run dev -- -p 3001
```

---

### ❌ Supabase connection errors

**Solution:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` is not empty
2. Verify URL format: `https://xxxxx.supabase.co`
3. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists
4. Restart dev server

---

### ❌ Build fails with "TypeScript errors"

**Solution:**
```bash
# Check TypeScript errors
npm run build

# Read the specific error message
# Fix the file mentioned
# Re-run build
```

---

## 🎓 Quick Git Setup for Contributors

### Configure Git (first time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Create feature branch
```bash
git checkout -b feature/your-feature-name
# Example: git checkout -b feature/add-new-resume-template
```

### Commit changes
```bash
git add .
git commit -m "feat: add new resume template"
# Use conventional commits: feat, fix, docs, style, refactor, test, chore
```

### Push to your fork
```bash
git push origin feature/your-feature-name
```

### Create Pull Request
- Go to GitHub
- You should see a **"Compare & pull request"** button
- Click it and fill in the description

---

## 📚 Additional Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **React Documentation:** https://react.dev
- **TypeScript Documentation:** https://www.typescriptlang.org/docs/
- **Supabase Documentation:** https://supabase.com/docs
- **Tailwind CSS Documentation:** https://tailwindcss.com/docs
- **shadcn/ui Documentation:** https://ui.shadcn.com

---

## 💡 Tips for Smooth Development

✅ **Always sync with upstream** before starting new work:
```bash
git fetch upstream
git rebase upstream/main
```

✅ **One feature per branch** - Don't mix multiple features

✅ **Test locally** before pushing:
```bash
npm run lint && npm test && npm run build
```

✅ **Keep `.env.local` secret** - Never commit it!

✅ **Read related files** before making changes

✅ **Ask questions** if anything is unclear

---

## 🤝 Getting Help

- 💬 **Comment on GitHub issues** - Ask for clarification
- 📖 **Check CONTRIBUTING.md** - General contribution guidelines
- 🗣️ **Discord community** - Ask mentors and contributors
- 🔗 **LinkedIn** - Connect with project maintainers

---

## ✨ You're All Set!

You now have a fully functional DraftDeckAI development environment. 

**Next steps:**
1. Explore the codebase (`app/`, `components/`, `lib/`)
2. Read [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
3. Check GitHub Issues for tasks to work on
4. Make your first contribution! 🚀

**Happy coding! 🎉**

---

**Last Updated:** May 2026  
**Maintained by:** DraftDeckAI Community
