'use client';
import { Button } from "@/components/ui/button";
import { StatCounter } from "./ui/stat-counter";
import { TooltipWithShortcut } from "@/components/ui/tooltip";
import Link from "next/link";
import { Sparkles, ArrowRight, Zap, Star, Wand2, Clock, Users, Trophy, Rocket } from "lucide-react";
import {TypedEffect} from '@/components/ui/typewriter';

export function HeroSection() {
  return (
    <div className=" hero-section relative overflow-hidden bg-background py-12 xs:py-16 sm:py-28 lg:py-36">
      {/* Background elements - optimized positioning */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 mesh-gradient-alt opacity-15" />
        
        {/* Floating orbs - same elements with performance-optimized animations */}
        <div className="absolute w-48 h-48 sm:w-64 sm:h-64 bolt-gradient opacity-20 top-1/4 -left-16 sm:-left-24 animate-float" />
        <div className="absolute w-40 h-40 sm:w-56 sm:h-56 sunset-gradient opacity-15 top-3/4 -right-16 sm:-right-20 animate-float delay-1000" />
        <div className="absolute w-32 h-32 sm:w-44 sm:h-44 ocean-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float delay-1500" />
        
        {/* Grid pattern - unchanged */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-2 xs:px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Trust Badge - same element with refined styling */}
          <div className="mb-4 sm:mb-6 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-200/30 bg-amber-50/80 dark:bg-amber-900 ">
              <Trophy className="h-4 w-4 text-amber-600 dark:border-amber-700" />
              <span className="text-sm font-semibold text-amber-800">
                #1 AI Document Creator
              </span>
              <Star className="h-4 w-4 text-amber-500 fill-current" />
            </div>
          </div>

          {/* AI Badge - same element with refined animation */}
   <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full border border-blue-200/30 bg-blue-50/80 mb-6 sm:mb-8 animate-fade-in-down delay-75
                dark:border-blue-700 dark:bg-blue-900">
  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400" />
  <span className="text-sm sm:text-base font-semibold text-blue-700 dark:text-blue-300">
    AI-Powered Document Magic
  </span>
  <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-300" />
</div>


          {/* Main Headline - same structure with improved typography */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 animate-fade-in-down delay-100">
            <span className="block mb-2 sm:mb-4 text-gray-900">
              Create stunning
            </span>
            <span className="inline-flex items-center flex-wrap md:flex-nowrap gap-x-3">
              <span className="typed-text bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 font-bold">
                <TypedEffect />
              </span>
              <span className="text-gray-900">in</span>
              <span className="inline-flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 font-bold">
                  seconds
                </span>
                <Rocket className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-500 ml-2" />
              </span>
            </span>
          </h1>

          {/* Value Proposition - same text with refined styling */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl sm:max-w-4xl mx-auto px-4 sm:px-0 mb-6 sm:mb-8 animate-fade-in-up delay-200 leading-relaxed">
            Transform your ideas into{' '}
            <span className="font-semibold text-amber-600">professional documents</span>{' '}
            that impress. Our AI understands your needs and creates{' '}
            <span className="font-semibold text-blue-600">perfectly formatted</span>{' '}
            resumes, presentations, CVs, and letters{' '}
            <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              instantly
            </span>.
          </p>

          {/* Key Benefits - same pills with refined styling */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 animate-fade-in-up delay-250">
  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-200/30 bg-green-50/80
                  dark:border-green-700 dark:bg-green-900">
    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
    <span className="text-sm font-medium text-green-700 dark:text-green-300">Save Hours</span>
  </div>
  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200/30 bg-blue-50/80
                  dark:border-blue-700 dark:bg-blue-900">
    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">10K+ Users</span>
  </div>
  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200/30 bg-purple-50/80
                  dark:border-purple-700 dark:bg-purple-900">
    <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Powered</span>
  </div>
</div>

          {/* CTA Buttons - same buttons with refined hover states */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-2 xs:px-4 sm:px-0 mb-12 sm:mb-16 animate-fade-in-up delay-300">
            <Button
              asChild
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <Link href="#document-types" className="flex items-center justify-center gap-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>Start Creating Now</span>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
           <Button
  asChild
  variant="outline"
  size="lg"
  className="px-8 sm:px-10 py-4 sm:py-5 rounded-full border-gray-300 bg-white/80 hover:bg-gray-50 font-semibold transition-all duration-300 hover:scale-[1.02]
             dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
>
  <Link href="#how-it-works" className="flex items-center justify-center gap-3">
    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 dark:text-yellow-400" />
    <span>Watch Demo</span>
  </Link>
</Button>

          </div>

          {/* Stats - same cards with refined hover effects */}
         {/* Stats - Enhanced visual appeal with curved shapes */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-2 xs:px-4 sm:px-0 animate-fade-in-up delay-400">
  <div className="p-6 sm:p-8 rounded-[20px] border border-amber-200/30 bg-gradient-to-br from-amber-50/70 via-yellow-50/60 to-white
                  dark:border-amber-700 dark:bg-gradient-to-br dark:from-amber-900 dark:via-yellow-900 dark:to-gray-900
                  hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-amber-200/20 blur-xl dark:bg-amber-700/30"></div>
    <div className="relative z-10 text-center">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent
                      bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 mb-2">
        <StatCounter target={10000} suffix="+" />
      </div>
      <div className="text-sm sm:text-base text-amber-800/90 dark:text-amber-300">
        Documents Created
      </div>
    </div>
  </div>

  <div className="p-6 sm:p-8 rounded-[20px] border border-blue-200/30 bg-gradient-to-br from-blue-50/70 via-cyan-50/60 to-white
                  dark:border-blue-700 dark:bg-gradient-to-br dark:from-blue-900 dark:via-cyan-900 dark:to-gray-900
                  hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
    <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-blue-200/20 blur-xl dark:bg-blue-700/30"></div>
    <div className="relative z-10 text-center">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent
                      bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 mb-2">
        <StatCounter target={98} suffix="%" />
      </div>
      <div className="text-sm sm:text-base text-blue-800/90 dark:text-blue-300">
        Success Rate
      </div>
    </div>
  </div>

  <div className="p-6 sm:p-8 rounded-[20px] border border-emerald-200/30 bg-gradient-to-br from-emerald-50/70 via-teal-50/60 to-white
                  dark:border-emerald-700 dark:bg-gradient-to-br dark:from-emerald-900 dark:via-teal-900 dark:to-gray-900
                  hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-200/20 blur-xl dark:bg-emerald-700/30"></div>
    <div className="relative z-10 text-center">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent
                      bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-2">
        <StatCounter target={5} suffix="★" />
      </div>
      <div className="text-sm sm:text-base text-emerald-800/90 dark:text-emerald-300">
        User Rating
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}