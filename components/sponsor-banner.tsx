"use client";

import { Sparkles, Zap, Star } from "lucide-react";
import Link from "next/link";

export function SponsorBanner() {
  return (
    <div className="sponsor-banner py-2 sm:py-3 px-2 sm:px-4 text-center relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-pulse" />
          <span className="text-muted-foreground">Powered by</span>
        </div>
        
        <Link 
          href="https://teamblitz.netlify.app/" 
          target="_blank"
          className="inline-flex items-center gap-1 bolt-gradient-text font-bold hover:scale-105 transition-transform duration-200"
        >
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          <span> Team⚡Blitz</span>
        </Link>
        
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">and the</span>
          <span className="bolt-gradient-text font-semibold">opensource community</span>
          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 animate-pulse" style={{animationDelay: '0.5s'}} />
        </div>
      </div>
    </div>
  );
}