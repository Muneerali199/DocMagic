import { Button } from "@/components/ui/button";
import { StatCounter } from "./ui/stat-counter";
import { TooltipWithShortcut } from "@/components/ui/tooltip";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Star, Wand2 } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-10 xs:py-14 sm:py-24 lg:py-32">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0"></div>
      <div className="absolute inset-0 mesh-gradient-alt opacity-10"></div>

      {/* Left edge orb — peeking in from the side */}
      <div className="floating-orb w-40 h-40 bolt-gradient opacity-25 top-3/2 -left-12 translate-y-[-50%] z-10" />

      {/* Right edge orb — peeking in symmetrically */}
      <div className="floating-orb w-40 h-40 bolt-gradient opacity-25 top-1/2 -right-12 translate-y-[-50%] z-10" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="mx-auto max-w-7xl px-2 xs:px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Supporting Tagline for clarity */}
          <div className="mb-2 sm:mb-4 animate-fade-in-down will-change-transform">
            <span className="text-xs sm:text-base font-semibold uppercase tracking-widest text-amber-600 bg-amber-200 px-2 py-1 rounded shadow-sm">
              Your AI Assistant for Effortless Documents
            </span>
          </div>

          {/* Enhanced Animated Badge */}
          <div
            className="inline-flex items-center badge-bg gap-2 px-3 sm:px-4 py-2 rounded-full gradient-border mb-6 sm:mb-8 subtle-shimmer relative animate-fade-in-down will-change-transform"
            aria-label="AI-Powered Document Magic"
          >
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles
                className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-text-glow"
                aria-hidden="true"
                style={{ animation: "sparkle 2s ease-in-out infinite" }}
              />
              <span className="text-xs sm:text-sm font-medium bolt-gradient-text">
                AI-Powered Document Magic
              </span>
              <Zap
                className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500"
                aria-hidden="true"
                style={{ animation: "color-dance 3s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* Animated modern main heading */}
          <h1 className="modern-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-7xl mb-6 sm:mb-8 animate-fade-in-down delay-100 will-change-transform text-shadow-professional">
            Create professional documents with{" "}
            <span className="bolt-gradient-text relative inline-block">
              AI Magic
              <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                <Wand2
                  className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 animate-bounce"
                  aria-hidden="true"
                />
              </div>
            </span>
          </h1>

          {/* Animated Modern Professional Subtitle */}
          <p className="modern-body mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-4 sm:px-0 animate-fade-in-up delay-200 will-change-opacity">
            Transform your ideas into polished{" "}
            <span
              className="font-semibold hover:text-amber-600 transition-colors"
              style={{ color: "#f59e0b" }}
            >
              resumes
            </span>
            ,{" "}
            <span
              className="font-semibold hover:text-blue-600 transition-colors"
              style={{ color: "#2563eb" }}
            >
              presentations
            </span>
            ,{" "}
            <span
              className="font-semibold hover:text-emerald-600 transition-colors"
              style={{ color: "#059669" }}
            >
              CVs
            </span>
            , and{" "}
            <span
              className="font-semibold hover:text-purple-600 transition-colors"
              style={{ color: "#7c3aed" }}
            >
              letters
            </span>{" "}
            in seconds with our cutting-edge AI platform.
          </p>

          {/* Animated CTA Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 xs:gap-4 sm:gap-x-6 px-2 xs:px-4 sm:px-0 animate-fade-in-up delay-300 will-change-transform w-full">
            <Button
              asChild
              size="lg"
              className="bolt-gradient text-white font-semibold px-4 xs:px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:scale-105 focus:ring-4 focus:ring-amber-400 focus:outline-none transition-all duration-300 bolt-glow w-full sm:w-auto relative overflow-hidden shadow-lg text-xs xs:text-sm sm:text-base"
              style={{ animation: "gradient-shift 4s ease infinite" }}
              aria-label="Start Creating Magic"
            >
              <Link
                href="#document-types"
                className="flex items-center justify-center gap-2"
                tabIndex={0}
              >
                <Sparkles
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
                <span className="text-xs xs:text-sm sm:text-base">
                  Start Creating Magic
                </span>
                <ArrowRight
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gradient-border px-4 xs:px-6 sm:px-8 py-3 sm:py-4 rounded-full w-full sm:w-auto relative focus:ring-4 focus:ring-blue-300 focus:outline-none shadow text-xs xs:text-sm sm:text-base"
              style={{ animation: "gradient-shift 3s ease infinite" }}
              aria-label="See How It Works"
            >
              <Link
                href="#how-it-works"
                className="flex items-center justify-center gap-2"
                tabIndex={0}
              >
                <Star
                  className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500"
                  aria-hidden="true"
                />
                <span className="text-xs xs:text-sm sm:text-base">
                  See How It Works
                </span>
              </Link>
            </Button>
          </div>

          {/* Animated Professional Stats with Tooltips */}
          <div className="mt-10 xs:mt-12 sm:mt-16 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 px-2 xs:px-4 sm:px-0">
            <TooltipWithShortcut content="Over 10,000 professional documents successfully created by our users worldwide">
              <div className="card-coral hover-glow-coral p-3 xs:p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 sunset-glow animate-fade-in-up delay-400 will-change-transform cursor-pointer">
                <div className="bolt-gradient-text text-xl xs:text-2xl sm:text-3xl font-bold animate-text-glow text-shadow-professional">
                  <StatCounter target={10000} suffix="+" />
                </div>
                <div className="text-muted-foreground text-xs xs:text-sm sm:text-base">
                  Documents Created
                </div>
              </div>
            </TooltipWithShortcut>

            <TooltipWithShortcut content="98% of our users successfully achieve their goals with DocMagic-generated documents">
              <div className="card-sky hover-glow-sky p-3 xs:p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 bolt-glow animate-fade-in-up delay-500 will-change-transform cursor-pointer">
                <div className="bolt-gradient-text text-xl xs:text-2xl sm:text-3xl font-bold animate-text-glow text-shadow-professional">
                  <StatCounter target={98} suffix="%" />
                </div>
                <div className="text-muted-foreground text-xs xs:text-sm sm:text-base">
                  Success Rate
                </div>
              </div>
            </TooltipWithShortcut>

            <TooltipWithShortcut content="Average 5-star rating from thousands of satisfied users across all platforms">
              <div className="card-mint hover-glow-mint p-3 xs:p-4 sm:p-6 rounded-2xl hover:scale-105 transition-all duration-300 ocean-glow animate-fade-in-up delay-600 will-change-transform cursor-pointer">
                <div className="bolt-gradient-text text-xl xs:text-2xl sm:text-3xl font-bold animate-text-glow text-shadow-professional">
                  <StatCounter target={5} suffix="★" />
                </div>
                <div className="text-muted-foreground text-xs xs:text-sm sm:text-base">
                  User Rating
                </div>
              </div>
            </TooltipWithShortcut>
          </div>
        </div>
      </div>
    </div>
  );
}
