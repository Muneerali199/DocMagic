# 🪄 DocMagic — AI Document Creation Platform

DocMagic is a **TypeScript** + **Next.js** platform that helps you **create, analyze, and share professional documents** (Resumes, CVs, Letters, Presentations) with **AI assistance**, modern UI, and a type-safe architecture.



---

## ✨ Features

- ⚡ **AI-powered generation** for resumes, letters, CVs, and slide decks
- 🧩 **Modular architecture** with reusable, typed components
- 🎨 **Tailwind + Radix UI** for accessible, modern design
- 🔐 **Supabase Auth** and row-level security
- 💳 **Stripe** for subscriptions & metered usage
- 📄 **DOCX/PDF/PPTX** parsing & export pipeline
- 🚀 **Next.js App Router** with server components

---

## 🚀 Quick Start

### Prerequisites
- Node.js LTS (≥ 18)
- pnpm (recommended) or npm
- Supabase project (DB + Auth)
- Stripe account (for billing)
- Google Generative AI (Gemini) API key

### Setup

```bash
# 1) Clone
git clone https://github.com/<your-org-or-user>/DocMagic.git
cd DocMagic

# 2) Install
pnpm install   # or: npm install

# 3) Configure environment (see .env.example below)
cp .env.example .env.local
# Fill in keys/secrets

# 4) Run
npm dev       # or: npm run dev

# 5) Build / Start
npm build && npm start
