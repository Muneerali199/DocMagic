"use client";
import React, { Suspense } from 'react';
import RealTimeGenerator from '@/components/presentation/real-time-generator';
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingScreen } from '@/components/loading-screen';
import { PresentationPageSkeleton } from '@/components/skeletons';

export default function PresentationPage() {
  return (
    <CreateDocumentGuard>
      <Suspense fallback={
        <LoadingScreen variant="presentation">
          <PresentationPageSkeleton />
        </LoadingScreen>
      }>
        <ErrorBoundary>
          <RealTimeGenerator />
        </ErrorBoundary>
      </Suspense>
    </CreateDocumentGuard>
  );
}
