# 🌟 Contributing to DocMagic

Welcome to **DocMagic – Your AI-powered Document Creation Companion!**
We're thrilled to have you here! Whether you're a seasoned developer or brand-new to open source, this guide will walk you through contributing with clarity and confidence. 🧙‍♂️✨

---

## 📚 Table of Contents

1. About DocMagic
2. GirlScript Summer of Code 2025 (GSSoC)
3. Ways to Contribute
4. How to Contribute
5. Project Architecture
6. Prerequisites
7. Getting Started Locally
8. How to Find and Claim Issues
9. How to Submit a Pull Request (PR)
10. Style and Coding Guidelines
11. Document Contribution Do’s and Don’ts
12. Reporting Issues or Suggesting Features
13. Community and Help
14. Licensing
15. Code of Conduct
16. Final Words

---

## About DocMagic

**DocMagic** is an open-source platform that allows users to generate professional documents like resumes, CVs, business letters, and slide presentations using advanced AI (Google Gemini), styled with Tailwind CSS and animated with Framer Motion.

> "Describe what you want, and let AI build it for you."

* 🌍 Used in 50+ countries
* 🧑‍💼 50,000+ documents generated
* 💖 Open source and community driven



---

## GirlScript Summer of Code 2025 (GSSoC)

DocMagic is proudly participating in **GirlScript Summer of Code 2025** 🎉

If you're a GSSoC contributor:

