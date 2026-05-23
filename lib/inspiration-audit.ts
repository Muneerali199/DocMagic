export type Action = 'do' | 'adapt' | 'avoid';
export type SectionMap = 'hero' | 'features' | 'testimonials' | 'cta' | 'navigation' | 'trust';

export interface Reference {
  name: string;
  url: string;
  sections: Partial<Record<SectionMap, Action>>;
  strengths: string[];
  whatToAdapt: string[];
  whatToAvoid: string[];
}

export interface SectionRecommendation {
  section: string;
  direction: string;
  references: string[];
  keyTakeaway: string;
}

export const references: Reference[] = [
  {
    name: 'Copy.ai',
    url: 'https://www.copy.ai',
    sections: { hero: 'do', features: 'adapt', testimonials: 'adapt', cta: 'do' },
    strengths: [
      'Animated gradient mesh background creates depth without distracting',
      'One-line headline with clear value prop immediately above fold',
      'Feature icons use consistent 2-tone color system',
      'Smooth scroll-triggered reveal animations on cards',
    ],
    whatToAdapt: [
      'Mesh gradient backgrounds (already implemented)',
      'Staggered card reveal on scroll for features grid',
      'CTA button glow animation on hover',
    ],
    whatToAvoid: [
      'Too many floating orbs can feel busy on mobile',
      'Auto-playing hero animations increase CLS score',
    ],
  },
  {
    name: 'Jasper.ai',
    url: 'https://www.jasper.ai',
    sections: { hero: 'adapt', features: 'do', testimonials: 'do', trust: 'do' },
    strengths: [
      'Stat counters with live number animations build credibility',
      'Testimonial carousel uses real customer photos and verified badges',
      'Feature cards use distinct color-coded themes per use case',
      'Enterprise trust bar (Fortune 500 logos) placed right after hero',
    ],
    whatToAdapt: [
      'Stat counter animation with suffix (K+, %, ★)',
      'Social proof pills with specific numbers (10K+ Users, 4.9/5)',
      'Verified badge on testimonial avatars',
    ],
    whatToAvoid: [
      'Overly long testimonials (3+ sentences) slow scanning',
      'Multiple CTAs per section causes choice paralysis',
    ],
  },
  {
    name: 'Grammarly',
    url: 'https://www.grammarly.com',
    sections: { hero: 'do', features: 'do', navigation: 'do', trust: 'do' },
    strengths: [
      'Minimal, uncluttered hero with single primary CTA',
      'Product screenshot integrated into hero shows value instantly',
      'Sticky top nav with clear hierarchy',
      'Social proof bar (5B+ daily users) is subtle but effective',
    ],
    whatToAdapt: [
      'Single primary CTA reduces decision friction',
      'Trust badge in hero (Trusted by professionals worldwide)',
      'Clean nav with minimal items',
    ],
    whatToAvoid: [
      'Too minimal can feel generic without brand character',
      'Lack of animated elements may feel static',
    ],
  },
  {
    name: 'Notion AI',
    url: 'https://www.notion.so/product/ai',
    sections: { hero: 'adapt', features: 'do', testimonials: 'adapt', cta: 'do' },
    strengths: [
      'Playful branded illustrations make complex AI feel approachable',
      'Feature cards use real product screenshots not generic icons',
      'Staggered layout breaks grid monotony',
      'Bottom CTA uses same visual language as hero',
    ],
    whatToAdapt: [
      'Mixing icon-only and screenshot cards for variety',
      'Breaking symmetrical grid for visual interest',
      'Consistent CTA treatment across sections',
    ],
    whatToAvoid: [
      'Custom illustrations are expensive to maintain',
      'Non-standard card sizes can cause layout shifts on resize',
    ],
  },
  {
    name: 'OpenAI ChatGPT',
    url: 'https://chatgpt.com',
    sections: { hero: 'do', features: 'adapt', cta: 'do', navigation: 'do' },
    strengths: [
      'Hero shows actual product interface (chat), not abstract concept',
      'Feature bullets use clear benefit-driven copy',
      'Minimal nav with just logo, product name, and CTA',
      'Dark mode toggle visible immediately',
    ],
    whatToAdapt: [
      'Show document previews directly in hero',
      'Benefit-driven feature copy format',
      'Clean nav with primary action button',
    ],
    whatToAvoid: [
      'No testimonials or social proof on landing page',
      'Lacks visual hierarchy in feature list',
    ],
  },
  {
    name: 'Figma AI',
    url: 'https://www.figma.com/ai',
    sections: { hero: 'do', features: 'do', cta: 'do', trust: 'adapt' },
    strengths: [
      'Hero pairs benefit headline with interactive product demo',
      'Feature breakdown uses before/after comparison effectively',
      'CTA is contextual (flows naturally from last feature)',
      'Gradient accent colors match brand identity',
    ],
    whatToAdapt: [
      'Before/after comparison for document quality',
      'Contextual CTA placement at end of features',
      'Gradient accents tied to brand colors',
    ],
    whatToAvoid: [
      'Interactive demos are high-effort to build and maintain',
      'Heavy product screenshots slow page load',
    ],
  },
  {
    name: 'Canva',
    url: 'https://www.canva.com',
    sections: { hero: 'adapt', features: 'do', testimonials: 'do', cta: 'do' },
    strengths: [
      'Template preview grid immediately shows what you can create',
      'Role-based messaging (students, marketers, teams) expands appeal',
      'Masonry layout feels dynamic and content-rich',
      'Free tier prominently featured to reduce signup friction',
    ],
    whatToAdapt: [
      'Document type showcase (resume, presentation, CV, letter)',
      'Role-based targeting in feature cards',
      'Clear free-tier value proposition',
    ],
    whatToAvoid: [
      'Too many options can overwhelm on first visit',
      'Masonry layouts can cause layout shift',
    ],
  },
  {
    name: 'Claude.ai',
    url: 'https://claude.ai',
    sections: { hero: 'do', features: 'do', navigation: 'do', cta: 'do' },
    strengths: [
      'Clean, almost minimalist hero with strong typography',
      'Feature list uses comparison to existing solutions',
      'Brand voice is trustworthy and professional',
      'Simple auth flow (Google SSO) reduces friction',
    ],
    whatToAdapt: [
      'Clean typography-first hero approach',
      'Comparison-based feature framing',
      'Professional brand tone in copy',
    ],
    whatToAvoid: [
      'No visual demonstrations or previews',
      'Text-heavy sections can lose user attention',
    ],
  },
  {
    name: 'Perplexity.ai',
    url: 'https://www.perplexity.ai',
    sections: { hero: 'adapt', features: 'adapt', trust: 'do', cta: 'adapt' },
    strengths: [
      'Hero integrates search interface as product demo',
      'Trusted by universities and researchers badge',
      'Clean information hierarchy',
      'Fast page load with minimal animations',
    ],
    whatToAdapt: [
      'Academic/research trust signals',
      'Product-interface-as-hero approach',
      'Fast-loading minimal animation philosophy',
    ],
    whatToAvoid: [
      'Too text-heavy above fold',
      'Lacks emotional design elements',
    ],
  },
  {
    name: 'Synthesia',
    url: 'https://www.synthesia.io',
    sections: { hero: 'do', features: 'do', testimonials: 'do', trust: 'do' },
    strengths: [
      'Video preview in hero immediately demonstrates product',
      'Enterprise trust badges (BBC, Amazon, Nike)',
      'Feature grid with clear metrics per item',
      'Testimonial carousel with video thumbnails',
    ],
    whatToAdapt: [
      'Enterprise trust badge placement',
      'Metric-per-feature card format',
      'Rich testimonial presentation',
    ],
    whatToAvoid: [
      'Video auto-play increases bandwidth and CLS',
      'Heavy animations affect mobile performance',
    ],
  },
];

