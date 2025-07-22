# Changelog

All notable changes to DocMagic will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2025-01-22

### Added
- **Comprehensive About Page Enhancement** - Significantly expanded `/about` page with detailed information
- **Design Philosophy Section** - Added "Magical Professionalism" design principles showcase
- **Security & Quality Section** - Detailed security measures and quality assurance practices
- **Enhanced Technology Stack Display** - Comprehensive frontend, backend, and infrastructure tech overview
- **Design Principles Cards** - Interactive cards showcasing 6 core design principles
- **Security Features Highlight** - OWASP compliance, authentication, rate limiting, and privacy measures
- **Quality Assurance Details** - Testing frameworks, CI/CD, performance monitoring, and accessibility standards

### Enhanced
- **About Page Navigation** - Already linked in main navigation, now with comprehensive content
- **README.md Documentation** - Added about page references and designer credit
- **Feature Documentation** - Updated all MD files to reflect enhanced about page capabilities

### Technical Improvements
- **Data Arrays** - Added `designPrinciples`, `frontendTech`, `backendTech`, and `infrastructureTech` arrays
- **Component Structure** - Enhanced about page component with new sections and improved layout
- **Content Organization** - Better structured information architecture for improved user experience

### Credits
- **Designed by**: [Xenonesis](https://github.com/Xenonesis)

## [0.4.0] - 2025-01-27

### Changed
- **Theme Toggle Improvement**: Simplified dark mode toggle to a single-click switch by @xenonesis
  - Removed dropdown menu from theme toggle component
  - Now toggles directly between light and dark modes with one click
  - Eliminated "System" theme option for streamlined user experience
  - Maintained smooth icon animations and transitions
  - Added proper hydration handling to prevent client-server mismatches

### Enhanced
- **Open Source Documentation**: Comprehensive updates to emphasize open source nature by @xenonesis
  - Enhanced README.md with prominent open source badges and community focus
  - Completely redesigned CONTRIBUTING.md with detailed contributor guidelines
  - Added CONTRIBUTORS.md for community recognition
  - Updated package.json with open source metadata and repository information
  - Enhanced ROADMAP.md to highlight community-driven development
  - Improved LICENSE section to clearly explain open source benefits

### Added
- New contributor recognition system with multiple contribution types
- Comprehensive coding standards and development guidelines
- Community channels and support information
- Detailed project structure documentation

### Updated
- Upgraded dependencies to their latest compatible versions:
  - @google/generative-ai from 0.3.0 to 0.3.1
  - @stripe/stripe-js from 3.0.0 to 3.5.0
  - @supabase/auth-helpers-nextjs from 0.9.0 to 0.10.0
  - @supabase/supabase-js from 2.39.7 to 2.52.0
  - eslint from 8.57.0 to 8.57.1
  - framer-motion from 12.19.1 to 12.23.6
  - jspdf from 2.5.1 to 2.5.2
  - next-themes from 0.3.0 to 0.4.6
  - officeparser from 5.1.1 to 5.2.0
  - postcss from 8.4.38 to 8.5.6
  - react and react-dom from 18.3.0 to 18.3.1
  - react-hook-form from 7.53.0 to 7.60.0
  - react-resizable-panels from 2.1.3 to 2.1.9
  - recharts from 2.12.7 to 2.15.4
  - sonner from 1.5.0 to 1.7.4
  - stripe from 14.20.0 to 14.25.0
  - tailwind-merge from 2.5.2 to 2.6.0
  - tailwindcss from 3.3.3 to 3.4.17
  - zod from 3.23.8 to 3.25.76
  - zustand from 4.5.2 to 4.5.7
  - @types/react from 19.1.6 to 19.1.8

## [0.3.0] - 2025-07-22

### Added
- Enhanced README.md with comprehensive documentation
- Community-focused documentation (CODE_OF_CONDUCT.md, ROADMAP.md)
- Detailed API documentation with TypeScript examples
- Complete project structure documentation
- Advanced deployment guides for Netlify, Vercel, and Docker
- Comprehensive environment configuration guide

### Enhanced
- Visual design improvements with modern badges and hero section
- Technical architecture documentation with exact dependency versions
- Step-by-step setup instructions for all services
- Contributing guidelines and community support information
- License and acknowledgments section

### Improved
- Documentation consistency across all .md files
- Project metadata and version synchronization
- Development workflow documentation

## [0.2.0] - 2025-07-22

### Added
- Support for Next.js 15.4.0
- Updated React to version 18.3.0
- Updated React DOM to version 18.3.0

### Changed
- Upgraded from Next.js 14.1.3 to Next.js 15.4.0
- Updated eslint-config-next to version 15.4.0
- Improved project documentation

### Fixed
- Resolved dependency conflicts during upgrade

## [0.1.0] - Initial Release

### Added
- Initial project setup with Next.js 14.1.3
- Document processing capabilities
- Integration with various document formats (PDF, DOCX)
- UI components using Radix UI
- Authentication with Supabase
- Stripe payment integration
- Responsive design with Tailwind CSS
- Theme support with next-themes
- Form handling with react-hook-form and zod validation

## Contributors

### Xenonesis
- Upgraded the project to Next.js 15.4.0
- Created comprehensive open source documentation and community guidelines
- Simplified theme toggle for better user experience
- Maintained dependencies and resolved conflicts
- Ensured compatibility with latest React versions
- Implemented best practices for Next.js applications
- Enhanced project's open source identity and contributor onboarding