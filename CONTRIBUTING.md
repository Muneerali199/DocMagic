# 🪄 Contributing to DraftDeckAI
Thank you for your interest in contributing to **DraftDeckAI**!   
We’re thrilled to have you onboard. Your ideas, code, and feedback are all valuable to us.

This document will help you get started with contributing in a smooth and respectful way.

<div align="center">

**Welcome to DraftDeckAI - Where AI Meets Document Creation Magic!** ✨

![DraftDeckAI Contributors](https://img.shields.io/github/contributors/Muneerali199/DraftDeckAI?style=for-the-badge&color=6366f1)
![GitHub Issues](https://img.shields.io/github/issues/Muneerali199/DraftDeckAI?style=for-the-badge&color=10b981)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)

</div>

Whether you're a seasoned developer, a design enthusiast, a documentation wizard, or someone taking their first steps into open source - **we wholeheartedly welcome you!** This guide will help you make meaningful contributions to DraftDeckAI with confidence and joy. 🚀

> 💡 **New to open source?** Perfect! DraftDeckAI is designed to be contributor-friendly. We provide mentorship, detailed feedback, and celebrate every contribution—no matter how small!

---

## 🎯 Table of Contents

- [🌟 About DraftDeckAI](#-about-draftdeckai)
- [🌟 GirlScript Summer of Code 2026 (GSSoC)](#-girlscript-summer-of-code-2026-gssoc)
- [🚀 Quick Start Guide](#-quick-start-guide)
- [🔍 Finding Your First Issue](#-finding-your-first-issue)
- [🤝 Ways to Contribute](#-ways-to-contribute)
- [🌿 Git Workflow & Best Practices](#-git-workflow--best-practices)
- [📝 Coding Standards & Testing](#-coding-standards--testing)
- [📋 Pull Request Process](#-pull-request-process)
- [🐛 Reporting Issues](#-reporting-issues)
- [📚 Resources & Support](#-resources--support)

---

## 🌟 About DraftDeckAI

**DraftDeckAI** is a cutting-edge, open-source AI-powered document creation platform that transforms how professionals create stunning documents. Built with modern technologies and community-first principles, we're revolutionizing document generation for the world.

### 🛠️ **Tech Stack**

- **Frontend**: Next.js 14.2 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Google Gemini AI (Primary), Mistral AI (Optional)
- **Payments**: Stripe
- **Deployment**: Netlify/Vercel

**🌐 Live Demo**: [https://draftdeckai.com/](https://draftdeckai.com/)

---

## 🌟 GirlScript Summer of Code 2026 (GSSoC)

**DraftDeckAI is proudly participating in GirlScript Summer of Code 2026!** 🎉

If you're a GSSoC contributor, please follow these strict guidelines to ensure a smooth workflow:

- **Look for labels**: Search for issues labeled `GSSoC 2026`, `good first issue`, and `documentation`.
- **Ask to be assigned**: You **MUST** request assignment and be assigned by a maintainer before starting work. Unassigned PRs will not be merged.
- **One issue at a time**: Please claim only one issue at a time to give everyone a fair chance.
- **Mention GSSoC**: Include "GSSoC 2026" in your PR description to help us track contributions.
- **We're excited to mentor and grow with you!** 🚀

---

## 🚀 Quick Start Guide

Ready to contribute? Here's the fastest way to get started:

### 📋 Prerequisites
Before you begin, please ensure you have the following installed and set up:
- **Node.js**: Version 18 or higher (check by running `node -v` in your terminal).
- **Package Manager**: npm or yarn (check by running `npm -v`).
- **Supabase Account**: You will need a free Supabase account for the database and authentication features.
- **API Keys**: You will need a Google Gemini API key (free tier available) to run the AI generation workflows locally.

### 1️⃣ **Fork & Clone**

1. Fork the repository using the **Fork** button (top right of the GitHub page).
2. Clone your fork:
```bash
   git clone [https://github.com/your-username/DraftDeckAI.git](https://github.com/your-username/DraftDeckAI.git)
   cd DraftDeckAI
   ```
*(Note: Replace `your-username` with your actual GitHub username).*

### 2️⃣ **Create a New Branch**

Before making any changes, create a new branch. This keeps your work separate from the `main` branch.
```bash
git checkout -b feature/your-branch-name
```

### 3️⃣ **Install Dependencies**

```bash
npm install
```

### 4️⃣ **Set Up Environment Variables**

DraftDeckAI requires several API keys for full functionality. 

1. Create a `.env.local` file in your project root by copying the example file:
```bash
   cp .env.example .env.local
   ```
2. Add the required environment variables. 

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=DraftDeckAI
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (Database & Auth) - REQUIRED
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI - REQUIRED for AI features
GEMINI_API_KEY=your_gemini_api_key

# Stripe (Payments) - OPTIONAL for local dev (unless working on payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id
NEXT_PUBLIC_ENABLE_STRIPE=false

# Pexels API (Images) - OPTIONAL
PEXELS_API_KEY=your_pexels_api_key
```

> 📖 **Detailed Setup Guide:** For comprehensive setup instructions with step-by-step API key generation, troubleshooting, and common issues, see [**docs/SETUP.md**](docs/SETUP.md).

### 5️⃣ **Start Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see DraftDeckAI running locally! 🎉

---

## 🔍 Finding Your First Issue

### 🎯 **Issue Labels Guide**

| Label | Description | Perfect For |
| --- | --- | --- |
| `good first issue` | Beginner-friendly tasks | First-time contributors |
| `GSSoC 2026` | Official GSSoC tasks | GSSoC Participants |
| `documentation` | Documentation improvements | Writers, beginners |
| `bug` | Bug fixes needed | Developers of all levels |
| `enhancement` | New feature requests | Experienced developers |
| `ui/ux` | Design improvements | Designers, frontend devs |

---

## 🤝 Ways to Contribute

We believe every contribution matters! Here's how you can help make DraftDeckAI even more magical:
- **💻 Code Features**: Build new AI features, UI components, workflows.
- **🐛 Bug Fixes**: Fix issues, improve performance, enhance stability.
- **📚 Documentation**: Improve guides, API docs, tutorials, README.
- **🎨 Design & UX**: Enhance UI/UX, accessibility, responsive design.
- **🧪 Testing**: Write tests, manual QA, performance testing.

---

## 🕒 Automated Dependency Updates

DraftDeckAI leverages automated tools to keep its dependencies up-to-date, ensuring security, performance, and compatibility. 
- **Dependabot** schedules weekly checks and manages minor/patch versions.
- **GitHub Actions** (`.github/workflows/dependency_check.yml`) runs dependency audits, security checks, and build tests automatically.

---

## 🌿 Git Workflow & Best Practices

### 🌳 **Branch Naming Convention**
- Feature branches: `feature/your-feature-name`
- Bug fix branches: `fix/issue-description`
- Documentation branches: `docs/update-contributing-guide`

### 🔄 **Sync Your Fork**
Always ensure your fork is up to date before starting work:
```bash
git remote add upstream [https://github.com/Muneerali199/DraftDeckAI.git](https://github.com/Muneerali199/DraftDeckAI.git)
git checkout main
git pull upstream main
git push origin main
```

### 📝 **Commit Message Format (Conventional Commits)**
```bash
feat: add new AI prompt optimization
fix: resolve mobile navigation issue
docs: update installation instructions
style: improve button hover animations
test: add unit tests for resume generator
```

---

## 📝 Coding Standards & Testing

Our coding standards ensure consistency, readability, and security across the entire codebase.

### 🎯 **TypeScript & Styling**
- **Always use TypeScript**: No plain JavaScript files. Avoid `any` type whenever possible.
- **Tailwind CSS only**: No custom CSS unless absolutely necessary.

### 🗂️ **Repository Hygiene**
> **⚠️ Do not commit backup, temporary, or stale artifacts to the repository.**
- Ensure that only functional components and pages are tracked. Avoid committing files with suffixes like `.bak`, `.tmp`, or `page-old.tsx`.

### ✅ **Code Quality Checks**
Before submitting any PR, ensure your code passes our CI pipeline checks:
```bash
# 1. Linting passes without errors
npm run lint

# 2. TypeScript compilation (Next.js handles type-checking during build)
npm run build

# 3. Specific Zod validation tests pass
npx jest __tests__/lib/validation.test.ts

# 4. Ensure the entire test suite passes locally
npm run test
```

---

## 📋 Pull Request Process

Creating a great pull request is an art! Here's how to make yours shine:

1. **Use the Template**: We provide an automated Pull Request template. Please fill it out completely, detailing how you tested your code and linking the related issue (e.g., `Fixes #123`).
2. **Review Times**: We aim to review PRs within 24-48 hours. Complex changes may take longer.
3. **Iterate**: Make requested changes and push updates to the same branch. 

---

## 🐛 Reporting Issues

Found a bug or have a feature request? We'd love to hear from you!
Please use the automated **Issue Templates** provided in our GitHub repository when creating a new issue (`.github/ISSUE_TEMPLATE`). This ensures you provide all the necessary context (like OS, browser, and steps to reproduce) so we can help you faster.

---

## 📚 Resources & Support

- **Live Demo**: [https://draftdeckai.com](https://draftdeckai.com)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

### 🙌 Need Help?
If you get stuck, feel free to open an issue or ask for help in discussions. We’re here to support each other and grow together! 💬

**Let’s build something amazing together. Happy contributing! 💜**