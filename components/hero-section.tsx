'use client';
import { Button } from "@/components/ui/button";
import { StatCounter } from "./ui/stat-counter";
import { TooltipWithShortcut } from "@/components/ui/tooltip";
import Link from "next/link";
import { Sparkles, ArrowRight, Star, Rocket, Clock, Users, Trophy, Wand2 } from "lucide-react";
import { TypedEffect } from '@/components/ui/typewriter';

export function HeroSection() {
  return (
    <div className="hero-section relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 py-9 xs:py-16 sm:py-28 lg:py-36">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='30' cy='30' r='1' fill='%23000'/%3e%3c/svg%3e")`,
          }}
        />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 w-full max-w-3xl h-64 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5 animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5 dark:opacity-3 animate-float-slow-reverse" />
      </div>
      
      <div className="mt-0 mx-auto max-w-7xl px-2 xs:px-3 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Enhanced Trust Badge */}
          <div className="mt-0 mb-4 sm:mb-6 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/50 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Trophy className="h-4 w-4 text-amber-600 animate-pulse" />
              <span className="text-sm font-bold text-amber-800 dark:text-amber-300">
                #1 AI Document Creator
              </span>
              <Star className="h-4 w-4 text-amber-500 fill-current animate-spin-slow" />
            </div>
          </div>
          
          {/* Enhanced AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full border border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-blue-900/50 mb-6 sm:mb-8 animate-fade-in-down delay-75 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400 animate-pulse" />
            <span className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300">
              AI-Powered Document Magic
            </span>
            <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 dark:text-blue-300 animate-wiggle" />
          </div>
          
          {/* Enhanced Main Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 sm:mb-8 animate-fade-in-down delay-100">
            <span className="block mb-2 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">
              Create stunning
            </span>
            <span className="inline-flex items-center gap-x-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 font-bold">
                <TypedEffect />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">in</span>
              <span className="inline-flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 font-bold">
                  seconds
                </span>
                <Rocket className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-blue-500 ml-2 animate-bounce" />
              </span>
            </span>
          </h1>
          
          {/* Enhanced Value Proposition */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl sm:max-w-4xl mx-auto mb-6 sm:mb-8 animate-fade-in-up delay-200 leading-relaxed">
            Transform your ideas into{' '}
            <span className="font-bold text-amber-600 hover:text-amber-700 transition-colors duration-300">professional documents</span>{' '}
            that impress. Our AI creates{' '}
            <span className="font-bold text-blue-600 hover:text-blue-700 transition-colors duration-300">perfectly formatted</span>{' '}
            resumes, presentations, CVs and letters{' '}
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300">
              instantly
            </span>.
          </p>
          
          {/* Enhanced Key Benefits */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 animate-fade-in-up delay-250">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-blue-900/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Save Hours</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-amber-900/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">10K+ Users</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-blue-900/50 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">AI-Powered</span>
            </div>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 animate-fade-in-up delay-300">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
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
              className="px-8 sm:px-10 py-4 sm:py-5 rounded-full border-gray-300 bg-white/90 hover:bg-white font-bold dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Link href="#how-it-works" className="flex items-center justify-center gap-3 group">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 dark:text-amber-400 group-hover:animate-pulse" />
                <span>Watch Demo</span>
              </Link>
            </Button>
          </div>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 animate-fade-in-up delay-400">
            <div className="p-6 sm:p-8 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-amber-900/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                <StatCounter target={10000} suffix="+" />
              </div>
              <div className="text-sm sm:text-base text-amber-800/90 dark:text-amber-300 group-hover:text-amber-900/80 dark:group-hover:text-amber-200 transition-colors">
                Documents Created
              </div>
            </div>
            <div className="p-6 sm:p-8 rounded-xl border border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-blue-900/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                <StatCounter target={98} suffix="%" />
              </div>
              <div className="text-sm sm:text-base text-blue-800/90 dark:text-blue-300 group-hover:text-blue-900/80 dark:group-hover:text-blue-200 transition-colors">
                Success Rate
              </div>
            </div>
            <div className="p-6 sm:p-8 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-amber-900/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="text-3xl sm:text-4xl font-bold text-amber-700 dark:text-amber-300 mb-2">
                <StatCounter target={5} suffix="★" />
              </div>
              <div className="text-sm sm:text-base text-amber-800/90 dark:text-amber-300 group-hover:text-amber-900/80 dark:group-hover:text-amber-200 transition-colors">
                User Rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}