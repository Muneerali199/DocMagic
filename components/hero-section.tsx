import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Star, Wand2 } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background dark:bg-gradient-to-b dark:from-[#131010] dark:via-[#1a1a22] dark:to-[#232336] py-16 sm:py-24 lg:py-32">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 aurora-borealis opacity-20 dark:opacity-0"></div>
      <div className="absolute inset-0 mesh-gradient-alt opacity-10 dark:opacity-0"></div>
      <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-[#232336] dark:via-[#1a1a22] dark:to-[#131010] dark:opacity-80"></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Enhanced Animated Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full gradient-border mb-6 sm:mb-8 subtle-shimmer relative animate-fade-in-down will-change-transform dark:backdrop-blur dark:bg-black/80 dark:bg-opacity-80">
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-text-glow" style={{animation: 'sparkle 2s ease-in-out infinite'}} />
              <span className="text-xs sm:text-sm font-medium bolt-gradient-text dark:ai-badge-gradient-text dark:text-white">AI-Powered Document Magic</span>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" style={{animation: 'color-dance 3s ease-in-out infinite'}} />
            </div>
          </div>
          
          {/* Animated modern main heading */}
          <h1 className="modern-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6 sm:mb-8 animate-fade-in-down delay-100 will-change-transform text-shadow-professional">
            Create professional documents with{" "}
            <span className="bolt-gradient-text relative inline-block">
              AI Magic
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 animate-bounce" />
              </div>
            </span>
          </h1>
          
          {/* Animated Modern Professional Subtitle */}
          <p className="modern-body mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0 animate-fade-in-up delay-200 will-change-opacity">
            Transform your ideas into polished{" "}
            <span className="font-semibold hover:text-amber-600 transition-colors" style={{color: '#f59e0b'}}>resumes</span>,{" "}
            <span className="font-semibold hover:text-blue-600 transition-colors" style={{color: '#2563eb'}}>presentations</span>,{" "}
            <span className="font-semibold hover:text-emerald-600 transition-colors" style={{color: '#059669'}}>CVs</span>, and{" "}
            <span className="font-semibold hover:text-purple-600 transition-colors" style={{color: '#7c3aed'}}>letters</span>{" "}
            in seconds with our cutting-edge AI platform.
          </p>
          
          {/* Animated CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 px-4 sm:px-0 animate-fade-in-up delay-300 will-change-transform">
            <Button 
              asChild 
              size="lg" 
              className="bolt-gradient text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:scale-105 transition-all duration-300 bolt-glow w-full sm:w-auto relative overflow-hidden"
              style={{animation: 'gradient-shift 4s ease infinite'}}
            >
              <Link href="#document-types" className="flex items-center justify-center gap-2 text-white">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="text-sm sm:text-base text-white">Start Creating Magic</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="gradient-border px-6 sm:px-8 py-3 sm:py-4 rounded-full w-full sm:w-auto relative text-white"
              style={{animation: 'gradient-shift 3s ease infinite'}}
            >
              <Link href="#how-it-works" className="flex items-center justify-center gap-2 text-white">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="text-sm sm:text-base text-white">See How It Works</span>
              </Link>
            </Button>
          </div>
          
          {/* Animated Professional Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
            <div className="card-coral hover-glow-coral p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 sunset-glow animate-fade-in-up delay-400 will-change-transform">
              <div className="bolt-gradient-text text-2xl sm:text-3xl font-bold animate-text-glow text-shadow-professional">10K+</div>
              <div className="text-muted-foreground text-sm sm:text-base">Documents Created</div>
            </div>
            <div className="card-sky hover-glow-sky p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 bolt-glow animate-fade-in-up delay-500 will-change-transform">
              <div className="bolt-gradient-text text-2xl sm:text-3xl font-bold animate-text-glow text-shadow-professional">98%</div>
              <div className="text-muted-foreground text-sm sm:text-base">Success Rate</div>
            </div>
            <div className="card-mint hover-glow-mint p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 ocean-glow animate-fade-in-up delay-600 will-change-transform">
              <div className="bolt-gradient-text text-2xl sm:text-3xl font-bold animate-text-glow text-shadow-professional">5★</div>
              <div className="text-muted-foreground text-sm sm:text-base">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
