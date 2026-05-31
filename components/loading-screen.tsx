
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ringStyles = `
  @keyframes ringA {
    from, 4% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -330; }
    12% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -335; }
    32% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -595; }
    40%, 54% { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -660; }
    62% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -665; }
    82% { stroke-dasharray: 60 600; stroke-width: 30; stroke-dashoffset: -925; }
    90%, to { stroke-dasharray: 0 660; stroke-width: 20; stroke-dashoffset: -990; }
  }
  @keyframes ringB {
    from, 12% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -110; }
    20% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -115; }
    40% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -195; }
    48%, 62% { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -220; }
    70% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -225; }
    90% { stroke-dasharray: 20 200; stroke-width: 30; stroke-dashoffset: -305; }
    98%, to { stroke-dasharray: 0 220; stroke-width: 20; stroke-dashoffset: -330; }
  }
  @keyframes ringC {
    from { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: 0; }
    8% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -5; }
    28% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -175; }
    36%, 58% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -220; }
    66% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -225; }
    86% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -395; }
    94%, to { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -440; }
  }
  @keyframes ringD {
    from, 8% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: 0; }
    16% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -5; }
    36% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -175; }
    44%, 50% { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -220; }
    58% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -225; }
    78% { stroke-dasharray: 40 400; stroke-width: 30; stroke-dashoffset: -395; }
    86%, to { stroke-dasharray: 0 440; stroke-width: 20; stroke-dashoffset: -440; }
  }
  .ring-a { animation: ringA 2s linear infinite; }
  .ring-b { animation: ringB 2s linear infinite; }
  .ring-c { animation: ringC 2s linear infinite; }
  .ring-d { animation: ringD 2s linear infinite; }
  @media (prefers-reduced-motion: reduce) {
    .ring-a, .ring-b, .ring-c, .ring-d { animation: none; }
  }
`;

interface LoaderProps {
  size?: number;
  className?: string;
}

let stylesInjected = false;
export function Loader({ size = 96, className = "" }: LoaderProps) {
   if (!stylesInjected && typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = ringStyles;
    document.head.appendChild(style);
    stylesInjected = true;
  }
  return (
    <>
      <style>{ringStyles}</style>
      <svg
        viewBox="0 0 240 240"
        width={size}
        height={size}
        aria-label="Loading"
        className={className}
      >
        <circle
          className="ring-a"
          strokeLinecap="round"
          strokeDashoffset="-330"
          strokeDasharray="0 660"
          strokeWidth="20"
          stroke="currentColor"
          fill="none"
          r="105"
          cy="120"
          cx="120"
        />
        <circle
          className="ring-b"
          strokeLinecap="round"
          strokeDashoffset="-110"
          strokeDasharray="0 220"
          strokeWidth="20"
          stroke="currentColor"
          opacity="0.6"
          fill="none"
          r="35"
          cy="120"
          cx="120"
        />
        <circle
          className="ring-c"
          strokeLinecap="round"
          strokeDasharray="0 440"
          strokeWidth="20"
          stroke="currentColor"
          opacity="0.4"
          fill="none"
          r="70"
          cy="120"
          cx="85"
        />
        <circle
          className="ring-d"
          strokeLinecap="round"
          strokeDasharray="0 440"
          strokeWidth="20"
          stroke="currentColor"
          fill="none"
          r="70"
          cy="120"
          cx="155"
        />
      </svg>
    </>
  );
}

type LoadingVariant =
  | "default"
  | "resume"
  | "presentation"
  | "dashboard"
  | "letter"
  | "diagram"
  | "generation";

interface LoadingScreenProps {
  title?: string;
  description?: string;
  variant?: LoadingVariant;
  children?: ReactNode;
  fullScreen?: boolean;
  className?: string;
}

