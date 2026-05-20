'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
  Home,
} from 'lucide-react';

export default function ConfirmNewsletterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const hasConfirmed = useRef(false);
  const [state, setState] = useState<
    'loading' | 'success' | 'error' | 'expired' | 'invalid'
  >('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if(hasConfirmed.current) return;
      hasConfirmed.current = true;
    const confirmSubscription = async () => {
      if (!token) {
        setState('invalid');
        setMessage('Invalid confirmation link. Please check your email again.');
        return;
      }

      try {
        const response = await fetch(
          `/api/newsletter/confirm?token=${encodeURIComponent(token)}`
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 410) {
            setState('expired');
            setMessage(
              data.error ||
                'Your confirmation link has expired. Please subscribe again.'
            );
          } else if (response.status === 404) {
            setState('invalid');
            setMessage(data.error || 'Invalid confirmation link.');
          } else {
            setState('error');
            setMessage(data.error || 'Something went wrong. Please try again.');
          }
          return;
        }

        setState('success');
        setMessage(
          data.message ||
            'Your subscription has been confirmed! Welcome to our newsletter.'
        );
      } catch (error) {
        setState('error');
        setMessage('Something went wrong. Please try again.');
        console.error('Confirmation error:', error);
      }
    };

    confirmSubscription();
  }, [token]);

  const getStateColor = () => {
    switch (state) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
      case 'expired':
      case 'invalid':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className={`h-16 w-16 animate-spin ${getStateColor()}`} />;
      case 'success':
        return <CheckCircle className={`h-16 w-16 ${getStateColor()}`} />;
      default:
        return <AlertCircle className={`h-16 w-16 ${getStateColor()}`} />;
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Card */}
          <div className="glass-effect rounded-3xl border-2 border-blue-200/50 dark:border-blue-500/30 p-8 sm:p-12 text-center backdrop-blur-xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {getStateIcon()}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {state === 'success' && 'Subscription Confirmed! ✨'}
              {state === 'loading' && 'Confirming Your Subscription...'}
              {state === 'error' && 'Oops! Something Went Wrong'}
              {state === 'expired' && 'Link Expired'}
              {state === 'invalid' && 'Invalid Link'}
            </h1>

            {/* Message */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto leading-relaxed">
              {message}
            </p>

            {/* Features - Show on success */}
            {state === 'success' && (
              <div className="bg-green-50/50 dark:bg-green-950/30 border border-green-200/50 dark:border-green-500/30 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  What's Next?
                </h3>
                <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                  <li>✓ Check your email for our welcome message</li>
                  <li>✓ Watch for weekly feature updates and tips</li>
                  <li>✓ Get access to exclusive offers and beta features</li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/" className="w-full sm:w-auto">
                <Button className="w-full">
                  <Home className="h-5 w-5 mr-2" />
                  Back to Home
                </Button>
              </Link>

              {state === 'success' && (
                <>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => router.refresh()}
                  >
                    Reload Status
                  </Button>
                </>
              )}

              {(state === 'expired' || state === 'invalid') && (
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    Subscribe Again
                    <Mail className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {state === 'success' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Reload this page after clicking the confirmation link to verify your subscription status.
              </p>
            )}

            {/* Help Text */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Having issues?{' '}
              <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>

          {/* Background Elements */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
