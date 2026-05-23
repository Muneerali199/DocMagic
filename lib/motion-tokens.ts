export const motion = {
  duration: {
    micro: 150,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1200,
  } as const,

  easing: {
    default: [0.4, 0, 0.2, 1] as [number, number, number, number],
    in: [0.4, 0, 1, 1] as [number, number, number, number],
    out: [0, 0, 0.2, 1] as [number, number, number, number],
    'in-out': [0.4, 0, 0.2, 1] as [number, number, number, number],
    spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  } as const,

  transition: {
    micro: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '300ms cubic-bezier(0, 0, 0.2, 1)',
    expressive: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    enter: '800ms cubic-bezier(0, 0, 0.2, 1)',
  } as const,

  css: {
    '--duration-micro': '150ms',
    '--duration-fast': '200ms',
    '--duration-normal': '300ms',
    '--duration-slow': '500ms',
    '--duration-slower': '800ms',
    '--duration-slowest': '1200ms',
    '--easing-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
    '--easing-out': 'cubic-bezier(0, 0, 0.2, 1)',
    '--easing-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    '--easing-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  } as Record<string, string>,
} as const;

export const variants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  staggerChildren: {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  },
} as const;

export type MotionToken = keyof typeof motion.duration;
