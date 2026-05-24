'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global error boundary for uncaught errors at the application level
 * This catches errors that occur outside of specific page/layout error boundaries
 */
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
    
    // In production, you might want to send this to a monitoring service
    // Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              {/* Title and Message */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Critical Error
                </h1>
                <p className="text-gray-600">
                  We encountered a critical error. Our team has been notified and is working to fix it.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-xs font-mono font-bold text-red-700 mb-2">
                    Error Details:
                  </p>
                  <p className="text-xs text-red-600 break-words">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-2">
                      Digest: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={() => reset()}
                  size="lg"
                  className="w-full"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  size="lg"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </div>

              {/* Support Link */}
              <p className="text-sm text-gray-600 pt-4 border-t border-gray-200">
                If the problem persists, please{' '}
                <a href="/contact" className="text-indigo-600 hover:underline font-semibold">
                  contact support
                </a>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none"></div>
          
          <div className="w-full max-w-md relative z-10">
            <div className="glass-effect p-8 rounded-2xl shadow-2xl border border-red-500/20 text-center space-y-6 backdrop-blur-xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="modern-display text-3xl font-bold text-shadow-professional">
                  System Error
                </h1>
                <p className="modern-body text-muted-foreground">
                  A critical system error occurred. We've been notified and are working on it.
                </p>
              </div>

              <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 mb-6">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                  {process.env.NODE_ENV === 'development' 
                    ? (error.message || "An unexpected system error occurred")
                    : "A critical system error occurred. Please refresh the page or contact support."
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => reset()}
                  className="bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Restart Application
                </Button>
                
                <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground pt-4 border-t border-yellow-400/10">
                DraftDeckAI Premium Experience
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

