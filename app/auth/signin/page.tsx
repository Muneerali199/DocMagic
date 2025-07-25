"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isDevelopmentMode } from "@/lib/mock-auth";
import { Sparkles, Zap, Star, Eye, EyeOff, Mail, Lock, ArrowRight, Wand2, Shield } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSigningIn, setAutoSigningIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Auto sign-in in development mode
  useEffect(() => {
    if (isDevelopmentMode()) {
      setAutoSigningIn(true);
      setTimeout(() => {
        toast({
          title: "Development Mode Auto Sign-In ✨",
          description: "You've been automatically signed in as test@example.com",
        });
        router.push("/analytics");
      }, 1500);
    }
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back! ✨",
          description: "You've successfully signed in to DocMagic",
        });
        router.push("/analytics");
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevSignIn = async () => {
    if (!isDevelopmentMode()) return;
    
    setIsLoading(true);
    try {
      toast({
        title: "Development Sign In ✨",
        description: "Signed in with development credentials",
      });
      router.push("/analytics");
    } catch (error: any) {
      toast({
        title: "Development Sign In Failed",
        description: error.message || "Failed to sign in with development credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto sign-in loading state with same styling as register page
  if (autoSigningIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
        {/* Background elements matching register page */}
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        
        {/* Floating orbs */}
        <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
        <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
        
        <div className="w-full max-w-md mx-4 relative z-10">
          <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-400/20 relative overflow-hidden">
            <div className="text-center py-8">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-600"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                <span className="bolt-gradient-text">Development Mode</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                Auto-signing you in as test@example.com...
              </p>
              <div className="glass-effect p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <ArrowRight className="h-3 w-3" />
                  Redirecting to Analytics Dashboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = email.trim() && password.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background elements matching register page */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      
      {/* Floating orbs */}
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Enhanced card with glass effect - same as register */}
        <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-2xl border border-blue-400/20 relative overflow-hidden">
          {/* Card shimmer effect */}
          <div className="absolute inset-0 shimmer opacity-30"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Star className="h-4 w-4 text-blue-500 animate-spin" style={{animationDuration: '3s'}} />
          </div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
                <Wand2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Welcome Back</span>
                <Shield className="h-4 w-4 text-green-500" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Sign In to{" "}
                <span className="bolt-gradient-text">DocMagic</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Continue creating professional documents with AI
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="glass-effect border-blue-400/30 focus:border-blue-400/60 focus:ring-blue-400/20 pl-4 pr-4 py-3 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-md border border-blue-400/20 pointer-events-none"></div>
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="glass-effect border-blue-400/30 focus:border-blue-400/60 focus:ring-blue-400/20 pl-4 pr-12 py-3 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className="absolute inset-0 rounded-md border border-blue-400/20 pointer-events-none"></div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bolt-gradient text-white font-semibold py-3 sm:py-4 rounded-xl hover:scale-105 transition-all duration-300 bolt-glow relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </div>
                
                {/* Button shimmer effect */}
                {!isLoading && (
                  <div className="absolute inset-0 shimmer opacity-30"></div>
                )}
              </Button>
              
              {/* Development mode quick sign-in */}
              {isDevelopmentMode() && (
                <Button
                  type="button"
                  onClick={handleDevSignIn}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-2 border-orange-400/50 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-300 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    <span>Quick Sign In (Development)</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              )}
            </form>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center">
              <div className="glass-effect p-4 rounded-xl">
                <p className="text-sm text-muted-foreground mb-2">
                  Don't have an account?
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-1 text-sm font-medium bolt-gradient-text hover:scale-105 transition-transform duration-200"
                >
                  <Zap className="h-3 w-3" />
                  Create Account
                  <Sparkles className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Additional links */}
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-xs text-muted-foreground hover:bolt-gradient-text transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
