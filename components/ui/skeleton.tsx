import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Document Card Skeleton
export function DocumentCardSkeleton() {
  return (
    <div className="glass-effect p-6 rounded-2xl border border-border/20 hover:scale-105 transition-transform duration-300">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

// Resume Generator Skeleton
export function ResumeGeneratorSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tabs Skeleton */}
      <div className="flex justify-center mb-6">
        <div className="glass-effect border border-yellow-400/20 p-1 rounded-lg flex gap-2">
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
          <Skeleton className="h-12 w-28 rounded-lg" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
          <ResumePreviewSkeleton />
        </div>
      </div>
    </div>
  );
}

// Letter Generator Skeleton
export function LetterGeneratorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Form */}
        <div className="space-y-6">
          {/* Letter Type Selection */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <LetterPreviewSkeleton />
        </div>
      </div>
    </div>
  );
}

// Letter Preview Skeleton
export function LetterPreviewSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 space-y-6 min-h-[600px]">
      {/* Header */}
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-32 ml-auto" />
        <Skeleton className="h-4 w-40 ml-auto" />
        <Skeleton className="h-4 w-36 ml-auto" />
      </div>

      {/* Date */}
      <div className="pt-4">
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Recipient */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Subject */}
      <div className="pt-4">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Salutation */}
      <div className="pt-4">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Body Paragraphs */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            {i < 2 && <div className="py-2" />}
          </div>
        ))}
      </div>

      {/* Closing */}
      <div className="pt-6 space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="pt-8">
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}

// Slide Outline Skeleton
export function SlideOutlineSkeleton() {
  return (
    <div className="glass-effect border-yellow-400/20 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Presentation Preview Skeleton
export function PresentationPreviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 rounded-lg border border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4 text-center w-2/3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
              <Skeleton className="h-4 w-4/5 mx-auto" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-3 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// Resume Preview Skeleton
export function ResumePreviewSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 border-b pb-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Settings Page Skeleton
export function SettingsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 bolt-gradient opacity-20 bottom-20 -right-18"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-48 mx-auto" />
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>

          {/* Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-effect p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Skeleton
export function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-full">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

// Form Input Skeleton
export function FormInputSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Template Card Skeleton
export function TemplateCardSkeleton() {
  return (
    <div className="glass-effect p-4 rounded-2xl border border-border/20 space-y-3">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export { Skeleton };
