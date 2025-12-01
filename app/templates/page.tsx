'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResumeTemplateGalleryNew } from "@/components/templates/resume-template-gallery-new";
import { Template } from "@/types/templates";
import { useToast } from "@/hooks/use-toast";
import { SiteHeader } from "@/components/site-header";
import { Sparkles, FileText, Zap, Star, Wand2, BookOpen, Crown, TrendingUp } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);

        // Use the API route which has fallback to mock data
        const response = await fetch('/api/templates');

        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }

        const allTemplates = await response.json();
        setTemplates(allTemplates);
        setError(null);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load templates. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden ">
        {/* Background elements */}
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
        <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
        <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />

        <SiteHeader />
        <main className="flex-1 relative z-10 ">
          <div className="container py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="glass-effect p-8 rounded-2xl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4 text-center">Loading templates...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
        <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>

        <SiteHeader />
        <main className="flex-1 relative z-10 ">
          <div className="container py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="glass-effect p-8 rounded-2xl max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p className="text-destructive">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#F3E9DC' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(33, 28, 28, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating gradient orbs - muted for cream background */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{ backgroundColor: '#D4A574' }}></div>
      <div className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" style={{ backgroundColor: '#C9A060' }}></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" style={{ backgroundColor: '#B8935A' }}></div>

      <SiteHeader />
      
      <main className="flex-1 relative z-10">
        <div className="container py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-6 shadow-sm" style={{ backgroundColor: '#E8D5B7', borderColor: '#C9A060' }}>
              <Crown className="h-4 w-4" style={{ color: '#8B7355' }} />
              <span className="text-sm font-semibold" style={{ color: '#211C1C' }}>Premium Template Gallery</span>
              <Sparkles className="h-4 w-4" style={{ color: '#A0826D' }} />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: '#211C1C' }}>
              Beautiful Templates
              <br />
              <span className="font-extrabold" style={{ color: '#8B7355' }}>
                Made Simple
              </span>
            </h1>

            <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8" style={{ color: '#6B5C4C' }}>
              Choose from hundreds of professionally designed templates. 
              Customize in minutes. Create stunning documents effortlessly.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8B7355' }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold" style={{ color: '#211C1C' }}>100+</div>
                  <div className="text-sm" style={{ color: '#6B5C4C' }}>Templates</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#A0826D' }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold" style={{ color: '#211C1C' }}>250K+</div>
                  <div className="text-sm" style={{ color: '#6B5C4C' }}>Downloads</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C9A060' }}>
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold" style={{ color: '#211C1C' }}>4.8/5</div>
                  <div className="text-sm" style={{ color: '#6B5C4C' }}>Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Template Gallery - NEW EDITABLE TEMPLATES */}
          <div className="rounded-3xl shadow-xl border-2 p-6 sm:p-8 lg:p-10" style={{ backgroundColor: '#FFFFFF', borderColor: '#D4A574' }}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold" style={{ color: '#211C1C' }}>
                    Editable Resume Templates
                  </h2>
                  <p className="text-sm text-green-600 font-semibold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    All templates are fully editable!
                  </p>
                </div>
              </div>
              <p className="text-lg" style={{ color: '#6B5C4C' }}>
                Professional, job-specific resume templates. Click any template to start editing instantly.
              </p>
            </div>
            <ResumeTemplateGalleryNew />
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-block p-1 rounded-2xl shadow-2xl" style={{ backgroundColor: '#8B7355' }}>
              <div className="bg-white rounded-2xl px-8 py-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="h-6 w-6" style={{ color: '#8B7355' }} />
                  <h3 className="text-2xl font-bold" style={{ color: '#211C1C' }}>
                    Can&apos;t find what you need?
                  </h3>
                  <Zap className="h-6 w-6" style={{ color: '#A0826D' }} />
                </div>
                <p className="mb-4" style={{ color: '#6B5C4C' }}>
                  Create custom templates with our AI-powered editor
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F3E9DC' }}>
                    <Wand2 className="w-4 h-4" style={{ color: '#8B7355' }} />
                    <span className="font-medium" style={{ color: '#211C1C' }}>AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#E8D5B7' }}>
                    <Crown className="w-4 h-4" style={{ color: '#A0826D' }} />
                    <span className="font-medium" style={{ color: '#211C1C' }}>Premium Designs</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#F3E9DC' }}>
                    <Zap className="w-4 h-4" style={{ color: '#C9A060' }} />
                    <span className="font-medium" style={{ color: '#211C1C' }}>Instant Export</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
