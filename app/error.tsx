'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorDisplay } from '@/components/ui/error-display';

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
    <ErrorDisplay
      title={isDeploymentError
        ? 'Service Temporarily Unavailable'
        : 'Oops! Something went wrong'}
      description={isDeploymentError
        ? "We're experiencing deployment issues. Our team is working to restore service. Please try again in a moment."
        : 'We encountered an unexpected error. Please try again or contact support if the problem persists.'}
      error={errorDetails ? error : null}
      onRetry={handleRetry}
      homeLabel="Back to Homepage"
      variant="page"
      beforeContent={
        <div className="mb-8">
          <Image
            src="/magic-hat.svg"
            alt="Error Illustration"
            width={300}
            height={200}
            className="w-full h-auto mx-auto opacity-75"
          />
        </div>
      }
      footer={
        <>
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
        </>
      }
    />
  );
}

