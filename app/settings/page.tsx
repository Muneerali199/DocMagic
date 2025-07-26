'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Star, Crown, Shield, Settings, CreditCard, User as UserIcon, Mail, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
      return;
    }
  }, [user, authLoading, router]);

  // Fetch subscription status
  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*, subscription:subscriptions(*)')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setSubscribed(!!data.subscription && data.subscription.length > 0);
        } else {
          setSubscribed(false);
        }
      } catch {
        setSubscribed(false);
      }

      setIsLoading(false);
    }

    if (user) {
      fetchSubscription();
    }
  }, [user, supabase]);

  // Call your backend to create a Stripe checkout session
  async function handleSubscribe() {
    setIsLoading(true);
    const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
    if (res.ok) {
      const { url } = await res.json();
      if (url) window.location.href = url;
      else alert('Failed to create checkout session');
    } else {
      alert('Failed to create checkout session');
    }
    setIsLoading(false);
  }

  // Call your backend to create a billing portal session
  async function handleManage() {
    setIsLoading(true);
    const res = await fetch('/api/stripe/create-portal', { method: 'POST' });
    if (res.ok) {
      const { url } = await res.json();
      if (url) window.location.href = url;
      else alert('Failed to create billing portal session');
    } else {
      alert('Failed to create billing portal session');
    }
    setIsLoading(false);
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        <div className="floating-orb w-32 h-32 bolt-gradient opacity-15 top-20 -left-24"></div>
        <div className="floating-orb w-24 h-24 bolt-gradient opacity-20 bottom-20 -right-18"></div>
        
        <div className="glass-effect p-8 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
            <span className="bolt-gradient-text font-medium">Loading your settings...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements matching landing page */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
            <Settings className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Account Settings</span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Your <span className="bolt-gradient-text">DocMagic</span> Account
          </h1>
          <p className="text-muted-foreground">
            Manage your profile, subscription, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass-effect border-yellow-400/20 relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-20"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-yellow-400/30">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.name || user?.email} />
                  <AvatarFallback className="bolt-gradient text-white font-bold text-lg">
                    {(user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user?.user_metadata?.name || 'User'}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user?.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member since
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(user?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Status
                  </span>
                  <Badge className="bolt-gradient text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="glass-effect border-yellow-400/20 relative overflow-hidden lg:col-span-2">
            <div className="absolute inset-0 shimmer opacity-20"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 bolt-gradient-text" />
                Subscription Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {subscribed ? (
                      <>
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold text-lg bolt-gradient-text">Pro Plan</span>
                        <Badge className="bolt-gradient text-white">
                          <Zap className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold text-lg">Free Plan</span>
                        <Badge variant="outline">
                          Basic
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {subscribed ? (
                      <>
                        <p className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          Unlimited document generation
                        </p>
                        <p className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-blue-500" />
                          Premium templates & features
                        </p>
                        <p className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-green-500" />
                          Priority AI processing
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-muted-foreground" />
                          5 documents per month
                        </p>
                        <p className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-muted-foreground" />
                          Basic templates only
                        </p>
                        <p className="flex items-center gap-2">
                          <Zap className="h-3 w-3 text-muted-foreground" />
                          Standard processing
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {subscribed ? (
                    <Button
                      onClick={handleManage}
                      disabled={isLoading}
                      className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <Settings className="h-4 w-4 mr-2" />
                      )}
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <Crown className="h-4 w-4 mr-2" />
                      )}
                      Upgrade to Pro
                    </Button>
                  )}
                  
                  {!subscribed && (
                    <p className="text-xs text-center text-muted-foreground">
                      Unlock unlimited magic ✨
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card className="glass-effect border-yellow-400/20 relative overflow-hidden mt-6">
          <div className="absolute inset-0 shimmer opacity-20"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 bolt-gradient-text" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 glass-effect rounded-xl">
                <div className="bolt-gradient-text text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Documents Created</div>
              </div>
              <div className="text-center p-4 glass-effect rounded-xl">
                <div className="bolt-gradient-text text-2xl font-bold">4</div>
                <div className="text-sm text-muted-foreground">Templates Used</div>
              </div>
              <div className="text-center p-4 glass-effect rounded-xl">
                <div className="bolt-gradient-text text-2xl font-bold">98%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}