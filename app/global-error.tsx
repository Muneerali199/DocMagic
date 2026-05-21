'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Global error boundary for uncaught errors at the application level
 * This catches errors that occur outside of specific page/layout error boundaries
 */
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
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