export const sectionRecommendations: SectionRecommendation[] = [
  {
    section: 'Hero',
    direction: 'Bold headline with animated gradient text, mesh background, floating orbs, and CTA buttons with glow effects. Show document type previews (resume, presentation, CV, letter) as visual proof.',
    references: ['Copy.ai', 'Grammarly', 'OpenAI ChatGPT', 'Figma AI'],
    keyTakeaway: 'Single clear CTA + visual product demo above fold. Mesh gradient background adds depth without performance cost.',
  },
  {
    section: 'Features Showcase / Detailed Features',
    direction: 'Color-coded card themes (coral, sky, mint, lavender) with consistent iconography. Staggered scroll reveal with 80ms delay increments. Each card has one clear metric badge.',
    references: ['Jasper.ai', 'Notion AI', 'Canva', 'Figma AI'],
    keyTakeaway: 'Theme cards with metrics build credibility. Staggered reveals create visual rhythm without overwhelming.',
  },
  {
    section: 'Testimonials Carousel',
    direction: 'Auto-sliding carousel with avatar, name, title, company, verified badge, and star rating. Navigation buttons with pagination dots. Social proof pills above carousel.',
    references: ['Jasper.ai', 'Synthesia', 'Copy.ai'],
    keyTakeaway: 'Real photos + verified badges + specific ratings maximize trust. Keep testimonials to 1-2 sentences.',
  },
  {
    section: 'Trust & Social Proof',
    direction: 'Trust badge in hero (#1 AI Document Creator), social proof pills (4.9/5 Rating, 10K+ Users), stat counters with live animation (50K+, 30s, 99%), enterprise trust bar in hero.',
    references: ['Jasper.ai', 'Grammarly', 'Synthesia', 'Perplexity'],
    keyTakeaway: 'Layer trust signals throughout: hero badge, stat cards, social proof pills, enterprise logos.',
  },
  {
    section: 'CTA Buttons',
    direction: 'Two-button layout: primary bolt-gradient (Start Creating Now) with arrow icon and glow, secondary red-to-black gradient (Watch Demo) with star icon. Both have hover scale + glow effects.',
    references: ['Copy.ai', 'Notion AI', 'Grammarly'],
    keyTakeaway: 'Primary + secondary CTA gives users choice. Primary should be visually dominant. Avoid more than 2 CTAs per section.',
  },
  {
    section: 'Navigation',
    direction: 'Fixed top nav with logo, primary actions (document types), auth buttons (Sign In / Get Started). Glass-effect background with backdrop blur.',
    references: ['Grammarly', 'OpenAI ChatGPT', 'Claude'],
    keyTakeaway: 'Minimal nav + glass effect. Max 5-6 items. Primary action button in nav matches hero CTA style.',
  },
];

export const directionRecommendation = {
  verdict: 'Current DraftDeckAI landing page aligns well with industry benchmarks. Strengths: mesh gradients, stat counters, theme cards, testimonial carousel, trust badges.',
  gaps: [
    'Hero lacks product preview — add document type icons or mini template preview',
    'No comparison-based feature framing — add before/after snippets',
    'Enterprise trust logos are generic text rather than recognizable brand marks',
    'Auto-playing animations (floating orbs, pulse) should respect reduced-motion more strictly',
  ],
  priority: [
    'Add document template previews to hero section (P1)',
    'Replace text-based trust bar with recognizable brand logos (P2)',
    'Add before/after comparison cards to features section (P2)',
    'Add role-based sub-navigation in features (P3)',
  ],
  brandAlignment: 'Keep warm cream + professional blue palette (light) and ultra-dark #131010 (dark). Maintain Poppins typography. Preserve rounded card aesthetics. The brand voice should feel professional-yet-approachable — not too playful like Notion, not too sterile like Grammarly.',
} as const;

export const auditDate = '2026-05-23';
