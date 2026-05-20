'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Mail, Loader2 } from 'lucide-react';

interface NewsletterSubscribeProps {
  sourcePage?: string;
  onSuccess?: () => void;
  className?: string;
}

export function NewsletterSubscribe({
  sourcePage = 'homepage',
  onSuccess,
  className = '',
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [state, setState] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'already-subscribed'
  >('idle');
  const [message, setMessage] = useState('');
  const [errorType, setErrorType] = useState<
    'invalid-email' | 'duplicate' | 'server' | null
  >(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setState('error');
      setErrorType('invalid-email');
      setMessage('Please enter your email address');
      return;
    }

    setState('loading');
    setMessage('');
    setErrorType(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          sourcePage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');

        if (response.status === 400) {
          setErrorType('invalid-email');
          setMessage(data.error || 'Please enter a valid email address');
        } else if (response.status === 409) {
          setErrorType('duplicate');
          setMessage(data.error || 'This email is already in our newsletter');
        } else {
          setErrorType('server');
          setMessage(data.error || 'Something went wrong. Please try again.');
        }
        return;
      }

      if (data.alreadySubscribed) {
        setState('already-subscribed');
        setMessage(data.message);
      } else {
        setState('success');
        setSubmittedEmail(email.trim());
        setMessage(
          'A confirmation email has been sent. Please verify your email to complete your subscription. If you did not receive it, click resend below.'
        );
        setEmail(email.trim());
      }

      onSuccess?.();
    } catch (error) {
      setState('error');
      setErrorType('server');
      setMessage('Something went wrong. Please try again.');
      console.error('Newsletter subscription error:', error);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;

    setState('loading');
    setErrorType(null);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: submittedEmail,
          sourcePage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setErrorType('server');
        setMessage(data.error || 'Unable to resend confirmation email.');
        return;
      }

      setState('success');
      setMessage(
        'A new confirmation email has been sent. Please check your inbox and confirm your subscription.'
      );
    } catch (error) {
      setState('error');
      setErrorType('server');
      setMessage('Unable to resend confirmation email. Please try again.');
      console.error('Newsletter resend error:', error);
    }
  };


  const getStateStyles = () => {
    switch (state) {
      case 'loading':
        return 'opacity-75 cursor-not-allowed';
      case 'success':
        return 'border-green-500/50 bg-green-50/50 dark:bg-green-950/30';
      case 'error':
        return 'border-red-500/50 bg-red-50/50 dark:bg-red-950/30';
      case 'already-subscribed':
        return 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/30';
      default:
        return 'border-blue-200/50 dark:border-blue-500/30';
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${className}`}>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col gap-4 p-6 sm:p-8 rounded-2xl glass-effect border-2 transition-all duration-300 ${getStateStyles()}`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <Mail className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {state === 'success'
                ? '✓ Confirmation Sent!'
                : state === 'already-subscribed'
                  ? '✓ Already Subscribed'
                  : 'Join Our Newsletter'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {state === 'success'
                ? 'Please confirm your email from the message we sent. Your subscription is not active until confirmed.'
                : state === 'already-subscribed'
                  ? 'You are already subscribed. Thanks for joining!'
                  : 'Get updates on new features and AI capabilities'}
            </p>
          </div>
        </div>

        {/* Input */}
        {state !== 'success' && state !== 'already-subscribed' && (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'error') {
                    setState('idle');
                    setErrorType(null);
                    setMessage('');
                  }
                }}
                disabled={state === 'loading'}
                className={`flex-1 h-11 sm:h-12 px-4 text-base rounded-lg border-2 transition-all duration-200 ${
                  state === 'error'
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                } focus:outline-none focus:ring-0`}
              />
              <Button
                type="submit"
                disabled={state === 'loading'}
                className={`h-11 sm:h-12 px-6 sm:px-8 font-semibold transition-all duration-200 ${
                  state === 'loading'
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:scale-105 active:scale-95'
                }`}
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin inline" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`flex items-start gap-3 p-3 rounded-lg text-sm animate-fade-in ${
                  state === 'error'
                    ? 'bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}
              >
                {state === 'error' ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : null}
                <span>{message}</span>
              </div>
            )}
          </>
        )}

        {/* Success Message */}
        {(state === 'success' || state === 'already-subscribed') && (
          <div className="flex flex-col gap-4 p-4 rounded-lg bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300 animate-fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Great!</p>
                <p className="text-sm">{message}</p>
              </div>
            </div>
            {state === 'success' && submittedEmail && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={handleResend}
                  disabled={state === 'loading'}
                  className="w-full sm:w-auto"
                >
                  Resend confirmation email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.navigator.clipboard.writeText(submittedEmail)}
                  className="w-full sm:w-auto"
                >
                  Copy email
                </Button>
              </div>
            )}
            {state === 'success' && (
              <p className="text-xs text-green-700 dark:text-green-300">
                Note: Your email will be added to the newsletter only after you click the confirmation link.
              </p>
            )}
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
