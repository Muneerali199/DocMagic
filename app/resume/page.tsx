"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { MobileResumeBuilder } from "@/components/resume/mobile-resume-builder";
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ResumeGeneratorSkeleton } from "@/components/ui/skeleton";

function ResumeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const templateId = searchParams?.get('template') || null;
  const resumeId = searchParams?.get('id') || null;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <SiteHeader />
      <main className="flex-1 relative z-10">
        <ErrorBoundary>
          <CreateDocumentGuard>
            {isLoading ? (
              <div className="container py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                <ResumeGeneratorSkeleton />
              </div>
            ) : (
              <MobileResumeBuilder templateId={templateId} resumeId={resumeId} />
            )}
          </CreateDocumentGuard>
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResumeContent />
    </Suspense>
  );
}