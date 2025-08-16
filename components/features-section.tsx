import { CheckCircle, FileText, Presentation as LayoutPresentation, BookOpen, Users, PenTool, Download, Sparkles, Zap, Star, Wand2, Workflow, Brain, Palette, Shield } from "lucide-react";
import React from 'react';

export function FeaturesSection() {
  return (
    <div className="py-20 sm:py-28 lg:py-36 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/50 via-white to-gray-100/20 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Modern animated grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 [background:radial-gradient(circle_800px_at_100px_200px,#3b82f640,transparent)] dark:[background:radial-gradient(circle_800px_at_100px_200px,#3b82f620,transparent)]"></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_800px_at_80%_80%,#ec489940,transparent)] dark:[background:radial-gradient(circle_800px_at_80%_80%,#ec489920,transparent)]"></div>
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,white_20%,white_80%,transparent)]"></div>
      </div>

      {/* Floating orb elements */}
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-amber-200/40 to-pink-300/40 blur-3xl opacity-30 dark:opacity-20 animate-float"></div>
      <div className="absolute bottom-20 -left-24 w-72 h-72 rounded-full bg-gradient-to-r from-blue-200/40 to-cyan-300/40 blur-3xl opacity-30 dark:opacity-20 animate-float-delay"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/40 to-teal-300/40 blur-3xl opacity-30 dark:opacity-20 transform -translate-x-1/2 -translate-y-1/2 animate-float-slow"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Powered by Advanced AI
            </span>
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mt-8 mb-6">
            <span className="block text-gray-900 dark:text-white">How DocMagic</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Works Its Magic
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the future of document creation. Our AI understands context, follows best practices, and delivers professional results that exceed expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const themes = [
              { 
                cardClass: 'hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20',
                gradientClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20',
                iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
                borderClass: 'border-amber-200/50 dark:border-amber-800/30'
              },
              { 
                cardClass: 'hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20',
                gradientClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20',
                iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
                borderClass: 'border-blue-200/50 dark:border-blue-800/30'
              },
              { 
                cardClass: 'hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20',
                gradientClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20',
                iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
                borderClass: 'border-emerald-200/50 dark:border-emerald-800/30'
              },
              { 
                cardClass: 'hover:shadow-purple-100/50 dark:hover:shadow-purple-900/20',
                gradientClass: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20',
                iconClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
                borderClass: 'border-purple-200/50 dark:border-purple-800/30'
              },
              { 
                cardClass: 'hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20',
                gradientClass: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20',
                iconClass: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
                borderClass: 'border-indigo-200/50 dark:border-indigo-800/30'
              },
              { 
                cardClass: 'hover:shadow-pink-100/50 dark:hover:shadow-pink-900/20',
                gradientClass: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20',
                iconClass: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
                borderClass: 'border-pink-200/50 dark:border-pink-800/30'
              }
            ];
            const theme = themes[index % themes.length];

            return (
              <div 
                key={feature.name} 
                className={`group relative rounded-3xl p-8 ${theme.gradientClass} border ${theme.borderClass} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${theme.cardClass}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${theme.iconClass} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  {React.cloneElement(feature.icon, { className: "h-6 w-6" })}
                </div>

                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.name}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm bg-white/70 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                  <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {feature.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16 sm:mt-20">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-emerald-200/50 dark:border-emerald-800/30 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
              Enterprise-grade security & reliability
            </span>
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'AI-Powered Generation',
    description: 'Describe what you need in plain language, and our advanced AI will generate a complete, professional document with intelligent formatting and contextual content that matches your requirements perfectly.',
    icon: <Sparkles />,
    badge: 'Instant Results'
  },
  {
    name: 'Professional Templates',
    description: 'Choose from our curated collection of professionally designed templates for resumes, presentations, CVs, and letters. Each template follows industry best practices and modern design standards.',
    icon: <LayoutPresentation />,
    badge: 'Industry Standard'
  },
  {
    name: 'Smart Content Engine',
    description: 'Our AI understands context, industry requirements, and target audiences to generate compelling content that resonates with your specific goals and professional needs.',
    icon: <Brain />,
    badge: 'Context Aware'
  },
  {
    name: 'Intuitive Editor',
    description: 'Fine-tune your documents with our powerful yet simple editor. Real-time preview, instant formatting, and intelligent suggestions make editing effortless and efficient.',
    icon: <PenTool />,
    badge: 'Real-time Preview'
  },
  {
    name: 'Team Collaboration',
    description: 'Share documents with teammates for feedback and collaborative editing. Built-in commenting, version control, and real-time collaboration features streamline teamwork.',
    icon: <Users />,
    badge: 'Team Ready'
  },
  {
    name: 'Multi-Format Export',
    description: 'Export your documents in multiple professional formats including PDF, PPTX, DOCX, and more. Perfect formatting preserved across all platforms and devices.',
    icon: <Download />,
    badge: 'Universal Compatibility'
  }
];