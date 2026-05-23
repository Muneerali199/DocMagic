export type WCAGLevel = 'A' | 'AA' | 'AAA';
export type ComplianceStatus = 'pass' | 'fail' | 'needs-review' | 'not-applicable';

export interface WCAGCheck {
  criteria: string;
  level: WCAGLevel;
  description: string;
  status: ComplianceStatus;
  notes: string;
}

export interface ComponentA11y {
  component: string;
  checks: WCAGCheck[];
}

export const globalChecks: WCAGCheck[] = [
  { criteria: '1.1.1 Non-text Content', level: 'A', description: 'All images have alt text', status: 'pass', notes: 'Avatar images use alt={testimonial.name}. Decorative orbs have no alt (correct). Icons use aria-hidden.' },
  { criteria: '1.4.1 Use of Color', level: 'A', description: 'Color is not the only way to convey info', status: 'needs-review', notes: 'Gradient text (bolt-gradient-text) relies on color alone. Ensure meaning is also conveyed via text content.' },
  { criteria: '1.4.3 Contrast (Minimum)', level: 'AA', description: 'Text contrast ratio >= 4.5:1', status: 'needs-review', notes: 'bolt-gradient-text uses #ff0000 which fails contrast on light bg. Badge colors on glass-effect need verification.' },
  { criteria: '1.4.4 Resize Text', level: 'AA', description: 'Text can be zoomed to 200% without loss', status: 'pass', notes: 'All sizes use rem units. No fixed-size containers that clip text.' },
  { criteria: '1.4.10 Reflow', level: 'AA', description: 'Content reflows without scroll at 400% zoom', status: 'pass', notes: 'Responsive breakpoints handle reflow. Grids collapse to single column on mobile.' },
  { criteria: '2.1.1 Keyboard', level: 'A', description: 'All functionality via keyboard', status: 'needs-review', notes: 'Interactive elements use <button> and <a> tags. Testimonial carousel auto-slide may interfere. Pagination dots are buttons.' },
  { criteria: '2.4.1 Bypass Blocks', level: 'A', description: 'Skip-to-content link provided', status: 'fail', notes: 'No skip-to-content link exists. Must add one at the top of page.tsx.' },
  { criteria: '2.4.3 Focus Order', level: 'A', description: 'Focus order follows logical sequence', status: 'needs-review', notes: 'DOM order matches visual order. Need to verify tab sequence through carousel.' },
  { criteria: '2.4.6 Headings and Labels', level: 'AA', description: 'Descriptive headings and labels', status: 'needs-review', notes: 'Pages use h1→h2→h3 hierarchy. Testimonial names are <p> elements - consider <h3> for name.' },
  { criteria: '2.5.3 Label in Name', level: 'A', description: 'Visible label matches accessible name', status: 'pass', notes: 'CTA buttons have matching visible text and aria-label.' },
  { criteria: '4.1.2 Name, Role, Value', level: 'A', description: 'Interactive elements expose name and role', status: 'pass', notes: 'All buttons/links have text content or aria-label. Sections use semantic HTML.' },
];

export const componentChecks: ComponentA11y[] = [
  {
    component: 'HeroSection',
    checks: [
      { criteria: '1.1.1', level: 'A', description: 'Decorative backgrounds hidden from screen readers', status: 'pass', notes: 'Floating orbs and mesh gradients are divs with no semantic meaning.' },
      { criteria: '1.4.3', level: 'AA', description: 'Gradient heading text contrast', status: 'needs-review', notes: 'bolt-gradient-text on heading contains #ff0000 step - low contrast on light background.' },
      { criteria: '2.4.6', level: 'AA', description: 'Main heading is h1', status: 'pass', notes: 'Hero uses h1 element for the main heading.' },
      { criteria: '4.1.2', level: 'A', description: 'CTA buttons have accessible names', status: 'pass', notes: 'Start Creating Now and Watch Demo buttons have aria-label and visible text.' },
    ],
  },
  {
    component: 'FeaturesSection',
    checks: [
      { criteria: '1.1.1', level: 'A', description: 'Icons are decorative', status: 'pass', notes: 'Icons use lucide-react with aria-hidden set by default.' },
      { criteria: '1.4.1', level: 'A', description: 'Feature themes not color-dependent', status: 'needs-review', notes: 'Card themes (coral, sky, mint, lavender) use color + border + gradient. Meaning is primarily in text content.' },
      { criteria: '2.4.6', level: 'AA', description: 'Heading hierarchy: h2 for section, h3 for cards', status: 'pass', notes: 'Section uses h2, feature names use h3.' },
      { criteria: '2.5.3', level: 'A', description: 'Feature card interactions', status: 'pass', notes: 'Cards are not interactive (no click). They display info only. Bottom CTA pill uses inline-flex.' },
    ],
  },
  {
    component: 'TestimonialsSection',
    checks: [
      { criteria: '1.1.1', level: 'A', description: 'Avatar images have alt text', status: 'pass', notes: 'AvatarImage uses alt={testimonial.name}.' },
      { criteria: '1.3.1', level: 'A', description: 'Carousel structure', status: 'needs-review', notes: 'Non-visible slides use translate-x-full/-translate-x-full but remain in DOM. Should use aria-hidden=true on non-active slides.' },
      { criteria: '2.1.1', level: 'A', description: 'Carousel keyboard navigation', status: 'pass', notes: 'Previous/Next buttons are <button> elements. Pagination dots are <button> elements. Keyboard accessible.' },
      { criteria: '2.2.2', level: 'A', description: 'Auto-sliding can be paused', status: 'needs-review', notes: 'Auto-slide runs every 5s with no pause mechanism. Should respect prefers-reduced-motion.' },
      { criteria: '4.1.2', level: 'A', description: 'Live region for dynamic content', status: 'fail', notes: 'Testimonial content changes without announcement. Should use aria-live="polite" on the carousel container.' },
    ],
  },
];

