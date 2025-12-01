"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, Edit3, Download, Share2 } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface GammaStyleViewerProps {
  slides: any[];
  template: string;
  onExportPDF?: () => void;
  onExportPPTX?: () => void;
  onShare?: () => void;
  allowEditing?: boolean;
}

export function GammaStyleViewer({
  slides,
  template,
  onExportPDF,
  onExportPPTX,
  onShare,
  allowEditing = true
}: GammaStyleViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Scroll to slide
  const scrollToSlide = (index: number) => {
    const slideElement = document.getElementById(`gamma-slide-${index}`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSlide(index);
    }
  };

  // Handle scroll to update current slide
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      slides.forEach((_, index) => {
        const slideElement = document.getElementById(`gamma-slide-${index}`);
        if (slideElement) {
          const rect = slideElement.getBoundingClientRect();
          const slideTop = rect.top + window.scrollY;
          const slideBottom = slideTop + rect.height;
          
          if (scrollPosition >= slideTop && scrollPosition < slideBottom) {
            setCurrentSlide(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (currentSlide < slides.length - 1) {
          scrollToSlide(currentSlide + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentSlide > 0) {
          scrollToSlide(currentSlide - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  const getTemplateStyles = (template: string) => {
    const isDark = theme === 'dark';
    
    const styles = {
      'modern-business': {
        bg: isDark ? 'bg-gradient-to-br from-blue-950 to-slate-900' : 'bg-gradient-to-br from-blue-50 to-white',
        text: isDark ? 'text-blue-100' : 'text-blue-900',
        accent: isDark ? 'text-blue-400' : 'text-blue-600',
      },
      'creative-gradient': {
        bg: isDark ? 'bg-gradient-to-br from-purple-950 via-pink-950 to-orange-950' : 'bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50',
        text: isDark ? 'text-purple-100' : 'text-purple-900',
        accent: isDark ? 'text-purple-400' : 'text-purple-600',
      },
      'minimalist-pro': {
        bg: isDark ? 'bg-gradient-to-br from-gray-900 to-slate-900' : 'bg-gradient-to-br from-gray-50 to-white',
        text: isDark ? 'text-gray-100' : 'text-gray-800',
        accent: isDark ? 'text-gray-400' : 'text-gray-600',
      },
    };

    return styles[template as keyof typeof styles] || styles['modern-business'];
  };

  const renderSlide = (slide: any, index: number) => {
    const templateStyles = getTemplateStyles(template);
    const isCover = index === 0;

    return (
      <div
        id={`gamma-slide-${index}`}
        key={index}
        className={cn(
          "min-h-screen w-full flex items-center justify-center snap-start scroll-mt-0 relative",
          templateStyles.bg,
          templateStyles.text
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isCover ? (
            // Cover Slide - Hero Style
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              <div className="space-y-8">
                <h1 className={cn("text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight", templateStyles.accent)}>
                  {slide.title}
                </h1>
                {slide.content && (
                  <p className="text-xl sm:text-2xl lg:text-3xl opacity-90 leading-relaxed">
                    {slide.content}
                  </p>
                )}
              </div>
              {slide.image && (
                <div className="relative h-96 lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ) : (
            // Content Slides - Split Layout
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center max-w-7xl mx-auto">
              <div className="lg:col-span-3 space-y-6">
                <h2 className={cn("text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight", templateStyles.accent)}>
                  {slide.title}
                </h2>
                {slide.content && (
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed opacity-90">
                    {slide.content}
                  </p>
                )}
                {slide.bullets && slide.bullets.length > 0 && (
                  <ul className="space-y-4 text-base sm:text-lg lg:text-xl">
                    {slide.bullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm shadow-lg",
                          templateStyles.accent.replace('text-', 'bg-')
                        )}>
                          {i + 1}
                        </div>
                        <span className="leading-relaxed pt-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {slide.image && (
                <div className="lg:col-span-2 relative h-80 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slide Number Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-8 bg-yellow-400" : "w-2 bg-gray-400 hover:bg-gray-300"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Floating Action Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-full px-4 py-2 shadow-xl border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentSlide + 1} / {slides.length}
        </span>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        {onExportPDF && (
          <Button size="sm" variant="ghost" onClick={onExportPDF} className="rounded-full">
            <Download className="h-4 w-4" />
          </Button>
        )}
        {onExportPPTX && (
          <Button size="sm" variant="ghost" onClick={onExportPPTX} className="rounded-full">
            <Download className="h-4 w-4" />
          </Button>
        )}
        {onShare && (
          <Button size="sm" variant="ghost" onClick={onShare} className="rounded-full">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation Hints */}
      {currentSlide > 0 && (
        <button
          onClick={() => scrollToSlide(currentSlide - 1)}
          className="fixed top-1/2 left-4 transform -translate-y-1/2 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-full p-3 shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
          aria-label="Previous slide"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
      
      {currentSlide < slides.length - 1 && (
        <button
          onClick={() => scrollToSlide(currentSlide + 1)}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-full p-3 shadow-xl border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform animate-bounce"
          aria-label="Next slide"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      )}

      {/* Slides */}
      <div className="snap-y snap-mandatory">
        {slides.map((slide, index) => renderSlide(slide, index))}
      </div>
    </div>
  );
}
