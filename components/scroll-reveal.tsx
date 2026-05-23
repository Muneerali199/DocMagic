'use client';

import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { type ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'scale-in';
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
}

const animationClassMap = {
  'fade-in-up': 'scroll-fade-in-up',
  'fade-in-down': 'scroll-fade-in-down',
  'fade-in-left': 'scroll-fade-in-left',
  'fade-in-right': 'scroll-fade-in-right',
  'scale-in': 'scroll-scale-in',
};

export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-in-up',
  delay = 0,
  threshold = 0.1,
  triggerOnce = true,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold,
    triggerOnce,
  });

  const animClass = animationClassMap[animation];
  const delayStyle = delay ? { animationDelay: \\ms\ } : undefined;

  return (
    <div
      ref={ref}
      className={\\ \\}
      style={delayStyle}
    >
      {children}
    </div>
  );
}