export const reducedMotionChecklist = [
  'All CSS keyframe animations wrapped in @media (prefers-reduced-motion: reduce)',
  'Scroll-triggered reveal animations disabled when reduced-motion preferred',
  'Auto-sliding carousels paused when reduced-motion preferred',
  'Hover/focus transitions degraded gracefully: transform and opacity only, no complex animations',
  'Pulsing/shimmer animations disabled',
  'No parallax or scroll-driven animations',
  'Testimonial carousel manual navigation still works when auto-slide disabled',
];

export const focusVisibilityChecklist = [
  'All interactive elements have visible focus ring',
  'Focus ring uses 2px offset for high visibility',
  'Focus ring color has >= 3:1 contrast against adjacent colors',
  'Custom focus styles used instead of browser defaults',
  'Focus indicators visible in both light and dark mode',
  'Touch/click interactions do not trap focus',
];

export const contrastRatios = {
  'bolt-gradient-text #ff0000 on #F3E9DC': '~2.5:1 (FAIL WCAG AA)',
  'bolt-gradient-text #2563eb on #F3E9DC': '~3.8:1 (FAIL WCAG AA for normal text)',
  'bolt-gradient-text #2563eb on #131010': '~4.8:1 (PASS WCAG AA)',
  'text-muted-foreground light (#6B7280) on #F3E9DC': '~3.5:1 (FAIL WCAG AA)',
  'text-muted-foreground dark (#E5E7EB) on #131010': '~9:1 (PASS WCAG AA)',
  'bolt-gradient-text dark (#818CF8) on #131010': '~5.5:1 (PASS WCAG AA)',
  'bolt-gradient-text dark (#60A5FA) on #131010': '~4.5:1 (PASS WCAG AA)',
  'bolt-gradient-text dark (#34D399) on #131010': '~5.2:1 (PASS WCAG AA)',
  'bolt-gradient-text dark (#FBBF24) on #131010': '~6.8:1 (PASS WCAG AA)',
  'bolt-gradient-text dark (#F472B6) on #131010': '~4.2:1 (PASS WCAG AA)',
};

export const recommendations = [
  { priority: 'P0', item: 'Add skip-to-content link at top of page.tsx', criteria: '2.4.1' },
  { priority: 'P0', item: 'Fix #ff0000 in bolt-gradient-text — replace with higher-contrast amber (#f59e0b)', criteria: '1.4.3' },
  { priority: 'P1', item: 'Add aria-live="polite" to testimonial carousel wrapper', criteria: '4.1.2' },
  { priority: 'P1', item: 'Set aria-hidden=true on non-visible testimonial slides', criteria: '1.3.1' },
  { priority: 'P1', item: 'Stop auto-slide when prefers-reduced-motion is active', criteria: '2.2.2' },
  { priority: 'P2', item: 'Add role="region" with aria-label to each landing section', criteria: '4.1.2' },
  { priority: 'P2', item: 'Wrap reduced-motion media query to cover all custom animations', criteria: '2.2.2' },
  { priority: 'P3', item: 'Verify all gradient text has contrast >= 3:1 against common backgrounds', criteria: '1.4.3' },
  { priority: 'P3', item: 'Add aria-describedby to stat counters for context', criteria: '4.1.2' },
];
