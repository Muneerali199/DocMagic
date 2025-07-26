'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 text-center px-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-indigo-900">
        Welcome to <span className="text-blue-600">DocMagic</span>
      </h1>
      <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-8">
        Create beautiful, AI-powered documents in seconds. Get started by selecting your avatar!
      </p>
      <Button onClick={onGetStarted} className="text-base sm:text-lg px-6 py-3 bolt-gradient-text font-semibold flex items-center gap-2">
        <Sparkles className="h-5 w-5 animate-bounce" />
        Get Started
      </Button>
    </div>
  );
}