const variantCopy: Record<LoadingVariant, { title: string; description: string }> = {
  default: {
    title: "Loading DraftDeckAI",
    description: "Preparing your workspace...",
  },
  resume: {
    title: "Preparing Resume Studio",
    description: "Loading your editor, templates, and preview...",
  },
  presentation: {
    title: "Preparing Presentation Studio",
    description: "Setting up your slides and creative tools...",
  },
  dashboard: {
    title: "Loading Dashboard",
    description: "Fetching your documents and activity...",
  },
  letter: {
    title: "Preparing Letter Studio",
    description: "Setting up letter tools and preview...",
  },
  diagram: {
    title: "Preparing Diagram Studio",
    description: "Loading diagram tools and live preview...",
  },
  generation: {
    title: "Generating with AI",
    description: "Drafting a polished first version...",
  },
};

export function LoadingScreen({
  title,
  description,
  variant = "default",
  children,
  fullScreen = true,
  className,
}: LoadingScreenProps) {
  const copy = variantCopy[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative overflow-hidden bg-background text-foreground",
        fullScreen ? "min-h-screen" : "min-h-[420px] rounded-2xl",
        className
      )}
    >
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24" />
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_72%)]" />

      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-card/70 p-4 shadow-xl ring-1 ring-border/50 backdrop-blur">
            <Loader size={104} className="text-blue-600 dark:text-blue-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold sm:text-3xl">
              {title ?? copy.title}
            </h2>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">
              {description ?? copy.description}
            </p>
          </div>
        </div>

        {children ? <div className="w-full">{children}</div> : null}
      </div>
    </div>
  );
}

interface GenerationLoadingOverlayProps {
  show?: boolean;
  title?: string;
  description?: string;
  progress?: number;
  estimatedTime?: string;
  tips?: string[];
  variant?: LoadingVariant;
}

const defaultTips = [
  "Strong prompts include audience, tone, and final format.",
  "You can refine generated drafts after the first version appears.",
  "Specific examples help the AI match your intent more closely.",
];

export function GenerationLoadingOverlay({
  show = true,
  title = "Generating with AI",
  description = "Creating a polished draft for you...",
  progress,
  estimatedTime = "Usually under a minute",
  tips = defaultTips,
  variant = "generation",
}: GenerationLoadingOverlayProps) {
  if (!show) return null;

  const safeProgress =
    typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : null;
  const tipIndex =
    safeProgress === null ? 0 : Math.min(tips.length - 1, Math.floor(safeProgress / 34));

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4 py-8 backdrop-blur-md"
    >
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-border/60 bg-card/95 p-5 shadow-2xl sm:p-8">
        <div className="absolute inset-x-0 top-0 h-1 bolt-gradient" />
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-5 rounded-full bg-background/80 p-3 shadow-lg ring-1 ring-border/60">
              <Loader size={88} className="text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>

            <div className="mt-6 w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{estimatedTime}</span>
                <span>{safeProgress === null ? "Working..." : `${Math.round(safeProgress)}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bolt-gradient transition-all duration-500",
                    safeProgress === null && "w-2/3 animate-pulse"
                  )}
                  style={safeProgress === null ? undefined : { width: `${safeProgress}%` }}
                />
              </div>
            </div>

            <p className="mt-5 rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              {tips[tipIndex] ?? tips[0]}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="aspect-[4/5] rounded-2xl border border-border/60 bg-background p-5 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <div className="h-3 w-24 rounded-full bg-muted shimmer" />
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-8 w-3/4 rounded-lg bg-muted shimmer" />
                <div className="h-3 w-full rounded-full bg-muted shimmer" />
                <div className="h-3 w-5/6 rounded-full bg-muted shimmer" />
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="h-24 rounded-xl bg-muted shimmer" />
                  <div className="h-24 rounded-xl bg-muted shimmer" />
                </div>
                <div className="h-3 w-full rounded-full bg-muted shimmer" />
                <div className="h-3 w-4/5 rounded-full bg-muted shimmer" />
                <div className="h-20 rounded-xl bg-muted shimmer" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 hidden rounded-2xl border border-border/60 bg-card p-4 shadow-xl sm:block">
              <Loader size={42} className="text-yellow-500" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">{variant} loading</span>
    </div>
  );
}
