'use client';

import { useEffect } from 'react';
import Link from 'next/link';

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
    <html>
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, white, #f9fafb)',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
            
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#111827',
            }}>
              Critical Error
            </h1>
            
            <p style={{
              fontSize: '1.125rem',
              color: '#4b5563',
              marginBottom: '2rem',
              lineHeight: '1.5',
            }}>
              We encountered a critical error. Our team has been notified and is working to fix it.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'left',
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: '#991b1b',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}>
                  Error Details:
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#7f1d1d',
                  wordBreak: 'break-word',
                }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#7f1d1d',
                    marginTop: '0.5rem',
                  }}>
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <button
                onClick={() => reset()}
                style={{
                  width: '100%',
                  background: '#4f46e5',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#4338ca')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#4f46e5')}
              >
                Try Again
              </button>

              <a
                href="/"
                style={{
                  display: 'block',
                  background: '#d1d5db',
                  color: '#1f2937',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#b4b8c0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#d1d5db')}
              >
                Go to Homepage
              </a>
            </div>

            <p style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginTop: '2rem',
            }}>
              If the problem persists, please{' '}
              <a href="/contact" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
