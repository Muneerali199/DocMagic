export type SectionPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface SectionSpec {
  id: string;
  file: string;
  priority: SectionPriority;
  description: string;
  components: string[];
  responsiveNote: string;
  animationNotes: string;
}

export const sections: SectionSpec[] = [
  {
    id: 'hero',
    file: 'components/hero-section.tsx',
    priority: 'P0',
    description: 'Primary hero with headline, subtitle, CTA buttons, key benefits pills, and stat cards. Floating orbs and mesh gradient background. Trust badge and social proof banner.',
    components: ['HeroSection', 'StatCounter', 'Button', 'TooltipWithShortcut'],
    responsiveNote: 'py-16 sm:py-24 md:py-32 lg:py-40. Floating orbs scale down on mobile (w-60 h-60, opacity 0.06). Stat cards use p-6 sm:p-8 lg:p-10 with hover:scale-105 lg:hover:scale-110. Key benefits pills wrap via flex-wrap.',
    animationNotes: 'animate-fade-in-down on badges, animate-slide-in-left/right on heading/subtitle, animate-scale-in on pills, animate-fade-in-up with staggered delays (delay-300/350/400/500/600) on stat cards.',
  },
  {
    id: 'features-showcase',
    file: 'app/page.tsx (inline section)',
    priority: 'P0',
    description: 'AI-Powered Features Showcase — 4 core feature cards (Resume, Presentations, Letters, CV) + 1 extended card (AI Document Generator) in a grid, plus 6 secondary feature pills. Inline section in page.tsx.',
    components: ['TooltipWithShortcut', 'Link', 'Button'],
    responsiveNote: 'Core grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4. Secondary grid: grid-cols-2 sm:grid-cols-3 lg:grid-cols-6. Container: px-4 sm:px-6 lg:px-8. Section: py-16 sm:py-20 lg:py-24.',
    animationNotes: 'hover:scale-105 on all cards via group hover. Gradient shift on heading text. Shimmer on badge element. Pulse on icons.',
  },
  {
    id: 'features-detailed',
    file: 'components/features-section.tsx',
    priority: 'P1',
    description: 'How It Works — detailed features grid (6 cards) with themed color variants (coral, sky, mint, lavender). Glass-effect badge header, gradient heading, floating orbs background.',
    components: ['FeaturesSection'],
    responsiveNote: 'py-12 sm:py-20 md:py-28 lg:py-36. Grid: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3. Gap: gap-6 sm:gap-6 md:gap-8 lg:gap-10. Cards: p-5 sm:p-6 md:p-7 lg:p-8. Floating orbs scale per breakpoint.',
    animationNotes: 'animate-slide-in-left with stagger delays (delay-100 through delay-600) on each card. Gradient shift on heading text. Hover: hover:scale-[1.02] sm:hover:scale-105, group-hover:bolt-gradient-text.',
  },
  {
    id: 'testimonials',
    file: 'components/testimonials-section.tsx',
    priority: 'P1',
    description: 'Customer testimonials carousel with auto-slide, navigation buttons, pagination dots, social proof stats (rating, users, industry leader).',
    components: ['TestimonialsSection', 'Card', 'Avatar'],
    responsiveNote: 'py-20 sm:py-28 lg:py-36. Carousel: min-h-[420px] sm:min-h-[450px]. Card: w-full max-w-4xl. Social proof pills: flex-wrap with gap-4 sm:gap-6. Nav buttons: p-3 sm:p-4 with touch-manipulation.',
    animationNotes: 'translate-x-full/translate-x-0/-translate-x-full for slide transitions (500ms ease-in-out). hover:scale-105 on card. hover:scale-110 on nav buttons. Auto-slide every 5000ms.',
  },
];

export const sectionOrdering: string[] = [
  'SiteHeader',           // Fixed top nav
  'hero',                 // Hero section
  'features-showcase',    // AI-Powered Features Showcase
  'features-detailed',    // How It Works
  'testimonials',         // Testimonials carousel
];

export const assetNaming = {
  convention: 'kebab-case',
  pattern: '<section>-<element>-<variant>-<state>',
  examples: [
    'hero-bg-mesh-light',
    'hero-orb-float-blue',
    'features-card-coral-default',
    'features-card-sky-hover',
    'testimonials-avatar-priya',
    'cta-button-primary-default',
    'cta-button-primary-hover',
  ],
  imageFormats: ['webp', 'avif', 'png'],
  iconFormat: 'lucide-react',
  assetDir: 'public/images/',
};

export const implementationPriority: { tier: string; items: string[]; description: string }[] = [
  {
    tier: 'P0 — Critical Path',
    items: ['HeroSection layout and copy', 'CTA buttons and links', 'Stat counter component', 'SiteHeader navigation'],
    description: 'Must ship first. These define the above-fold experience.',
  },
  {
    tier: 'P1 — Core Content',
    items: ['Features Showcase grid', 'Detailed Features section', 'Testimonials carousel', 'Social proof pills'],
    description: 'Secondary content sections that drive conversions.',
  },
  {
    tier: 'P2 — Polish & Motion',
    items: ['Scroll-triggered reveal animations', 'Micro-interactions (hover/focus/active)', 'Reduced-motion support', 'Page transition loading states'],
    description: 'Motion design system + interaction polish.',
  },
  {
    tier: 'P3 — Responsive & QA',
    items: ['Mobile/tablet breakpoint verification', 'Touch interaction testing', 'Cross-browser QA', 'Performance audit (LCP, CLS)'],
    description: 'Responsive behavior and cross-device testing.',
  },
];

export const handoffChecklist = [
  'Design tokens defined (colors, typography, spacing, shadows)',
  'Motion tokens defined (durations, easings, keyframes)',
  'Responsive breakpoints documented (mobile, tablet, desktop)',
  'Section specs annotated with component references',
  'Asset naming conventions established',
  'Implementation priority order defined',
  'Reduced-motion accessibility addressed',
  'Touch interaction degradation handled',
  'Component props and state variations documented',
];

export const layoutNotes = {
  containerWidth: 'max-w-7xl (1280px) centered with mx-auto',
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  sectionPadding: 'py-12 sm:py-20 lg:py-28 xl:py-36',
  gridDefaults: {
    mobile: 'grid-cols-1',
    tablet: 'sm:grid-cols-2',
    desktop: 'lg:grid-cols-3',
    wide: 'xl:grid-cols-4',
  },
  headingSizes: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
  bodySizes: 'text-base sm:text-lg lg:text-xl',
} as const;
