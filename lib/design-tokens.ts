export const colors = {
  // Light mode (base #F3E9DC)
  light: {
    background: 'hsl(30, 56%, 91%)',
    foreground: 'hsl(210, 11%, 15%)',
    card: 'hsl(30, 56%, 96%)',
    'card-foreground': 'hsl(210, 11%, 15%)',
    popover: 'hsl(30, 56%, 96%)',
    'popover-foreground': 'hsl(210, 11%, 15%)',
    primary: 'hsl(210, 11%, 15%)',
    'primary-foreground': 'hsl(30, 56%, 91%)',
    secondary: 'hsl(30, 56%, 85%)',
    'secondary-foreground': 'hsl(210, 11%, 15%)',
    muted: 'hsl(30, 56%, 85%)',
    'muted-foreground': 'hsl(210, 8%, 45%)',
    accent: 'hsl(30, 56%, 80%)',
    'accent-foreground': 'hsl(210, 11%, 15%)',
    destructive: 'hsl(0, 84%, 60%)',
    ring: 'hsl(210, 11%, 15%)',
    border: 'hsl(30, 40%, 80%)',
    input: 'hsl(30, 40%, 80%)',
    chart: {
      1: 'hsl(210, 70%, 50%)',
      2: 'hsl(195, 60%, 45%)',
      3: 'hsl(160, 50%, 40%)',
      4: 'hsl(45, 70%, 55%)',
      5: 'hsl(25, 60%, 50%)',
    },
  },

  // Dark mode (base #131010)
  dark: {
    background: 'hsl(0, 0%, 7%)',
    foreground: 'hsl(0, 0%, 100%)',
    card: 'hsl(0, 0%, 12%)',
    'card-foreground': 'hsl(0, 0%, 100%)',
    popover: 'hsl(0, 0%, 12%)',
    'popover-foreground': 'hsl(0, 0%, 100%)',
    primary: 'hsl(0, 0%, 100%)',
    'primary-foreground': 'hsl(0, 0%, 7%)',
    secondary: 'hsl(0, 0%, 18%)',
    'secondary-foreground': 'hsl(0, 0%, 100%)',
    muted: 'hsl(0, 0%, 18%)',
    'muted-foreground': 'hsl(0, 0%, 90%)',
    accent: 'hsl(0, 0%, 25%)',
    'accent-foreground': 'hsl(0, 0%, 100%)',
    destructive: 'hsl(0, 85%, 70%)',
    ring: 'hsl(0, 0%, 100%)',
    border: 'hsl(0, 0%, 30%)',
    input: 'hsl(0, 0%, 25%)',
    chart: {
      1: 'hsl(210, 95%, 80%)',
      2: 'hsl(195, 85%, 75%)',
      3: 'hsl(160, 75%, 70%)',
      4: 'hsl(45, 95%, 85%)',
      5: 'hsl(25, 85%, 80%)',
    },
  },

  // Gradient presets (used in .bolt-gradient, .sunset-gradient, etc.)
  gradient: {
    bolt: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #1e40af 50%, #1e3a8a 75%, #312e81 100%)',
    sunset: 'linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #b45309 50%, #92400e 75%, #78350f 100%)',
    ocean: 'linear-gradient(135deg, #0891b2 0%, #0e7490 25%, #155e75 50%, #164e63 75%, #083344 100%)',
    forest: 'linear-gradient(135deg, #059669 0%, #047857 25%, #065f46 50%, #064e3b 75%, #022c22 100%)',
    cosmic: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 25%, #5b21b6 50%, #4c1d95 75%, #3730a3 100%)',
  },

  // Gradient text variants (animated)
  gradientText: {
    bolt: 'linear-gradient(135deg, #2563eb 0%, #ff0000 25%, #1e40af 50%, #1e3a8a 75%, #312e81 100%)',
    sunset: 'linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #b45309 50%, #92400e 75%, #78350f 100%)',
    forest: 'linear-gradient(135deg, #059669 0%, #047857 25%, #065f46 50%, #064e3b 75%, #022c22 100%)',
    ocean: 'linear-gradient(135deg, #0891b2 0%, #0e7490 25%, #155e75 50%, #164e63 75%, #083344 100%)',
    cosmic: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 25%, #5b21b6 50%, #4c1d95 75%, #312e81 100%)',
  },

  // Semantic badge/pill colors
  badge: {
    coral: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)', text: '#d97706' },
    mint: { bg: 'rgba(5, 150, 105, 0.08)', border: 'rgba(5, 150, 105, 0.15)', text: '#047857' },
    sky: { bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.15)', text: '#1d4ed8' },
    lavender: { bg: 'rgba(124, 58, 237, 0.08)', border: 'rgba(124, 58, 237, 0.15)', text: '#6d28d9' },
  },
} as const;

export const typography = {
  family: {
    sans: 'var(--font-poppins), system-ui, sans-serif',
    heading: 'var(--font-poppins), system-ui, sans-serif',
    body: 'var(--font-poppins), system-ui, sans-serif',
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
  lineHeight: {
    tight: '1.15',
    normal: '1.5',
    relaxed: '1.7',
  },
  letterSpacing: {
    tight: '-0.04em',
    normal: '-0.02em',
    wide: '-0.01em',
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
} as const;

export const borderRadius = {
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)',
  lg: 'var(--radius)',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.15)',
  glow: {
    bolt: '0 0 20px rgba(37, 99, 235, 0.3), 0 0 40px rgba(29, 78, 216, 0.2), 0 0 60px rgba(30, 64, 175, 0.1)',
    sunset: '0 0 20px rgba(245, 158, 11, 0.3), 0 0 40px rgba(217, 119, 6, 0.2), 0 0 60px rgba(180, 83, 9, 0.1)',
    ocean: '0 0 20px rgba(8, 145, 178, 0.3), 0 0 40px rgba(14, 116, 144, 0.2), 0 0 60px rgba(21, 94, 117, 0.1)',
  },
  dark: {
    sm: '0 4px 16px rgba(0, 0, 0, 0.2)',
    md: '0 8px 32px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 48px rgba(0, 0, 0, 0.4)',
  },
} as const;

export const zIndex = {
  dropdown: 50,
  sticky: 40,
  modal: 1000,
  toast: 9999,
  cursor: 9998,
  floatingOrb: 0,
  content: 10,
} as const;

export const opacity = {
  subtle: 0.08,
  light: 0.15,
  medium: 0.3,
  strong: 0.5,
  glass: 0.95,
} as const;

export const backdropBlur = {
  sm: '8px',
  md: '12px',
  lg: '24px',
  xl: '32px',
} as const;
