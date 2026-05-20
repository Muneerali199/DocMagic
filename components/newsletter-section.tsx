'use client';

import { Sparkles, Mail, Heart, CheckCircle } from 'lucide-react';
import { NewsletterSubscribe } from './newsletter-subscribe';

export function NewsletterSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="mesh-gradient opacity-40"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-amber-400/8 to-orange-400/8 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-blue-200/30 mb-6 hover:scale-105 transition-transform duration-300 animate-fade-in">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            <span className="text-sm font-semibold bolt-gradient-text">Stay Updated</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            <span className="block mb-2">Never Miss a Feature Update</span>
            <span className="bolt-gradient-text">Join Our Growing Community</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
            Get exclusive access to new AI capabilities, feature releases, and insider tips directly in your inbox.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Weekly Tips</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>New Features First</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>Special Offers</span>
            </div>
          </div>
        </div>

        {/* Newsletter Form */}
        <div className="flex justify-center mb-8">
          <NewsletterSubscribe sourcePage="homepage" />
        </div>

        {/* Trust Statement */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Heart className="h-4 w-4 text-red-500" />
          <span>Join 5,000+ professionals already subscribed</span>
        </div>
      </div>
    </section>
  );
}
