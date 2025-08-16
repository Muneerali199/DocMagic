"use client"
import React from 'react';
import { Check, Star, Zap, Crown, Sparkles, Wand2, ArrowDown, Shield, Globe, Heart, Coffee } from 'lucide-react';
import { SiteHeader } from "@/components/site-header";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  popular?: boolean;
  ctaText: string;
  ctaVariant: 'primary' | 'secondary' | 'premium';
  icon: React.ReactNode;
}

export default function PricingPage() {
  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for individuals getting started with document automation",
      icon: <Star className="w-6 h-6" />,
      features: [
        { text: "5 documents per month", included: true },
        { text: "Basic templates", included: true },
        { text: "PDF export", included: true },
        { text: "Email support", included: true },
        { text: "Advanced templates", included: false },
        { text: "Team collaboration", included: false },
        { text: "API access", included: false },
        { text: "Priority support", included: false },
      ],
      ctaText: "Get Started",
      ctaVariant: "secondary"
    },
    {
      name: "Professional",
      price: "$19",
      period: "/month",
      description: "Ideal for professionals and small teams who need more power",
      icon: <Zap className="w-6 h-6" />,
      popular: true,
      features: [
        { text: "100 documents per month", included: true },
        { text: "Advanced templates", included: true },
        { text: "PDF & Word export", included: true },
        { text: "Team collaboration (5 users)", included: true },
        { text: "Email & chat support", included: true },
        { text: "Custom branding", included: true },
        { text: "API access", included: false },
        { text: "Priority support", included: false },
      ],
      ctaText: "Start Free Trial",
      ctaVariant: "primary"
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "/month",
      description: "Advanced features for large teams and organizations",
      icon: <Crown className="w-6 h-6" />,
      features: [
        { text: "Unlimited documents", included: true },
        { text: "All premium templates", included: true },
        { text: "All export formats", included: true },
        { text: "Unlimited team members", included: true },
        { text: "Priority support", included: true },
        { text: "Custom integrations", included: true },
        { text: "Full API access", included: true },
        { text: "Dedicated account manager", included: true },
      ],
      ctaText: "Contact Sales",
      ctaVariant: "premium"
    }
  ];

  const getButtonClasses = (variant: string, popular?: boolean) => {
    const baseClasses = "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/20`;
      case 'secondary':
        return `${baseClasses} bg-white text-gray-800 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300`;
      case 'premium':
        return `${baseClasses} bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/20`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/50 via-white to-gray-50/20 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 [background:radial-gradient(circle_800px_at_100px_200px,#3b82f640,transparent)] dark:[background:radial-gradient(circle_800px_at_100px_200px,#3b82f620,transparent)]"></div>
        <div className="absolute inset-0 [background:radial-gradient(circle_800px_at_80%_80%,#ec489940,transparent)] dark:[background:radial-gradient(circle_800px_at_80%_80%,#ec489920,transparent)]"></div>
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-r from-amber-200/40 to-pink-300/40 blur-3xl opacity-30 dark:opacity-20 animate-float"></div>
      <div className="absolute bottom-20 -left-24 w-72 h-72 rounded-full bg-gradient-to-r from-blue-200/40 to-cyan-300/40 blur-3xl opacity-30 dark:opacity-20 animate-float-delay"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/40 to-teal-300/40 blur-3xl opacity-30 dark:opacity-20 transform -translate-x-1/2 -translate-y-1/2 animate-float-slow"></div>

      <SiteHeader />
      
      <main className="flex-1 relative z-10">
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                Simple, transparent pricing
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Pricing built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">every team</span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Choose the perfect plan for your needs. Start small and upgrade as you grow.
              </p>
            </div>

            {/* Pricing cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border bg-white dark:bg-gray-900/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-lg ${
                    plan.popular 
                      ? 'ring-2 ring-blue-500 border-blue-500/20 dark:ring-blue-400 dark:border-blue-400/30 scale-[1.02]' 
                      : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="h-full flex flex-col">
                    <div className="mb-6">
                      <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                        plan.popular 
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        {plan.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <div className="flex items-baseline mb-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">{plan.period}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{plan.description}</p>
                    </div>
                    
                    <div className="flex-1 mb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <div className={`flex-shrink-0 mt-0.5 mr-3 ${
                              feature.included 
                                ? 'text-blue-500 dark:text-blue-400' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`}>
                              <Check className="w-5 h-5" />
                            </div>
                            <span className={`text-sm ${
                              feature.included 
                                ? 'text-gray-700 dark:text-gray-200' 
                                : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button className={getButtonClasses(plan.ctaVariant, plan.popular)}>
                      {plan.ctaText}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enterprise CTA */}
            <div className="mt-16 text-center">
              <div className="inline-block bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Need enterprise features?</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm max-w-lg mx-auto">
                  We offer custom solutions for large organizations with specific requirements.
                </p>
                <button className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-800">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Trusted by thousands of teams</h2>
              <div className="flex justify-center items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} DocMagic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}