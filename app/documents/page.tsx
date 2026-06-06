'use client';

import React, { Suspense } from 'react';
import { DocumentGeneratorEnhanced } from '@/components/documents/document-generator-enhanced';
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { SiteHeader } from "@/components/site-header";
import { LoadingScreen } from "@/components/loading-screen";
import { DashboardPageSkeleton } from "@/components/skeletons";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <SiteHeader />
      <main className="min-h-[calc(100vh-4rem)]">
        <CreateDocumentGuard>
          <Suspense fallback={
            <LoadingScreen
              variant="default"
              title="Loading Document Studio"
              description="Preparing your document tools and workspace..."
              fullScreen={false}
              className="min-h-[calc(100vh-4rem)] rounded-none"
            >
              <DashboardPageSkeleton />
            </LoadingScreen>
          }>
            <DocumentGeneratorEnhanced />
          </Suspense>
        </CreateDocumentGuard>
      </main>
    </div>
  );
}
