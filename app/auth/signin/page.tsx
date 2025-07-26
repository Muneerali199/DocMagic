"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Zap, Star, Eye, EyeOff, Mail, Lock, ArrowRight, Wand2 } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: "Welcome back! ✨",
          description: "You've successfully signed in to DocMagic",
        });

        // Redirect to home page
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background elements matching landing page */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      
      {/* Floating orbs */}
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:w-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Enhanced card with glass effect */}
        <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-2xl border border-yellow-400/20 relative overflow-hidden">
          {/* Card shimmer effect */}
          <div className="absolute inset-0 shimmer opacity-30"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Star className="h-4 w-4 text-blue-500 animate-spin" style={{animationDuration: '3s'}} />
          </div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Welcome Back</span>
                <Wand2 className="h-4 w-4 text-blue-500" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Sign In to{" "}
                <span className="bolt-gradient-text">DocMagic</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Continue creating magical documents with AI
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                    placeholder="Enter your work email"
                    required
                    className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 pl-4 pr-4 py-3 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-md border border-yellow-400/20 pointer-events-none"></div>
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
                    className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 pl-4 pr-12 py-3 text-sm sm:text-base"
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
                  <div className="absolute inset-0 rounded-md border border-yellow-400/20 pointer-events-none"></div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
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