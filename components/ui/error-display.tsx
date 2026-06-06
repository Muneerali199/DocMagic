'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorDisplayVariant = 'page' | 'card' | 'section';

interface ErrorDisplayProps {
  title: string;
  description: string;
  error?: (Error & { digest?: string }) | null;
  onRetry: () => void;
  retryLabel?: string;
  homeLabel?: string;
  homeHref?: string;
  variant?: ErrorDisplayVariant;
  beforeContent?: ReactNode;
  footer?: ReactNode;
}

const variantStyles: Record<ErrorDisplayVariant, {
  shell: string;
  card: string;
  iconWrap: string;
  icon: string;
  title: string;
  description: string;
  actions: string;
}> = {
  page: {
    shell: 'min-h-screen flex flex-col items-center justify-center text-center px-6 py-10 bg-gradient-to-b from-white to-gray-50',
    card: 'max-w-lg w-full',
    iconWrap: 'p-4 bg-red-50 rounded-full',
    icon: 'w-12 h-12 text-red-600',
    title: 'text-4xl font-bold mb-4 text-gray-900',
    description: 'text-lg text-gray-600 mb-8',
    actions: 'space-y-3 mb-8',
  },
  card: {
    shell: 'min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4',
    card: 'w-full max-w-md bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center space-y-6',
    iconWrap: 'w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto',
    icon: 'w-8 h-8 text-red-600',
    title: 'text-3xl font-bold text-gray-900',
    description: 'text-gray-600',
    actions: 'flex flex-col gap-3 pt-2',
  },
  section: {
    shell: 'min-h-[60vh] flex items-center justify-center p-4 relative overflow-hidden',
    card: 'glass-effect p-8 rounded-2xl shadow-2xl border border-red-500/20 text-center space-y-6 backdrop-blur-xl w-full max-w-md relative z-10',
    iconWrap: 'w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto',
    icon: 'w-10 h-10 text-red-500',
    title: 'text-2xl font-bold',
    description: 'text-muted-foreground text-sm',
    actions: 'grid grid-cols-2 gap-3',
  },
};

export function ErrorDisplay({
  title,
  description,
  error,
  onRetry,
  retryLabel = 'Try Again',
  homeLabel = 'Home',
  homeHref = '/',
  variant = 'page',
  beforeContent,
  footer,
}: ErrorDisplayProps) {
  const styles = variantStyles[variant];
  const isSection = variant === 'section';

  return (
    <div className={styles.shell}>
      {isSection && <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />}
      <div className={styles.card}>
        <div className="mb-8 flex justify-center">
          <div className={styles.iconWrap}>
            <AlertTriangle className={styles.icon} />
          </div>
        </div>

        {beforeContent}

        <div className="space-y-2">
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-red-700 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            onClick={onRetry}
            size="lg"
            className={isSection ? 'bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300' : 'w-full'}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
          <Button
            variant="outline"
            asChild
            size="lg"
            className={isSection ? 'rounded-xl border-yellow-400/20 hover:bg-yellow-400/5' : 'w-full'}
          >
            <Link href={homeHref}>
              <Home className="w-4 h-4 mr-2" />
              {homeLabel}
            </Link>
          </Button>
        </div>

        {footer}
      </div>
    </div>
  );
}
