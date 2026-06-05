import type { ReactNode } from "react";
import {
  DiagramGeneratorSkeleton,
  DocumentCardSkeleton,
  LetterGeneratorSkeleton,
  PresentationPreviewSkeleton,
  ResumeGeneratorSkeleton,
  Skeleton,
} from "@/components/ui/skeleton";

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full justify-center px-4" aria-hidden="true">
      <div className="glass-effect w-full max-w-5xl rounded-2xl border border-border/30 p-5 shadow-xl sm:p-8">
        {children}
      </div>
    </div>
  );
}

export function ResumePageSkeleton() {
  return (
    <PageShell>
      <ResumeGeneratorSkeleton />
    </PageShell>
  );
}

export function PresentationPageSkeleton() {
  return (
    <PageShell>
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <PresentationPreviewSkeleton />
      </div>
    </PageShell>
  );
}

export function DashboardPageSkeleton() {
  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-effect rounded-xl border border-border/20 p-4">
              <Skeleton className="mb-4 h-8 w-8 rounded-lg" />
              <Skeleton className="mb-2 h-6 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <DocumentCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export function LetterPageSkeleton() {
  return (
    <PageShell>
      <LetterGeneratorSkeleton />
    </PageShell>
  );
}

export function DiagramPageSkeleton() {
  return (
    <PageShell>
      <DiagramGeneratorSkeleton />
    </PageShell>
  );
}
