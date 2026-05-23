'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home, HelpCircle } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
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
  const { logError } = useErrorHandler();
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isDeploymentError, setIsDeploymentError] = useState(false);

  useEffect(() => {
    // Log error to console and monitoring
    console.error('Application Error:', error);
    
    // Check if this is a deployment-related error
    const errorMessage = error?.message || '';
    const isDeployment = errorMessage.includes('DEPLOYMENT_NOT_FOUND') || 
                         errorMessage.includes('deployment') ||
                         errorMessage.includes('503') ||
                         errorMessage.includes('504');
    
    setIsDeploymentError(isDeployment);
    setErrorDetails(errorMessage);

    // Log to monitoring service
    logError({
      message: errorMessage,
      stack: error?.stack,
      digest: error?.digest,
      timestamp: Date.now(),
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    });
  }, [error, logError]);

  const handleRetry = () => {
    // Clear any cached data before retry
    if (typeof window !== 'undefined') {
      // Clear session storage
      sessionStorage.clear();
    }
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-10 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-lg w-full">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-red-50 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Illustration */}
        <div className="mb-8">
          <Image
            src="/magic-hat.svg"
            alt="Error Illustration"
            width={300}
            height={200}
            className="w-full h-auto mx-auto opacity-75"
          />
        </div>

        {/* Error Title */}
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          {isDeploymentError 
            ? "Service Temporarily Unavailable" 
            : "Oops! Something went wrong"}
        </h1>

        {/* Error Description */}
        <p className="text-lg text-gray-600 mb-8">
          {isDeploymentError
            ? "We're experiencing deployment issues. Our team is working to restore service. Please try again in a moment."
            : "We encountered an unexpected error. Please try again or contact support if the problem persists."}
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm font-mono text-red-700 break-words">
              {errorDetails}
            </p>
            {error?.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button
            onClick={handleRetry}
            size="lg"
            className="w-full"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Link href="/" className="w-full block">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Additional Help Links */}
        <div className="border-t pt-8 space-y-4 text-sm">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <HelpCircle className="w-4 h-4" />
            <p>Need help?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/contact" className="text-indigo-600 hover:underline hover:text-indigo-700">
              Contact Support
            </Link>
            <Link href="/documentation" className="text-indigo-600 hover:underline hover:text-indigo-700">
              View Documentation
            </Link>
            <a 
              href="https://status.example.com" 
              className="text-indigo-600 hover:underline hover:text-indigo-700"
            >
              Check Service Status
            </a>
          </div>
        </div>

        {/* Status Message */}
        {isDeploymentError && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              📢 <strong>Status:</strong> We're monitoring the situation and expect to be back online shortly.
            </p>
          </div>
        )}
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

