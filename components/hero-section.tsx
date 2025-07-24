import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-background py-16 sm:py-24 lg:py-32"
      data-scroll-section
    >
      {/* Background elements */}
      <div className="absolute inset-0 aurora-borealis opacity-20"></div>
      <div className="absolute inset-0 mesh-gradient-alt opacity-10"></div>
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      <div className="absolute inset-0 mesh-gradient-alt opacity-20"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full gradient-border mb-6 sm:mb-8 subtle-shimmer relative animate-fade-in-down will-change-transform">
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm sm:text-base text-primary">
                Welcome to DocMagic
              </span>
            </div>
          </div>

          {/* Main heading */}
          <h1
            className="modern-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6 sm:mb-8 animate-slide-in-left will-change-transform text-shadow-professional"
          >
            Build Documentation Effortlessly
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in delay-200">
            A next-generation platform to create, manage, and share beautiful project documentation with ease.
          </p>
        </div>
      </div>
    </section>
  );
}
