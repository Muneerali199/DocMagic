import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SponsorBanner } from "@/components/sponsor-banner";
import { Sparkles, Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20 pointer-events-none"></div>
      <div className="floating-orb w-40 h-40 sm:w-64 sm:h-64 bolt-gradient opacity-15 top-16 -left-20 sm:-left-32 pointer-events-none"></div>
      <div className="floating-orb w-48 h-48 bolt-gradient opacity-10 bottom-10 left-1/3 pointer-events-none"></div>

      {/* Header */}
      <SponsorBanner />
      <SiteHeader />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 text-center z-10 relative">
        <div className="max-w-xl space-y-6">
          {/* Playful heading */}
          <h1 className="modern-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            Lost in{" "}
            <span className="bolt-gradient-text relative inline-block">
              DocMagic-land?
              <Sparkles className="absolute -top-2 -right-3 h-5 w-5 text-yellow-400 animate-pulse" />
            </span>
          </h1>

          {/* Friendly message */}
          <p className="modern-body text-muted-foreground text-lg sm:text-xl leading-relaxed">
            It looks like this page has vanished into the digital mist. Maybe it
            never existed, or maybe it’s just shy.
            <br />
            Either way, don’t worry — we’ve all been there. ✨
          </p>

          {/* Navigation button */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border hover:scale-105 transition-transform duration-300 glass-effect text-sm sm:text-base font-medium text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Take me home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer orb */}
      <div className="floating-orb w-32 h-32 bolt-gradient opacity-10 bottom-5 right-5 absolute pointer-events-none"></div>
    </div>
  );
}
