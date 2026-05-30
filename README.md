<div align="center">

# 🎨 DraftDeckAI

### AI-Powered Document Creation Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Create stunning resumes, presentations, letters, and diagrams with AI magic ✨**

 [Documentation](#-documentation) • [Contributing](#-contributing)
 > ⚠️ **Live Demo temporarily unavailable** — production deployment is currently down. See [#631](https://github.com/Muneerali199/Draftdeckai/issues/631).

</div>

---

## ✨ Features

### 📄 Resume Builder
- **AI-Powered Generation** - Describe your experience, get a professional resume
- **Multiple Templates** - Modern, Professional, Creative, and ATS-optimized styles
- **ATS Score Checker** - Ensure your resume passes Applicant Tracking Systems
- **PDF Export** - Download high-quality PDFs instantly
- **LinkedIn Import** - Import your LinkedIn profile to create resumes

### 🎯 Presentation Creator
- **Smart Slide Generation** - Enter a topic, get a complete presentation
- **16:9 Format** - Professional widescreen presentations
- **Multiple Themes** - Modern, Corporate, Creative, and more
- **Image Integration** - AI-generated images for each slide
- **Export Options** - Download as PDF or share via link

### ✉️ Letter Generator
- **Multiple Types** - Cover letters, formal letters, thank you notes
- **Job URL Import** - Paste a job listing URL for tailored cover letters
- **Professional Templates** - Business-ready formatting
- **AI Enhancement** - Improve tone and content with AI

### 📊 Diagram Builder
- **Architecture Diagrams** - System design with subgraphs and layers
- **Flowcharts** - Create process diagrams easily
- **Mind Maps** - Visualize ideas and concepts
- **Sequence Diagrams** - Show component interactions
- **ER Diagrams** - Database schema visualization
- **Mermaid Syntax** - Powered by Mermaid.js v11
- **9+ Professional Templates** - Ready-to-use diagram templates
- **Theme Integration** - Adapts to light/dark modes
- **Export Options** - Download as PNG/SVG

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for authentication)

### Installation

```bash
# Clone the repository
git clone https://github.com/Muneerali199/Draftdeckai.git
cd Draftdeckai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file with these variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider (Required)
GEMINI_API_KEY=your_gemini_api_key

# Optional
UNSPLASH_ACCESS_KEY=your_unsplash_key
STRIPE_SECRET_KEY=your_stripe_key
```

---

## 🐳 Docker Quick Start

Run the entire application with one command — no manual Node.js installation required.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

```bash
# Clone the repository
git clone https://github.com/Muneerali199/Draftdeckai.git
cd Draftdeckai

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Build and start (development mode with hot reload)
docker compose up

# For production build:
docker compose -f docker-compose.yml up
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The development setup mounts your local files for hot reload — changes to the source code automatically refresh the app.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14.2 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth |
| **AI** | Mistral AI, Google Gemini |
| **Payments** | Stripe |
| **Deployment** | Vercel, Netlify |

---

## 📁 Project Structure

```
DraftDeckAI/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── resume/            # Resume builder
│   ├── presentation/      # Presentation creator
│   ├── letter/            # Letter generator
│   └── diagram/           # Diagram builder
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── resume/           # Resume-specific components
│   ├── presentation/     # Presentation components
│   └── letter/           # Letter components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── public/               # Static assets
└── supabase/             # Database migrations
```

---

## 🔐 Authentication

DraftDeckAI uses Supabase Auth with:
- Email/Password login
- Password reset via email
- Protected routes with middleware
- Session management

---

## 💳 Credits System

| Action | Credits |
|--------|---------|
| Generate Resume | 5 |
| Generate Presentation | 10 |
| Generate Letter | 3 |
| Generate Diagram | 5 |
| ATS Score Check | 2 |

Free tier: 50 credits/month

---

## 📚 Documentation

### Getting Started (⭐ Start Here!)
- **[docs/SETUP.md](./docs/SETUP.md)** - 📖 Complete setup guide with step-by-step API key generation and troubleshooting
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/UTILITIES.md](./docs/UTILITIES.md)** - Development utilities & best practices guide

### Architecture & Diagrams
- [docs/DARK_MODE_PERSISTENCE.md](./docs/DARK_MODE_PERSISTENCE.md) - 🌓 Detailed dark mode persistence and FOUC prevention system guide
- [ARCHITECTURE_DIAGRAM_FEATURE.md](./ARCHITECTURE_DIAGRAM_FEATURE.md) - Complete guide to architecture diagrams
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) - Technical system architecture  
- [ARCHITECTURE_IMPROVEMENTS.md](./ARCHITECTURE_IMPROVEMENTS.md) - Recent improvements summary

### Other Docs
- [Code_of_Conduct.md](./Code_of_Conduct.md) - Community standards
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [FAQ.md](./FAQ.md) - Frequently asked questions
- [docs/THEME_FIX.md](./docs/THEME_FIX.md) - Theme-Adaptive presentation fix guide

---

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---
## 💬 Community and Support

Join our official WhatsApp group to connect with other contributors, get help with your PRs, or discuss project ideas: 
[![WhatsApp Group](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/JblK45aOdv9Ao0YhnMcPcQ)

---

## 👥 Contributors

We appreciate all contributors who help improve DraftDeckAI ❤️

### 📊 All Contributors
https://github.com/Muneerali199/Draftdeckai/graphs/contributors

### 🎨 Visual Contributors

<a href="https://github.com/Muneerali199/Draftdeckai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Muneerali199/Draftdeckai" />
</a>

---

## 🤝 Contributing

Contributions are welcome! We've made it easy to get started:

**First-time contributors?** Start here:
1. 📖 Read [docs/SETUP.md](./docs/SETUP.md) - Complete setup guide with all API keys
2. 📚 Check [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
3. 🛠️ Review [docs/UTILITIES.md](./docs/UTILITIES.md) - Development utilities guide

**Ready to contribute?**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Get help:**
- Check [GitHub Issues](https://github.com/Muneerali199/DraftDeckAI/issues) for tasks
- Look for `good first issue` label for beginner-friendly tasks
- Join our Discord community for mentorship

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Supabase](https://supabase.com/) - Backend & Auth
- [Mistral AI](https://mistral.ai/) - AI generation
- [Mermaid.js](https://mermaid.js.org/) - Diagram rendering
- [Nebius Token Factory](https://nebius.com/services/token-factory) - Qwen AI models
- [OpenAI](https://openai.com/) - API client library

---

<div align="center">

**Built with ❤️ by [Muneer Ali](https://github.com/Muneerali199) and [Mayank Sahu](https://github.com/msnotfound) .**

⭐ Star this repo if you find it helpful!

</div>
