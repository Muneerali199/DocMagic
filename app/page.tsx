import { SiteHeader } from "@/components/site-header";
import { SponsorBanner } from "@/components/sponsor-banner";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { DocumentCard } from "@/components/document-card";
import { TooltipWithShortcut } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  File as FileIcon,
  FileText,
  Presentation as LayoutPresentation,
  Mail,
  Github,
  Twitter,
  Linkedin,
  HelpCircle,
  BookOpen,
  Users,
  Sparkles,
  Heart,
  Zap,
  Star,
  ArrowDown,
  Wand2,
  Shield,
  Globe,
  Coffee,
  ArrowRight,
  Trophy,
} from "lucide-react";
import ScrollToTop from "@/components/scroll-to-top";
//improved ui home page
export default function Home() {
  return (
    <div
      id="top"
      className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-950/50 dark:to-gray-900 text-gray-900 dark:text-white"
    >
      <SponsorBanner />
      <SiteHeader />

      <main className="flex-1">
        <HeroSection />

        {/* Enhanced AI-Powered Features Showcase  */}
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
          {/* Enhanced Background Elements - Matching other sections */ }
          <div className="absolute inset-0 overflow-hidden">
            <div className="mesh-gradient opacity-40"></div>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-amber-400/8 to-orange-400/8 rounded-full blur-2xl animate-pulse delay-500"></div>
</div>

        {/* Features Section */}
        <section className="py-20 sm:py-24 lg:py-28 relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl"></div>
            <div className="absolute -left-20 bottom-1/3 w-72 h-72 rounded-full bg-purple-500/5 blur-3xl"></div>

          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            {/* Section Header */}
            <div className="text-center mb-14 sm:mb-20">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100/70 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                <Sparkles className="h-4 w-4 animate-pulse" />
                AI-Powered Document Creation
              </span>

              <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-gray-100 dark:via-gray-300 dark:to-gray-500">
                Create Professional Documents
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
                  In Seconds, Not Hours
                </span>
              </h2>

              <p className="mt-5 text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Transform your ideas into stunning documents with our advanced
                AI. From resumes to presentations, experience professional
                creation made simple.
              </p>
            </div>

            {/* Main Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {[
                {
                  href: "/resume",
                  title: "AI Resume Builder",
                  desc: "Generate professional, ATS-optimized resumes with intelligent formatting",
                  icon: FileText,
                  color: "blue",
                },
                {
                  href: "/presentation",
                  title: "Smart Presentations",
                  desc: "Generate complete slide decks with outlines and shareable URLs",
                  icon: LayoutPresentation,
                  color: "purple",
                },
                {
                  href: "/letter",
                  title: "Letter Composer",
                  desc: "Create compelling cover letters with AI-powered tone optimization",
                  icon: Mail,
                  color: "amber",
                },
                {
                  href: "/cv",
                  title: "CV Builder",
                  desc: "Generate comprehensive academic CVs with detailed sections",
                  icon: FileIcon,
                  color: "emerald",
                },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-2"
                >
                  {/* Decorative element */}
                  <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-${item.color}-500/10 blur-xl`}></div>
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 dark:from-${item.color}-900/40 dark:to-${item.color}-800/30 flex items-center justify-center mb-5 shadow-inner group-hover:shadow-md transition-shadow`}
                  >
                    <item.icon
                      className={`h-7 w-7 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {item.desc}
                  </p>
                  <div
                    className={`mt-auto flex items-center text-${item.color}-600 dark:text-${item.color}-400 font-medium group-hover:text-${item.color}-700 dark:group-hover:text-${item.color}-300 transition-colors`}
                  >
                    Get started
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Secondary Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {[
                { icon: BookOpen, name: "Templates", desc: "50+ Designs", color: "purple" },
                { icon: Users, name: "Profile", desc: "Analytics", color: "blue" },
                { icon: Star, name: "Pricing", desc: "Free Start", color: "amber" },
                { icon: Heart, name: "About", desc: "Our Story", color: "pink" },
                { icon: HelpCircle, name: "Support", desc: "24/7 Help", color: "blue" },
                { icon: BookOpen, name: "Docs", desc: "Get Started", color: "gray" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/${item.name.toLowerCase()}`}
                  className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 dark:from-${item.color}-900/40 dark:to-${item.color}-800/30 flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow`}
                  >
                    <item.icon
                      className={`h-6 w-6 text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}
                    />
                  </div>
                  <span className="text-sm font-semibold group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {item.desc}
                  </span>
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-20">
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
              >
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                Create Your First Document
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <TestimonialsSection />
        <ScrollToTop />
      </section></main>
    </div>

  );
}