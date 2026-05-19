'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="glass-effect p-8 rounded-2xl shadow-2xl border border-red-500/20 text-center space-y-6 backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="modern-display text-3xl font-bold text-shadow-professional">
              Oops! Something went wrong
            </h1>
            <p className="modern-body text-muted-foreground">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
          </div>

          <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 mb-6">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
              {process.env.NODE_ENV === 'development' 
                ? (error.message || "An unknown error occurred")
                : "A system error occurred. Please try again or contact support if the issue persists."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button 
              onClick={() => reset()}
              className="bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button variant="outline" asChild className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5">
                <Link href="/auth/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground pt-4 border-t border-yellow-400/10">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

