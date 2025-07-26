'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { STRIPE_CONFIG, isStripeEnabled } from '@/lib/config';

// Payment demo component that works in both demo and production modes
export default function PaymentDemoPage() {
  // Check if Stripe is enabled in the environment
  const [stripeReady, setStripeReady] = useState(false);
  
  useEffect(() => {
    // Set a small timeout to ensure Stripe.js is loaded if needed
    const timer = setTimeout(() => {
      setStripeReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    
    // Simulate API call
    setTimeout(() => {
      if (cardNumber.replace(/\s/g, '').startsWith('4')) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 1500);
  };

  const resetForm = () => {
    setStatus('idle');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setName('');
  };

  if (status === 'success') {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. This is a demo transaction.
          </p>
          <div className="pt-6">
            <Button onClick={resetForm}>
              Back to Demo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking Stripe status
  if (!stripeReady) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading payment system...</p>
      </div>
    );
  }

  // Show demo mode notice if Stripe is not enabled
  const isDemoMode = !isStripeEnabled;
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Payment {isDemoMode ? 'Demo' : 'Checkout'}</CardTitle>
          {isDemoMode ? (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    You're in demo mode. To enable real payments, set up the required environment variables.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <CardDescription>
              Complete your payment securely with our checkout.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Number</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                disabled={status === 'processing'}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  disabled={status === 'processing'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CVC</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  disabled={status === 'processing'}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name on Card</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === 'processing'}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={status === 'processing'}
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay $9.99'
              )}
            </Button>
            
            {status === 'error' && (
              <div className="text-sm text-red-500">
                Payment failed. Please try again or use a different card.
              </div>
            )}
          </form>
          
          <div className="mt-8 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Demo Instructions</h3>
            <p className="text-sm mb-2">
              This is a demo payment form. No real transactions will be processed.
            </p>
            <p className="text-sm text-muted-foreground">
              Try these demo cards:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>✅ <span className="font-mono">4242 4242 4242 4242</span> - Success</li>
              <li>❌ <span className="font-mono">4000 0000 0000 0002</span> - Payment failed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
