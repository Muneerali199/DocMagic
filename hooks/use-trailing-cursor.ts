"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CursorPosition, CursorHookOptions } from "@/types/cursor";

export function useTrailingCursor({
  trailSpeed = 0.15,
  disabled = false,
  hoverScale = 1.5,
}: CursorHookOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mousePosition = useRef<CursorPosition>({ x: 0, y: 0 });
  const trailPosition = useRef<CursorPosition>({ x: 0, y: 0 });
  const animationId = useRef<number>();

  // Check if device is mobile/touch
  const checkMobile = useCallback(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth < 768;
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    setIsMobile(isTouchDevice || isSmallScreen || isMobileUA);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePosition.current = { x: e.clientX, y: e.clientY };
    
    if (!isVisible) {
      setIsVisible(true);
      trailPosition.current = { x: e.clientX, y: e.clientY };
    }
  }, [isVisible]);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Hover detection
  const handleMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const interactiveSelectors = [
      'a', 'button', 'input', 'textarea', 'select',
      '[role="button"]', '[tabindex]', '.cursor-pointer',
      '[data-interactive]'
    ].join(', ');
    
    if (target.matches(interactiveSelectors) || target.closest(interactiveSelectors)) {
      setIsHovering(true);
    }
  }, []);

  const handleMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const interactiveSelectors = [
      'a', 'button', 'input', 'textarea', 'select',
      '[role="button"]', '[tabindex]', '.cursor-pointer',
      '[data-interactive]'
    ].join(', ');
    
    if (target.matches(interactiveSelectors) || target.closest(interactiveSelectors)) {
      setIsHovering(false);
    }
  }, []);

  // Setup event listeners
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
    };
  }, [disabled, isMobile, handleMouseMove, handleMouseLeave, handleMouseOver, handleMouseOut]);

  // Animation loop with performance optimizations
  const animate = useCallback(() => {
    if (disabled || isMobile) return;

    // Use easing for smooth trailing effect
    const easing = trailSpeed;
    trailPosition.current.x += (mousePosition.current.x - trailPosition.current.x) * easing;
    trailPosition.current.y += (mousePosition.current.y - trailPosition.current.y) * easing;

    // Only continue animation if there's significant movement
    const deltaX = Math.abs(mousePosition.current.x - trailPosition.current.x);
    const deltaY = Math.abs(mousePosition.current.y - trailPosition.current.y);
    
    if (deltaX > 0.1 || deltaY > 0.1) {
      animationId.current = requestAnimationFrame(animate);
    }
  }, [disabled, isMobile, trailSpeed]);

  useEffect(() => {
    if (disabled || isMobile) return;

    animate();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [animate, disabled, isMobile]);

  return {
    isVisible: isVisible && !disabled && !isMobile,
    isHovering,
    isMobile,
    mousePosition: mousePosition.current,
    trailPosition: trailPosition.current,
    hoverScale,
  };
}