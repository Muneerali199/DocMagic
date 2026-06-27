'use client';

import { useEffect } from 'react';
import { ErrorDisplay } from '@/components/ui/error-display';

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

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ErrorDisplay
          title="Critical Error"
          description="We encountered a critical error. Our team has been notified."
          error={error}
          onRetry={reset}
          homeLabel="Go to Homepage"
          variant="card"
        />
      </body>
    </html>
  );
}

