'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

type Position = { x: number; y: number };

interface CursorHookOptions {
  trailSpeed?: number;
  disabled?: boolean;
  hoverScale?: number;
}

export function useTrailingCursor({
  trailSpeed = 0.15,
  disabled = false,
  hoverScale = 1.5,
}: CursorHookOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mousePosition = useRef<Position>({ x: 0, y: 0 });
  const trailPosition = useRef<Position>({ x: 0, y: 0 });
  const animationId = useRef<number>();

  const checkMobile = useCallback(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth < 768;
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    setIsMobile(isTouch || isSmall || isMobileUA);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePosition.current = { x: e.clientX, y: e.clientY };
    if (!isVisible) {
      setIsVisible(true);
      trailPosition.current = { x: e.clientX, y: e.clientY };
    }
    if (!animationId.current) {
      animationId.current = requestAnimationFrame(animate);
    }
  }, [isVisible]);

  const handleMouseLeave = () => setIsVisible(false);

  const handleMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const selector = 'a, button, input, textarea, select, [role="button"], [tabindex], .cursor-pointer, [data-interactive]';
    if (target.matches(selector) || target.closest(selector)) setIsHovering(true);
  }, []);

  const handleMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const selector = 'a, button, input, textarea, select, [role="button"], [tabindex], .cursor-pointer, [data-interactive]';
    if (target.matches(selector) || target.closest(selector)) setIsHovering(false);
  }, []);

  const animate = useCallback(() => {
    if (disabled || isMobile) return;

    trailPosition.current.x += (mousePosition.current.x - trailPosition.current.x) * trailSpeed;
    trailPosition.current.y += (mousePosition.current.y - trailPosition.current.y) * trailSpeed;

    animationId.current = requestAnimationFrame(animate);
  }, [disabled, isMobile, trailSpeed]);

  useEffect(() => {
    if (disabled || isMobile) return;

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (animationId.current) cancelAnimationFrame(animationId.current);
    };
  }, [disabled, isMobile, handleMouseMove, handleMouseOver, handleMouseOut]);

  return {
    isVisible: isVisible && !disabled && !isMobile,
    isHovering,
    isMobile,
    mousePosition: mousePosition.current,
    trailPosition: trailPosition.current,
    hoverScale,
  };
}