* Look for `GSSoC 2025`, `good first issue`, and `documentation` labels in [issues](https://github.com/Muneerali199/DocMagic/issues)
* Ask to be assigned before starting work
* Mention GSSoC in your PR description

We're excited to mentor and grow with you!


---

## Ways to Contribute

You can contribute in multiple ways:

| Type             | Description                                 |
| ---------------- | ------------------------------------------- |
| 💻 Code          | Features, bug fixes, animations             |
| 📄 Documentation | Improve README, guides, setup docs          |
| 🎨 Design        | UI/UX, accessibility, responsiveness        |
| 🧠 AI            | Prompt engineering, generation improvements |
| 🧪 Testing       | Write unit tests, manual QA                 |



---

## How to Contribute

Here’s a step-by-step breakdown for new contributors:

1. **Fork** the repository to your own GitHub account.
2. **Clone** the forked repository:

```bash
git clone https://github.com/<your-username>/DocMagic.git
```

3. **Set up the project locally** 
4. **Find an issue** to work on from the [Issues tab](https://github.com/Muneerali199/DocMagic/issues).
5. **Ask to be assigned** by commenting on the issue:

   > "I'd like to work on this issue. Please assign it to me. 😊"
6. **Create a new branch** for your work:

```bash
git checkout -b gssoc/feature-name
```

7. **Make your changes**, ensuring they follow our coding guidelines.
8. **Test locally**, run `npm run lint`.
9. **Commit and push** your changes:

```bash
git add .
git commit -m "feat: add feature for GSSoC 2025"
git push origin gssoc/feature-name
```

10. **Open a Pull Request (PR)** on GitHub:

    * Link the issue in the PR (e.g., `Fixes #issue_number`)
    * Describe your changes clearly
    * Add screenshots or gifs if UI-related

That's it! 🎉 Wait for a maintainer to review your PR.



---

## Project Architecture

| Layer      | Tools                       |
| ---------- | --------------------------- |
| Frontend   | Next.js 15, React 18        |
| Styling    | Tailwind CSS, Framer Motion |
| State Mgmt | Zustand, React Hook Form    |
| Backend    | Supabase (PostgreSQL, Auth) |
| AI         | Google Gemini AI            |
| Payments   | Stripe                      |



---

## Prerequisites

Before you start:

* ✅ Git + GitHub account
* ✅ Node.js v18+
* ✅ npm or yarn
* ✅ Code editor (VS Code recommended)



---

## Getting Started Locally

```bash
# 1. Fork the repo
# 2. Clone your fork
$ git clone https://github.com/<your-username>/DocMagic.git
$ cd DocMagic

# 3. Install dependencies
$ npm install

# 4. Set up env vars
$ cp .env.example .env.local
# Add keys for Supabase, Stripe, Gemini

# 5. Run project
$ npm run dev
```

Visit <http://localhost:3000> to preview the app.



---

## How to Find and Claim Issues

1. Go to the [Issues tab](https://github.com/Muneerali199/DocMagic/issues)
2. Filter by labels like `good first issue`, `GSSoC 2025`, `bug`
3. Comment: "I'd like to work on this. Please assign it to me."
4. Wait for confirmation before starting



---

## How to Submit a Pull Request (PR)

Once your issue is assigned:

```bash
# Create a new branch
$ git checkout -b gssoc/feature-name

# Make your changes

# Stage and commit
$ git add .
$ git commit -m "feat: add feature X for GSSoC 2025"

# Push to GitHub
$ git push origin gssoc/feature-name
```

Then go to GitHub → Open a Pull Request

* Base: `main`
* Compare: your branch
* Title: `feat: Add X [GSSoC 2025]`
* Description: Link issue, explain work, add screenshots if UI-related



---

## Style and Coding Guidelines

* ✅ Use TypeScript, not JavaScript
* ✅ Use Tailwind for all styles
* ✅ Use Radix UI and accessible components
* ✅ Use Zod for validation
* ✅ Format code with Prettier
* ✅ Run `npm run lint` before committing



---

## Document Contribution Do’s and Don’ts

### Do’s

- **Follow DocMagic’s existing style and architecture:** Use TypeScript, Tailwind CSS for styling, Radix UI for components, and adhere to the project’s folder structure and coding patterns.
- **Write clear, meaningful commit messages:** Use imperative mood and briefly explain why the change was made, especially if it improves AI prompts, UI animations, or backend logic.
- **Make focused, atomic commits:** Each commit should represent a single logical change — whether a bug fix, new feature, or documentation update.
- **Test your changes thoroughly:** Run linting (`npm run lint`), local tests, and verify the UI behaves correctly with the new AI-generated documents or animations.
- **Keep documentation up-to-date:** If your change affects user-facing features, UI flow, or developer setup, update README, guides, or `CONTRIBUTING.md` accordingly.
- **Respect and support the community:** Be polite and patient during discussions and code reviews. Your feedback helps everyone grow.
- **Use descriptive pull request titles and descriptions:** Clearly summarize what your PR does and reference related issues (e.g., `Fixes #123`).

### Don’ts

- **Don’t submit large or mixed-scope PRs:** Break down big features or fixes into smaller, manageable pieces for easier review.
- **Don’t ignore failing tests or linting errors:** Fix all issues before submitting your PR to maintain code quality.
- **Don’t include unrelated changes:** Keep your PR focused on the issue you are addressing to avoid confusion.
- **Don’t duplicate existing issues or features:** Search existing issues and PRs before creating new ones.
- **Don’t commit sensitive information:** Never include API keys, environment variables, or passwords in your commits.
- **Don’t forget to add or update tests:** Ensure new features or bug fixes are covered by appropriate tests to prevent regressions.



---

## Reporting Issues or Suggesting Features

To report bugs or suggest features:

1. Go to the [Issues tab](https://github.com/Muneerali199/DocMagic/issues)
2. Click "New Issue"
3. Choose Bug Report or Feature Request template
4. Provide details, steps to reproduce, screenshots (if needed)



---

## Community and Help

We love community support 💬

* 🐦 Twitter: [@DocMagicAI](https://x.com/DocMagicAI)
* 📧 Email: [hello@docmagic.ai](mailto:hello@docmagic.com)

---

## Licensing

DocMagic is released under the **MIT License**. You’re free to use, modify, and share it with proper credit.



---

## Code of Conduct

We follow the #Contributor Covenant Code of Conduct. Please:

* Be respectful
* Avoid discriminatory language
* Help make the community inclusive and supportive


---

## Final Words

Thank you for your interest in contributing to **DocMagic** ✨
Together, let’s make document creation magical, inclusive, and open for all 💖

> "Your first PR may be small, but it matters. Welcome to open source!"
