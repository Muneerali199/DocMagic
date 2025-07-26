"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SponsorBanner } from "@/components/sponsor-banner";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { DocumentCard } from "@/components/document-card";
import LandingPage from "@/components/landing-page";
import AvatarSelectionPage from "@/components/avatar-selection-page";
import {
  File as FileIcon,
  FileText,
  Presentation,
  Mail,
  Zap,
  Sparkles,
  ArrowDown,
  Star,
  Wand2,
  Shield,
  Heart,
  Coffee,
  Github,
  Linkedin,
  Twitter,
  BookOpen,
  HelpCircle,
  Users,
  Globe
} from "lucide-react";



export default function Home() {
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
  // FOR TESTING ONLY: always reset avatar
  localStorage.removeItem("user-avatar");
  setHasAvatar(false);
}, []);


  if (hasAvatar === null) return null;

  if (!hasAvatar && !started) {
    return <LandingPage onGetStarted={() => setStarted(true)} />;
  }

  if (!hasAvatar && started) {
    return <AvatarSelectionPage onAvatarSet={() => setHasAvatar(true)} />;
  }

  // === Main Landing Page ===
  return (
    <div className="min-h-screen flex flex-col">
      <SponsorBanner />
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />

        {/* Your full landing layout remains unchanged... */}
        {/* I won't duplicate your full HTML here for brevity, but keep the section below exactly as-is */}

        {/* Keep everything from section#document-types onward */}

        {/* ... Footer, Document Cards, Stats, etc. */}
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}

const Footer = () => {
  const productLinks = ["Features", "Pricing", "Templates", "Integrations"];
  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <footer className="relative overflow-hidden footer-professional">
      {/* Background & floating visuals */}
      {/* ... (same as your footer content above) */}
      {/* Don’t forget to include all your grid, links, copyright */}
    </footer>
  );
};
