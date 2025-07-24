# 🤝 Contributing to DocMagic


<div align="center">

Thank you for considering contributing to DocMagic! We welcome contributions from developers of all skill levels. This document outlines the process for contributing to this project and provides comprehensive guidelines to help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Reporting Issues](#reporting-issues)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community and Communication](#community-and-communication)

![Contributing](https://img.shields.io/badge/Contributing-Welcome-brightgreen?style=for-the-badge)
![Open Source](https://img.shields.io/badge/Open%20Source-❤️-red?style=for-the-badge)
![Community](https://img.shields.io/badge/Community-Driven-blue?style=for-the-badge)


</div>

By participating in this project, you agree to abide by our code of conduct. Please be respectful and considerate of others. We are committed to providing a welcoming and harassment-free experience for everyone, regardless of experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

## Getting Started

### Prerequisites

Before contributing, make sure you have:

- Git installed on your local machine
- Node.js (version 14 or higher) and npm installed
- A GitHub account
- Basic familiarity with React, Next.js, and JavaScript/TypeScript
- Read through the project's README.md file

### First-Time Contributors

If you're new to open source or this project:

1. Look for issues labeled `good first issue` or `beginner-friendly`
2. Read through existing issues and pull requests to understand the project better
3. Start with small, focused contributions
4. Don't hesitate to ask questions in issues or discussions


**Welcome to the DocMagic open source community!** 🎉


Thank you for your interest in contributing to DocMagic! We're excited to have you join our community of developers, designers, and users who are passionate about making document creation accessible to everyone through AI.

This guide will help you get started with contributing to our open source project, whether you're fixing a bug, adding a feature, improving documentation, or helping other community members.

## 🌟 Why Contribute to DocMagic?

- **🚀 Impact**: Help millions of users create professional documents
- **📚 Learn**: Gain experience with cutting-edge AI and web technologies
- **🤝 Community**: Join a welcoming, inclusive developer community
- **🏆 Recognition**: Get credited for your contributions and build your portfolio
- **💼 Career**: Showcase your skills to potential employers

## 📋 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background or experience level.

There are several ways to contribute to this project:

### Types of Contributions Welcome

- **Bug fixes**: Help us identify and fix issues
- **Feature development**: Implement new features or enhancements
- **Documentation**: Improve or add documentation
- **Testing**: Write or improve tests
- **Code review**: Review pull requests from other contributors
- **Issue triage**: Help organize and prioritize issues

### Areas Where Help is Needed

- Performance optimizations
- Accessibility improvements
- Cross-platform compatibility
- Internationalization and localization
- User experience enhancements

## Reporting Issues

When reporting bugs or requesting features, please help us understand the issue by providing detailed information.

### Bug Reports

If you find a bug, please create an issue with the following information:

- **Clear, descriptive title**: Summarize the issue in one line
- **Steps to reproduce**: Clear, numbered steps to recreate the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: Include relevant visual evidence (if applicable)
- **Environment details**: Browser, OS, Node.js version, etc.

**Example:**
```
Title: Document generation fails for PDF exports

Steps to reproduce:
1. Create a new document with multiple sections
2. Click "Export as PDF"
3. Error message appears

Expected: PDF should be generated and downloaded
Actual: Error: "Failed to generate PDF" appears
Environment: Chrome 120, Windows 11, Node.js 18.17.0
```

### Feature Requests

We welcome feature suggestions! Please create an issue with:

- **Clear, descriptive title**: Summarize the proposed feature
- **Detailed description**: Explain what the feature should do
- **Use case**: Why this feature would be useful
- **Examples or mockups**: Visual examples if applicable
- **Proposed solution**: Your ideas for implementation (optional)
- **Alternatives considered**: Other approaches you've thought about

## Submitting Pull Requests

### Before You Start

1. **Check existing issues**: Make sure your contribution isn't already being worked on
2. **Create an issue**: For significant changes, create an issue first to discuss the approach
3. **Fork the repository**: Create your own fork to work in
4. **Create a branch**: Use a descriptive branch name

### Pull Request Process

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/DocMagic.git
cd DocMagic

# Add the original repository as upstream
git remote add upstream https://github.com/Xenonesis/DocMagic.git
```

#### 2. Create a Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

**Branch naming conventions:**
- `feature/feature-name` for new features
- `fix/bug-description` for bug fixes
- `docs/update-description` for documentation
- `refactor/component-name` for refactoring
- `test/test-description` for adding tests

#### 3. Make Your Changes

- Write clear, concise commit messages
- Keep commits focused and atomic
- Follow the project's coding standards
- Add tests for new functionality
- Update documentation as needed

#### 4. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "Add user authentication feature

- Implement JWT-based authentication
- Add login/logout endpoints
- Include password hashing
- Add user session management

Fixes #123"
```

**Commit message format:**
- Use present tense ("Add feature" not "Added feature")
- Limit the subject line to 50 characters
- Include a blank line before the body
- Reference issues and pull requests when relevant
- Use bullet points for multiple changes

#### 5. Push and Create Pull Request

```bash
# Push your branch to your fork
git push origin feature/your-feature-name
```

Then create a pull request through GitHub's interface.

### Pull Request Guidelines

#### PR Title and Description

- **Clear title**: Summarize the change in one line
- **Detailed description**: Explain what changes were made and why
- **Link related issues**: Use "Fixes #123" or "Closes #123"
- **Breaking changes**: Clearly mark any breaking changes

#### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)
Include before/after screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```


## 🚀 How to Contribute


### 🐛 Reporting Bugs

- **Follow the coding style** of the project
- **Include tests** for new features and bug fixes
- **Update documentation** as needed
- **Keep pull requests focused** on a single concern
- **Link related issues** in the pull request description using "Fixes #123" or "Closes #123"
- Address feedback promptly and courteously
- Make requested changes in new commits (don't force-push during review)
- Once approved, a maintainer will merge your PR


Found a bug? Help us fix it! Please create a detailed bug report:

 
1. **Search existing issues** to avoid duplicates
2. **Use our bug report template** when creating a new issue
3. **Include the following information**:
   - 📝 Clear, descriptive title
   - 🔄 Step-by-step reproduction instructions
   - ✅ Expected behavior vs actual behavior
   - 📸 Screenshots or screen recordings (if applicable)
   - 🖥️ Environment details (browser, OS, Node.js version)
   - 📋 Console errors or logs
   - 🔗 Link to a minimal reproduction (if possible)

**Bug Report Template:**
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Muneerali199/DocMagic.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment** (if needed):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

### Project Structure

Understanding the project structure will help you navigate and contribute effectively:

- `/pages` - Next.js pages and routing
- `/components` - Reusable React components
- `/public` - Static assets (images, icons, etc.)
- `/styles` - CSS and styling files
- `/lib` - Utility functions and shared code
- `/api` - API routes and server-side logic
- `/hooks` - Custom React hooks
- `/utils` - Helper functions and utilities

### Development Workflow

1. Keep your fork synced with upstream:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. Regularly rebase your feature branch:
   ```bash
   git checkout feature/your-feature
   git rebase main
   ```

3. Run tests and checks before pushing:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Avoid deep nesting when possible

### Code Formatting

- Use the project's linting configuration
- Run the linter before committing: `npm run lint`
- Use automatic formatting: `npm run format` (if available)
- Follow React and Next.js best practices
- Use TypeScript when applicable for better type safety

### File Organization

- Place files in appropriate directories
- Use consistent naming conventions
- Group related functionality together
- Keep file sizes reasonable

## Testing

### Testing Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain or improve test coverage
- Tests should be fast and reliable

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- filename.test.js
```

### Test Guidelines

- Write descriptive test names
- Test both happy path and edge cases
- Use appropriate assertions
- Mock external dependencies
- Keep tests isolated and independent

## Documentation

### Documentation Standards

- Keep documentation up-to-date with code changes
- Write clear, concise explanations
- Include code examples when helpful
- Use proper grammar and spelling
- Follow the existing documentation style

### Types of Documentation

- **README**: Project overview and quick start
- **API documentation**: Function and method references
- **Tutorials**: Step-by-step guides
- **Code comments**: Explain complex logic
- **Changelog**: Track changes and releases

## Community and Communication

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check existing docs first
- **Code of Conduct**: Follow community guidelines

### Staying Updated

- Watch the repository for notifications
- Follow project announcements
- Participate in discussions
- Review other contributors' pull requests


**Expected Behavior**
What you expected to happen.


**Screenshots**
Add screenshots to help explain the problem.

We use [Semantic Versioning (SemVer)](http://semver.org/) for versioning. This means:

- **Major versions** (X.0.0) for breaking changes
- **Minor versions** (0.X.0) for new features that are backward compatible
- **Patch versions** (0.0.X) for bug fixes and small improvements


**Environment**
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 94]
- Node.js: [e.g. 18.0.0]
- DocMagic Version: [e.g. 0.3.0]
```


### ✨ Suggesting Features

By contributing to DocMagic, you agree that your contributions will be licensed under the same license as the project.


Have an idea to make DocMagic better? We'd love to hear it!


1. **Check our [roadmap](./ROADMAP.md)** to see if it's already planned
2. **Search existing feature requests** to avoid duplicates
3. **Start a discussion** in [GitHub Discussions](https://github.com/docmagic-ai/docmagic/discussions)
4. **Create a detailed feature request** with:
   - 🎯 Clear, descriptive title
   - 📖 Detailed description of the proposed feature
   - 🎨 Mockups, wireframes, or examples (if applicable)
   - 💡 Explanation of why this feature would be valuable
   - 🔧 Technical considerations or implementation ideas
   - 👥 Target users who would benefit

### 🔧 Contributing Code

Ready to write some code? Here's how to get started:

#### 🍴 Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/yourusername/docmagic.git
   cd docmagic
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/docmagic-ai/docmagic.git
   ```

#### 🛠️ Set Up Development Environment

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

#### 🌿 Create a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

#### 📝 Make Your Changes

- **Follow our coding standards** (see below)
- **Write clear, descriptive commit messages**
- **Add tests** for new functionality
- **Update documentation** as needed
- **Test your changes thoroughly**

#### 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when available)
npm run test

# Build the project
npm run build
```

#### 📤 Submit Your Pull Request

1. **Push your changes**:
   ```bash
   git push origin feature/your-feature-name
   ```
2. **Create a pull request** on GitHub
3. **Fill out the PR template** with:
   - 📋 Description of changes
   - 🔗 Link to related issues
   - 📸 Screenshots (for UI changes)
   - ✅ Checklist confirmation

#### 📋 Pull Request Guidelines

- ✅ **One feature per PR** - keep changes focused
- ✅ **Clear commit messages** following conventional commits
- ✅ **Update documentation** for new features
- ✅ **Add tests** for new functionality
- ✅ **Follow coding standards** and pass linting
- ✅ **Link related issues** in the PR description
- ✅ **Be responsive** to code review feedback

## 📚 Documentation Contributions

Documentation is just as important as code! You can help by:

- 📝 **Improving existing docs** - fix typos, clarify instructions
- 📖 **Writing tutorials** - help new users get started
- 🎥 **Creating video guides** - visual learners will thank you
- 🌍 **Translating content** - make DocMagic accessible globally
- 📊 **Adding examples** - show real-world usage patterns

## 🎨 Design Contributions

Designers are welcome too! You can contribute:

- 🎨 **UI/UX improvements** - enhance user experience
- 🖼️ **New templates** - expand our template library
- 🎭 **Icons and graphics** - improve visual appeal
- ♿ **Accessibility features** - make DocMagic inclusive
- 📱 **Mobile optimizations** - improve responsive design

## 🏗️ Project Structure

```
docmagic/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 api/               # API routes
│   ├── 📁 resume/            # Resume pages
│   ├── 📁 presentation/      # Presentation pages
│   └── 📁 auth/              # Authentication pages
├── 📁 components/            # React components
│   ├── 📁 ui/                # Reusable UI components
│   ├── 📁 resume/            # Resume-specific components
│   └── 📁 presentation/      # Presentation components
├── 📁 lib/                   # Utility libraries
│   ├── 📄 gemini.ts          # AI integration
│   ├── 📄 stripe.ts          # Payment processing
│   └── 📄 supabase.ts        # Database client
├── 📁 hooks/                 # Custom React hooks
├── 📁 types/                 # TypeScript definitions
└── 📁 public/                # Static assets
```

## 🎯 Coding Standards

### TypeScript Guidelines

```typescript
// Use descriptive names
const generateResumeContent = async (userInput: ResumeInput) => {
  // Implementation
};

// Prefer interfaces for object types
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Use proper error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw new Error('Failed to process request');
}
```

### React Component Guidelines

```tsx
// Use functional components with TypeScript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(resume): add new template selection
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): optimize document generation
test(resume): add unit tests for template engine
```

## 🔄 Versioning

We use [Semantic Versioning](http://semver.org/) (SemVer):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

## 🏷️ Issue Labels

We use labels to organize issues and PRs:

- 🐛 `bug` - Something isn't working
- ✨ `enhancement` - New feature or request
- 📚 `documentation` - Improvements to docs
- 🆘 `help wanted` - Extra attention is needed
- 🥇 `good first issue` - Good for newcomers
- 🔥 `priority: high` - High priority items
- 🎨 `design` - Design-related issues
- 🧪 `testing` - Testing-related issues

## 🎉 Recognition

We believe in recognizing our contributors! Here's how we show appreciation:

### 🏆 Contributor Levels

- **🌱 First-time Contributor**: Your first merged PR
- **🌿 Regular Contributor**: 5+ merged PRs
- **🌳 Core Contributor**: 20+ merged PRs or significant features
- **🏅 Maintainer**: Trusted with repository access

### 🎁 Rewards

- 📛 **GitHub badges** on your profile
- 🎽 **Exclusive swag** for significant contributions
- 📢 **Social media shoutouts** for major features
- 💼 **Portfolio showcase** opportunities
- 🎤 **Speaking opportunities** at events

## 📞 Getting Help

Need help contributing? We're here for you!

- 💬 **Discord**: [Join our community](https://discord.gg/docmagic)
- 📧 **Email**: `contributors@docmagic.com`
- 🐛 **Issues**: [GitHub Issues](https://github.com/docmagic-ai/docmagic/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/docmagic-ai/docmagic/discussions)

## 📜 License

By contributing to DocMagic, you agree that your contributions will be licensed under the same [MIT License](./LICENSE) that covers the project.

## 👥 Maintainers

This project is maintained by:

- **Xenonesis** - Lead Maintainer
  - GitHub: [@xenonesis](https://github.com/xenonesis)
  - Email: `maintainer@docmagic.com`

## 🙏 Thank You!

Every contribution, no matter how small, makes DocMagic better for everyone. Thank you for being part of our open source community!

---

<div align="center">

**Ready to contribute? We can't wait to see what you'll build! 🚀**

[![Start Contributing](https://img.shields.io/badge/Start-Contributing-brightgreen?style=for-the-badge)](https://github.com/docmagic-ai/docmagic/issues/labels/good%20first%20issue)

</div>

This project is maintained by **Xenonesis**. For questions about the project direction or major changes, feel free to reach out to the maintainers.

## Recognition

We appreciate all contributions and will:

- Credit contributors in release notes
- Add contributors to the project's contributors list
- Recognize significant contributions publicly
- Foster a welcoming community for all contributors

## Questions?

If you have questions about contributing, please:

1. Check this guide and the project documentation
2. Search existing issues and discussions
3. Create a new issue with the "question" label
4. Reach out to maintainers if needed

Thank you for contributing to DocMagic! Your efforts help make this project better for everyone.

---

*This contributing guide follows open source best practices and is specific to the DocMagic project. We may update these guidelines as our project evolves.*

