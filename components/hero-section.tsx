'use client';
import { Button } from "@/components/ui/button";
import { StatCounter } from "./ui/stat-counter";
import { TooltipWithShortcut } from "@/components/ui/tooltip";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Star, Wand2, Clock, Users, Trophy, Rocket } from "lucide-react";
import {TypedEffect} from '@/components/ui/typewriter';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-background py-12 xs:py-16 sm:py-28 lg:py-36">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0"></div>
      <div className="absolute inset-0 mesh-gradient-alt opacity-15"></div>

      {/* Enhanced floating orbs with better positioning */}
      <div className="floating-orb w-48 h-48 sm:w-64 sm:h-64 bolt-gradient opacity-20 top-1/4 -left-16 sm:-left-24" />
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 sunset-gradient opacity-15 top-3/4 -right-16 sm:-right-20" />
      <div className="floating-orb w-32 h-32 sm:w-44 sm:h-44 ocean-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

      {/* Enhanced grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="mx-auto max-w-7xl px-2 xs:px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Enhanced Trust Badge */}
          <div className="mb-4 sm:mb-6 animate-fade-in-down will-change-transform">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-amber-200/30 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 backdrop-blur-sm">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                #1 AI Document Creator
              </span>
              <Star className="h-4 w-4 text-amber-500 fill-current" />
            </div>
          </div>

          {/* Enhanced Animated Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full glass-effect mb-6 sm:mb-8 shimmer relative animate-fade-in-down will-change-transform border border-blue-200/30"
            aria-label="AI-Powered Document Magic"
          >
            <div className="relative z-10 flex items-center gap-2">
              <Sparkles
                className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 animate-pulse"
                aria-hidden="true"
              />
              <span className="text-sm sm:text-base font-semibold bolt-gradient-text">
                AI-Powered Document Magic
              </span>
              <Wand2
                className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-bounce"
                aria-hidden="true"
              />
            </div>
          </div>
          {/* Enhanced Main Headline */}
          <h1 className="modern-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-6 sm:mb-8 animate-fade-in-down delay-100 will-change-transform text-shadow-professional text-balance leading-tight">
            <span className="block mb-2 sm:mb-4">
              Create stunning
            </span>
            <span
              className="inline-flex items-center flex-wrap md:flex-nowrap leading-tight gap-x-3"
              style={{ minHeight: "1.2em" }}
            >
              {/* Enhanced typed word container */}
              <span
                className="typed-text bolt-gradient-text bg-clip-text text-transparent font-bold inline-block"
                style={{
                  display: "inline-block",
                  minWidth: "5ch",
                  maxWidth: "15ch",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <TypedEffect />
              </span>
              <span className="text-inherit font-semibold whitespace-nowrap">
                in
              </span>
              <span className="relative inline-flex items-center gap-2">
                <span className="bolt-gradient-text font-bold">seconds</span>
                <Rocket
                  className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-500 animate-bounce"
                  aria-hidden="true"
                />
              </span>
            </span>
          </h1>

          {/* Enhanced Value Proposition */}
          <p className="modern-body mt-6 sm:mt-8 text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl sm:max-w-4xl mx-auto px-4 sm:px-0 animate-fade-in-up delay-200 will-change-opacity leading-relaxed">
            Transform your ideas into{" "}
            <span className="font-bold text-amber-600 hover:text-amber-700 transition-colors">
              professional documents
            </span>{" "}
            that impress. Our AI understands your needs and creates{" "}
            <span className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              perfectly formatted
            </span>{" "}
            resumes, presentations, CVs, and letters{" "}
            <span className="font-bold bolt-gradient-text">
              instantly
            </span>.
          </p>

          {/* Key Benefits Pills */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 animate-fade-in-up delay-250">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-green-200/30">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Save Hours</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-blue-200/30">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">10K+ Users</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-purple-200/30">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">AI-Powered</span>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-2 xs:px-4 sm:px-0 animate-fade-in-up delay-300 will-change-transform w-full">
            <Button
              asChild
              size="lg"
              className="bolt-gradient text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:scale-105 focus:ring-4 focus:ring-blue-400 focus:outline-none transition-all duration-300 bolt-glow w-full sm:w-auto relative overflow-hidden shadow-2xl text-base sm:text-lg group"
              style={{ animation: "gradient-shift 4s ease infinite" }}
              aria-label="Start Creating Documents"
            >
              <Link
                href="#document-types"
                className="flex items-center justify-center gap-3"
                tabIndex={0}
              >
                <Sparkles
                  className="h-5 w-5 sm:h-6 sm:w-6 group-hover:animate-spin"
                  aria-hidden="true"
                />
                <span className="font-bold">
                  Start Creating Now
                </span>
                <ArrowRight
                  className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            {/*Enhanced watch demo button*/}
              <Button
             asChild
             variant="outline"
             size="lg"
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-full w-full sm:w-auto relative z-10 focus:ring-4 focus:ring-red-400 focus:outline-none shadow-lg text-base sm:text-lg font-semibold transition-all duration-500 ease-in-out group
             bg-gradient-to-r from-red-600 to-black text-white
             hover:from-red-700 hover:to-neutral-900
             hover:scale-105 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:z-20"
            aria-label="Watch Demo"
>
            <Link
            href="#how-it-works"
            className="flex items-center justify-center gap-3"
            tabIndex={0}
          >
    <Star
  
  className="text-yellow-500 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-700 ease-in-out hover:fill group-hover:rotate-[240deg]"
  aria-hidden="true"
/>
      <span className="text-white">Watch Demo</span>
       </Link>
      </Button>
       </div>
          {/* Social Proof Banner */}
          <div className="mt-8 sm:mt-10 animate-fade-in-up delay-350">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by professionals worldwide
            </p>
            <div className="flex items-center justify-center gap-6 opacity-60">
              <div className="text-xs font-medium">Fortune 500</div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="text-xs font-medium">Startups</div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="text-xs font-medium">Freelancers</div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="text-xs font-medium">Students</div>
            </div>
          </div>

          {/* Enhanced Professional Stats with Better Visual Hierarchy */}
          <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-2 xs:px-4 sm:px-0">
            <TooltipWithShortcut content="Over 10,000 professional documents successfully created by our users worldwide">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative card-coral hover-glow-coral p-6 sm:p-8 rounded-3xl hover:scale-105 transition-all duration-300 sunset-glow animate-fade-in-up delay-400 will-change-transform cursor-pointer border border-amber-200/30">
                  <div className="text-center">
                    <div className="bolt-gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold animate-text-glow text-shadow-professional mb-2">
                      <StatCounter target={10000} suffix="+" />
                    </div>
                    <div className="text-muted-foreground text-sm sm:text-base font-medium">
                      Documents Created
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      And counting...
                    </div>
                  </div>
                </div>
              </div>
            </TooltipWithShortcut>

            <TooltipWithShortcut content="98% of our users successfully achieve their goals with DocMagic-generated documents">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative card-sky hover-glow-sky p-6 sm:p-8 rounded-3xl hover:scale-105 transition-all duration-300 bolt-glow animate-fade-in-up delay-500 will-change-transform cursor-pointer border border-blue-200/30">
                  <div className="text-center">
                    <div className="bolt-gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold animate-text-glow text-shadow-professional mb-2">
                      <StatCounter target={98} suffix="%" />
                    </div>
                    <div className="text-muted-foreground text-sm sm:text-base font-medium">
                      Success Rate
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Proven results
                    </div>
                  </div>
                </div>
              </div>
            </TooltipWithShortcut>

            <TooltipWithShortcut content="Average 5-star rating from thousands of satisfied users across all platforms">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative card-mint hover-glow-mint p-6 sm:p-8 rounded-3xl hover:scale-105 transition-all duration-300 ocean-glow animate-fade-in-up delay-600 will-change-transform cursor-pointer border border-emerald-200/30">
                  <div className="text-center">
                    <div className="bolt-gradient-text text-3xl sm:text-4xl lg:text-5xl font-bold animate-text-glow text-shadow-professional mb-2">
                      <StatCounter target={5} suffix="★" />
                    </div>
                    <div className="text-muted-foreground text-sm sm:text-base font-medium">
                      User Rating
                    </div>
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Loved by users
                    </div>
                  </div>
                </div>
              </div>
            </TooltipWithShortcut>
          </div>
        </div>
      </div>
    </div>
  );
}
