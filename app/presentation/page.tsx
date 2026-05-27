"use client";
import React, { Suspense } from 'react';
import RealTimeGenerator from '@/components/presentation/real-time-generator';
import { CreateDocumentGuard } from "@/components/ui/auth-guard";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function PresentationPage() {
  return (
    <CreateDocumentGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <ErrorBoundary>
          <RealTimeGenerator />
        </ErrorBoundary>
      </Suspense>
    </CreateDocumentGuard>
  );
}
