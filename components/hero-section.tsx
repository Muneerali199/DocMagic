import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Star, Wand2 } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      <div className="absolute inset-0 mesh-gradient-alt opacity-20"></div>
      
      {/* Animated colorful floating orbs */}
      <div className="floating-orb w-48 h-48 sm:w-72 sm:h-72 sunset-gradient opacity-25 top-10 -left-24 sm:-left-36 animate-float-gentle will-change-transform"></div>
      <div className="floating-orb w-64 h-64 sm:w-96 sm:h-96 ocean-gradient opacity-20 -top-20 -right-32 sm:-right-48 animate-glow-pulse will-change-transform"></div>
      <div className="floating-orb w-40 h-40 sm:w-64 sm:h-64 forest-gradient opacity-30 bottom-10 left-1/4 sm:left-1/3 animate-float-gentle will-change-transform" style={{animationDelay: '2s'}}></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 cosmic-gradient opacity-25 top-1/3 right-1/4 animate-glow-pulse will-change-transform" style={{animationDelay: '1s'}}></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Enhanced Animated Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full gradient-border mb-6 sm:mb-8 shimmer relative animate-bounce-in will-change-transform">
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-text-glow" style={{animation: 'sparkle 2s ease-in-out infinite'}} />
              <span className="text-xs sm:text-sm font-medium bolt-gradient-text">AI-Powered Document Magic</span>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" style={{animation: 'color-dance 3s ease-in-out infinite'}} />
            </div>
          </div>
          
          {/* Animated modern main heading */}
          <h1 className="modern-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6 sm:mb-8 animate-slide-in-left will-change-transform">
            Create professional documents with{" "}
            <span className="bolt-gradient-text relative inline-block">
              AI Magic
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                <Wand2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 animate-bounce" />
              </div>
            </span>
          </h1>
          
          {/* Animated Modern Professional Subtitle */}
          <p className="modern-body mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0 animate-slide-in-right delay-200 will-change-opacity">
            Transform your ideas into polished{" "}
            <span className="font-semibold hover:text-amber-600 transition-colors" style={{color: '#f59e0b'}}>resumes</span>,{" "}
            <span className="font-semibold hover:text-blue-600 transition-colors" style={{color: '#2563eb'}}>presentations</span>,{" "}
            <span className="font-semibold hover:text-emerald-600 transition-colors" style={{color: '#059669'}}>CVs</span>, and{" "}
            <span className="font-semibold hover:text-purple-600 transition-colors" style={{color: '#7c3aed'}}>letters</span>{" "}
            in seconds with our cutting-edge AI platform.
          </p>
          
          {/* Animated CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 px-4 sm:px-0 animate-scale-in delay-400 will-change-transform">
            <Button 
              asChild 
              size="lg" 
              className="bolt-gradient text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:scale-105 transition-all duration-300 bolt-glow w-full sm:w-auto relative overflow-hidden"
              style={{animation: 'gradient-shift 4s ease infinite'}}
            >
              <Link href="#document-types" className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Start Creating Magic</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="gradient-border px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:scale-105 transition-all duration-300 w-full sm:w-auto relative"
            >
              <Link href="#how-it-works" className="flex items-center justify-center gap-2">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="text-sm sm:text-base">See How It Works</span>
              </Link>
            </Button>
          </div>
          
          {/* Animated Professional Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
            <div className="card-coral hover-coral p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 sunset-glow animate-scale-in delay-600 will-change-transform">
              <div className="bolt-gradient-text text-2xl sm:text-3xl font-bold animate-text-glow">10K+</div>
              <div className="text-muted-foreground text-sm sm:text-base">Documents Created</div>
            </div>
            <div className="card-sky hover-sky p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 bolt-glow animate-scale-in delay-700 will-change-transform">
              <div className="bolt-gradient-text text-2xl sm:text-3xl font-bold animate-text-glow">98%</div>
              <div className="text-muted-foreground text-sm sm:text-base">Success Rate</div>
            </div>
            <div className="card-mint hover-mint p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 ocean-glow animate-scale-in delay-800 will-change-transform">
              <div className="bolt-gradient-text text-2xl sm:text-3xl font-bold animate-text-glow">5★</div>
              <div className="text-muted-foreground text-sm sm:text-base">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}