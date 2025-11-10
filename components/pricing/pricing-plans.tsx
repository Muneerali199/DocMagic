'use client';

import { useState } from 'react';
import { Check, Zap, Users, Crown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const features = {
  individual: [
    'Unlimited presentations',
    'Unlimited resumes & CVs',
    'Unlimited letters',
    'AI-powered generation',
    'Premium templates',
    'Export to PDF/PPTX/DOCX',
    'Priority support',
    'No watermarks',
  ],
  organization: [
    'Everything in Individual',
    'Unlimited team members',
    'Team collaboration',
    'Brand customization',
    'Advanced analytics',
    'API access',
    'Dedicated support',
    'Custom templates',
    'SSO integration',
    'Admin dashboard',
  ],
};

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  plan_type: 'individual' | 'organization';
  billing_period: 'monthly' | 'yearly';
  price: number;
  stripe_price_id: string;
  features: string[];
  popular?: boolean;
}

export default function PricingPlans() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: '1',
      name: 'Free',
      description: 'Perfect for trying out DocMagic',
      plan_type: 'individual',
      billing_period: 'monthly',
      price: 0,
      stripe_price_id: '',
      features: [
        '3 documents per month',
        'Basic templates',
        'PDF export only',
        'Community support',
      ],
    },
    {
      id: '2',
      name: 'Individual',
      description: 'Perfect for individuals and freelancers',
      plan_type: 'individual',
      billing_period: billingPeriod,
      price: billingPeriod === 'monthly' ? 9.99 : 95.88,
      stripe_price_id: billingPeriod === 'monthly' 
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_INDIVIDUAL_MONTHLY || '')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_INDIVIDUAL_YEARLY || ''),
      features: features.individual,
      popular: true,
    },
    {
      id: '3',
      name: 'Organization',
      description: 'For teams and organizations',
      plan_type: 'organization',
      billing_period: billingPeriod,
      price: billingPeriod === 'monthly' ? 49.99 : 479.88,
      stripe_price_id: billingPeriod === 'monthly'
        ? (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ORGANIZATION_MONTHLY || '')
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ORGANIZATION_YEARLY || ''),
      features: features.organization,
    },
  ];

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.price === 0) {
      router.push('/auth/register');
      return;
    }

    try {
      setLoading(plan.id);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/signin?redirect=/pricing');
        return;
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ← This sends cookies!
        body: JSON.stringify({
          priceId: plan.stripe_price_id,
          planType: plan.plan_type,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade, downgrade, or cancel anytime.
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center mb-12">
        <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'yearly')} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-blue-500 border-2 shadow-xl' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {plan.plan_type === 'individual' && <Zap className="w-5 h-5 text-blue-600" />}
                {plan.plan_type === 'organization' && <Building2 className="w-5 h-5 text-purple-600" />}
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                )}
              </div>
              {billingPeriod === 'yearly' && plan.price > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  ${(plan.price / 12).toFixed(2)}/month billed annually
                </p>
              )}
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                onClick={() => handleSubscribe(plan)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? (
                  'Processing...'
                ) : plan.price === 0 ? (
                  'Get Started Free'
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Payment Methods Section */}
      <div className="mt-16 text-center">
        <h3 className="text-lg font-semibold mb-4">Secure Payment Methods</h3>
        <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">💳</span>
            <span className="text-sm font-medium">All Major Cards</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">🍎</span>
            <span className="text-sm font-medium">Apple Pay</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">🔵</span>
            <span className="text-sm font-medium">Google Pay</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium">Link</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">🔒</span>
            <span className="text-sm font-medium">PCI Secure</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Powered by Stripe • Digital wallets (Apple Pay, Google Pay) available in production
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">💳</span>
            <span className="text-sm font-medium">All Major Cards</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">�</span>
            <span className="text-sm font-medium">PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
            <span className="text-2xl">⚡</span>
            <span className="text-sm font-medium">Instant Activation</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          Powered by Stripe • Visa, Mastercard, Amex, Discover, and more accepted worldwide
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid gap-6">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-muted-foreground">
              Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), 
              plus digital wallets including Apple Pay, Google Pay, and Link for one-click checkout. 
              All payments are securely processed through Stripe and are PCI compliant.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
            <p className="text-muted-foreground">
              Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated amount. When downgrading, the change takes effect at the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee. If you're not satisfied with DocMagic, contact us within 30 days for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
