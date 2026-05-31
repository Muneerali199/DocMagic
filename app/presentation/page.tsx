"use client";
import React, { Suspense } from 'react';
import RealTimeGenerator from '@/components/presentation/real-time-generator';
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from '@/components/loading-screen';
import { PresentationPageSkeleton } from '@/components/skeletons';
import { SiteHeader } from '@/components/site-header';

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="min-h-[calc(100vh-4rem)]">
        <CreateDocumentGuard>
          <Suspense fallback={
            <LoadingScreen
              variant="presentation"
              fullScreen={false}
              className="min-h-[calc(100vh-4rem)] rounded-none"
            >
              <PresentationPageSkeleton />
            </LoadingScreen>
          }>
            <ErrorBoundary>
              <RealTimeGenerator />
            </ErrorBoundary>
          </Suspense>
        </CreateDocumentGuard>
      </main>
    </div>
  );
}
