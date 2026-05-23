export const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;
export type BreakpointRange = 'mobile' | 'tablet' | 'desktop';

export const ranges: Record<BreakpointRange, { min: number; max: number; label: string }> = {
  mobile: { min: 0, max: breakpoints.sm - 1, label: 'Mobile (< 640px)' },
  tablet: { min: breakpoints.sm, max: breakpoints.lg - 1, label: 'Tablet (640-1023px)' },
  desktop: { min: breakpoints.lg, max: Infinity, label: 'Desktop (1024px+)' },
};

export function getRange(width: number): BreakpointRange {
  if (width < breakpoints.sm) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  return 'desktop';
}

export const sectionSpacing = {
  mobile: { py: 'py-12', px: 'px-4', gap: 'gap-6' },
  tablet: { py: 'py-20', px: 'px-6', gap: 'gap-8' },
  desktop: { py: 'py-28', px: 'px-8', gap: 'gap-10' },
};

export const gridCols = {
  mobile: 'grid-cols-1',
  tablet: 'sm:grid-cols-2',
  desktop: 'lg:grid-cols-3',
} as const;

export const containerPadding = 'px-4 sm:px-6 lg:px-8';
export const sectionPadding = 'py-12 sm:py-20 lg:py-28 xl:py-36';
export const headingSizes = 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl';

export const touchTarget = 'min-h-[44px] min-w-[44px]';
export const touchTargetLg = 'min-h-[48px] min-w-[48px]';
