"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { CursorPosition, CursorHookOptions } from "@/types/cursor";
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

  const mousePosition = useRef<CursorPosition>({ x: 0, y: 0 });
  const trailPosition = useRef<CursorPosition>({ x: 0, y: 0 });
  const animationId = useRef<number | null>(null);

  // Mobile detection
  const checkMobile = useCallback(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmall = window.innerWidth < 768;
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    setIsMobile(isTouch || isSmall || isMobileUA);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  // Mouse movement
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

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Hover detection
  const interactiveSelectors =
    'a, button, input, textarea, select, [role="button"], [tabindex], .cursor-pointer, [data-interactive]';

  const handleMouseOver = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.matches(interactiveSelectors) || target.closest(interactiveSelectors)) {
      setIsHovering(true);
    }
  }, []);

  const handleMouseOut = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    if (target.matches(interactiveSelectors) || target.closest(interactiveSelectors)) {
      setIsHovering(false);
    }
  }, []);

  // Event listeners
  useEffect(() => {
    if (disabled || isMobile) return;

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [disabled, isMobile, handleMouseMove, handleMouseLeave, handleMouseOver, handleMouseOut]);

  // Animation loop
  const animate = useCallback(() => {
    if (disabled || isMobile) return;

    const easing = trailSpeed;
    trailPosition.current.x += (mousePosition.current.x - trailPosition.current.x) * easing;
    trailPosition.current.y += (mousePosition.current.y - trailPosition.current.y) * easing;

    animationId.current = requestAnimationFrame(animate); // smoother loop
  }, [disabled, isMobile, trailSpeed]);

  useEffect(() => {
    if (disabled || isMobile) return;

    animationId.current = requestAnimationFrame(animate);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
        animationId.current = null;
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
