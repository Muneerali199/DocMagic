'use client';

import { ReactNode, useEffect, useRef } from "react";

import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ClientRedirects from "@/components/ClientRedirects";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Temporarily disable locomotive scroll for better performance
    // const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // const isMobile = window.innerWidth < 768;
    
    // if (!prefersReducedMotion && !isMobile) {
    //   let scroll: any;

    //   const initScroll = async () => {
    //     try {
    //       const LocomotiveScroll = (await import("locomotive-scroll")).default;
    //       scroll = new LocomotiveScroll({
    //         el: scrollRef.current!,
    //         smooth: true,
    //         lerp: 0.05,
    //         multiplier: 0.8,
    //       });
    //     } catch (error) {
    //       console.warn('Locomotive scroll failed to load, using native scrolling');
    //     }
    //   };

    //   initScroll();

    //   return () => {
    //     if (scroll) scroll.destroy();
    //   };
    // }
  }, []);

  return (
    <div data-scroll-container ref={scrollRef}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ClientRedirects />
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}
