'use client';

import { useEffect } from 'react';
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
    console.error('Global application error:', error);
  }, [error]);

  // Return a regular fragment / element tree — do not render <html> or <body>
  // (those are provided by the app root layout in Next.js App Router).
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Critical Error</h1>
            <p className="text-gray-600">
              We encountered a critical error. Our team has been notified.
            </p>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <p className="text-xs font-mono font-bold text-red-700 mb-2">Error Details:</p>
              <p className="text-xs text-red-600 break-words">{error.message}</p>
            </div>
          )}
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={() => reset()} size="lg" className="w-full">
              <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = '/')} size="lg" className="w-full">
              <Home className="w-4 h-4 mr-2" /> Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

