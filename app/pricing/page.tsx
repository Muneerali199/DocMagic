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
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300`;
      case 'premium':
        return `${baseClasses} bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden content-center">
        {/* Animated background elements matching landing page */}
          <div className="absolute inset-0 mesh-gradient opacity-20"></div>
          
          {/* Floating orbs - matching landing page */}
          <div className="floating-orb w-40 h-40 sm:w-64 sm:h-64 bolt-gradient opacity-15 top-20 -left-20 sm:-left-32"></div>
          <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-20 -top-10 right-10 sm:right-20"></div>
          <div className="floating-orb w-48 h-48 sm:w-72 sm:h-72 bolt-gradient opacity-10 bottom-10 left-1/3"></div>
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
            }}
          />
      <SiteHeader />
      <main className="flex-1 relative z-10 flex items-center justify-center">
        {/* Pricing Section with matching background elements */}
        <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
            
          <div className="container relative z-10 px-4 sm:px-6 lg:px-8">            
            {/* Header matching landing page style */}
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              {/* Badge matching landing page style */}
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-effect mb-6 sm:mb-8 shimmer">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 animate-pulse" />
                <span className="text-sm sm:text-base font-medium">Pricing Plans</span>
                <Wand2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 animate-bounce" />
              </div>
              
              {/* Modern heading matching landing page typography */}
              
              <h1 className="modern-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center mb-6 sm:mb-8">
                Choose Your{" "}
                <span className="bolt-gradient-text relative inline-block">
                  Perfect Plan
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500 animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                </span>
              </h1>
          
              
              {/* Modern subtitle matching landing page style */}
              <p className="modern-body text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
                Transform your document workflow with{" "}
                <span className="font-semibold text-yellow-600">DocMagic</span>{" "}
                Start free and scale as you grow with{" "}
                <span className="font-semibold bolt-gradient-text">magical precision</span>
              </p>
              
              {/* Stats bar matching landing page */}
              
              <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8">
                <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:scale-105 transition-transform duration-300">
                  <span className="bolt-gradient-text font-bold text-sm sm:text-base">3</span>
                  <span className="text-muted-foreground text-xs sm:text-sm ml-1">Plans Available</span>
                </div>
                <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:scale-105 transition-transform duration-300">
                  <span className="bolt-gradient-text font-bold text-sm sm:text-base">FREE</span>
                  <span className="text-muted-foreground text-xs sm:text-sm ml-1">Trial</span>
                </div>
                <div className="glass-effect px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:scale-105 transition-transform duration-300">
                  <span className="bolt-gradient-text font-bold text-sm sm:text-base">24/7</span>
                  <span className="text-muted-foreground text-xs sm:text-sm ml-1">Support</span>
                </div>
              </div>
            </div>
           

            {/* Enhanced Pricing Cards with animations */}
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`animate-bounce-in delay-${(index + 1) * 100} will-change-transform relative professional-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                    plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold shimmer">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 glass-effect ${
                        plan.popular ? 'bolt-gradient-text' : 'text-muted-foreground'
                      }`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-2xl font-bold mb-2 bolt-gradient-text">{plan.name}</h3>
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-5xl font-bold bolt-gradient-text">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </div>
                      <p className="text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Features List */}
                    <div className="mb-8">
                      <ul className="space-y-4">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-3 ${
                              feature.included 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Check className="w-3 h-3" />
                            </div>
                            <span className={`text-sm ${
                              feature.included ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <button className={getButtonClasses(plan.ctaVariant, plan.popular)}>
                      {plan.ctaText}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA matching landing page style */}
            <div className="text-center mt-16">
              <div className="professional-card p-8 max-w-4xl mx-auto rounded-2xl relative overflow-hidden hover:scale-105 transition-transform duration-300">
                {/* Background shimmer effect */}
                <div className="absolute inset-0 shimmer opacity-30"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 animate-pulse" />
                    <h3 className="text-2xl font-bold bolt-gradient-text">
                      Need a custom solution?
                    </h3>
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 animate-pulse" />
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Contact our sales team to discuss enterprise features, custom integrations, and volume discounts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-3 glass-effect rounded-lg font-semibold hover:scale-105 transition-all duration-300">
                      Schedule Demo
                    </button>
                    <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors hover:scale-105 duration-300">
                      Contact Sales
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators matching landing page style */}
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground mb-4">Trusted by 10,000+ professionals worldwide</p>
              <div className="flex items-center justify-center space-x-2 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
                <span className="text-muted-foreground ml-2">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Professional Footer matching landing page */}
      <footer className="relative overflow-hidden footer-professional">
        {/* Background elements matching landing page */}
        <div className="absolute inset-0 mesh-gradient opacity-10"></div>
        <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-10 top-10 -left-16"></div>
        <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-15 bottom-10 -right-12"></div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          }}
        />
        
        <div className="container px-4 sm:px-6 lg:px-8 py-12 sm:py-16 mx-auto relative z-10 "> 
          {/* Professional Stats section */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 mb-8">
            <div className="professional-card px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-xs sm:text-sm font-medium professional-text">Secure & Private</span>
              </div>
            </div>
            <div className="professional-card px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs sm:text-sm font-medium professional-text">Lightning Fast</span>
              </div>
            </div>
            <div className="professional-card px-4 sm:px-6 py-3 sm:py-4 rounded-full hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium professional-text">5-Star Rated</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}