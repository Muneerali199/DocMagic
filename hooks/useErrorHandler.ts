import { useEffect, useCallback } from 'react';

interface ErrorContext {
  message: string;
  stack?: string;
  digest?: string;
  timestamp: number;
  pathname: string;
  userAgent: string;
}

/**
 * Custom hook for global error handling and logging
 * Catches unhandled errors and sends them to monitoring services
 */
export function useErrorHandler() {
  const logError = useCallback(async (error: ErrorContext) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global Error Handler:', error);
    }

    // Send to monitoring service (e.g., Sentry, LogRocket)
    try {
      await fetch('/api/logs/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...error,
          environment: process.env.NODE_ENV,
          url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        }),
      });
    } catch (fetchError) {
      console.error('Failed to log error:', fetchError);
    }
  }, []);

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      });
    };

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      logError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [logError]);

  return { logError };
}
