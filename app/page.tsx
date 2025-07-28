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

export default function Home() {
  return (
    <div id="top" className="min-h-screen flex flex-col">
      <SponsorBanner />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        {/* Quick Navigation Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-blue-50/30 via-background to-purple-50/30 border-y border-border/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold bolt-gradient-text mb-4">
                Explore DocMagic
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover all the powerful features and tools available in DocMagic
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              <TooltipWithShortcut content="View your profile and account settings">
                <Link
                  href="/profile"
                  className="group flex flex-col items-center p-4 rounded-xl glass-effect border border-blue-200/30 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 bolt-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">Profile</span>
                </Link>
              </TooltipWithShortcut>
              <TooltipWithShortcut content="Browse and manage your templates">
                <Link
                  href="/templates"
                  className="group flex flex-col items-center p-4 rounded-xl glass-effect border border-purple-200/30 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 cosmic-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">Templates</span>
                </Link>
              </TooltipWithShortcut>
              <TooltipWithShortcut content="View pricing plans and options">
                <Link
                  href="/pricing"
                  className="group flex flex-col items-center p-4 rounded-xl glass-effect border border-green-200/30 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 forest-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">Pricing</span>
                </Link>
              </TooltipWithShortcut>
              <TooltipWithShortcut content="Learn more about DocMagic">
                <Link
                  href="/about"
                  className="group flex flex-col items-center p-4 rounded-xl glass-effect border border-amber-200/30 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 sunset-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">About</span>
                </Link>
              </TooltipWithShortcut>
              <TooltipWithShortcut content="Get help and contact support">
                <Link
                  href="/contact"
                  className="group flex flex-col items-center p-4 rounded-xl glass-effect border border-blue-200/30 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 ocean-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <HelpCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">Contact</span>
                </Link>
              </TooltipWithShortcut>
              <TooltipWithShortcut content="Access documentation and guides">
                <Link
                  href="/documentation"
                  className="group flex flex-col items-center p-4 rounded-xl glass-effect border border-indigo-200/30 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 bolt-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-center">Docs</span>
                </Link>
              </TooltipWithShortcut>
            </div>
          </div>
        </section>
        <FeaturesSection />
        <TestimonialsSection />
        <ScrollToTop />
      </main>
    </div>
  );
}
