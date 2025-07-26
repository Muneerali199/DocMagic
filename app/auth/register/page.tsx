"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Zap, Star, Eye, EyeOff, Mail, Lock, User, ArrowRight, Wand2, Shield } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call our internal API route to register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      toast({
        title: "Account created successfully! ✨",
        description: "Welcome to DocMagic! You're now signed in.",
      });
      router.push("/");
      router.refresh();
    } catch (error: any) {
      // Enhanced error handling for Supabase registration
      let userMessage = "Failed to create account. Please try again.";
      if (error?.message) {
        if (
          error.message.includes("User already registered") ||
          error.message.includes("User already exists") ||
          error.message.includes("email address is already registered") ||
          error.message.includes("duplicate key value violates unique constraint")
        ) {
          userMessage = "An account with this email already exists. Please sign in or use a different email.";
        } else if (
          error.message.includes("Invalid email") ||
          error.message.includes("email is invalid")
        ) {
          userMessage = "Please enter a valid email address.";
        } else if (
          error.message.includes("Password should be at least") ||
          error.message.includes("Password is too short")
        ) {
          userMessage = "Password is too short. Please use at least 6 characters.";
        } else if (
          error.message.includes("rate limit") ||
          error.message.includes("Too many requests")
        ) {
          userMessage = "Too many attempts. Please wait a moment and try again.";
        } else {
          userMessage = error.message;
        }
      }
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim() && email.trim() && password.trim() && confirmPassword.trim() && password === confirmPassword && password.length >= 6;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background elements matching landing page */}
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
                <Wand2 className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Join the Magic</span>
                <Shield className="h-4 w-4 text-green-500" />
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Create Your{" "}
                <span className="bolt-gradient-text">DocMagic</span>{" "}
                Account
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Start creating professional documents with AI
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Name field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Full Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 pl-4 pr-4 py-3 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-0 rounded-md border border-yellow-400/20 pointer-events-none"></div>
                </div>
              </div>

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
                    placeholder="Enter a strong password (min. 6 characters)"
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

              {/* Confirm Password field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className={`glass-effect focus:ring-yellow-400/20 pl-4 pr-12 py-3 text-sm sm:text-base ${
                      confirmPassword && password !== confirmPassword 
                        ? "border-red-400/60 focus:border-red-400/80" 
                        : "border-yellow-400/30 focus:border-yellow-400/60"
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <div className={`absolute inset-0 rounded-md border pointer-events-none ${
                    confirmPassword && password !== confirmPassword 
                      ? "border-red-400/20" 
                      : "border-yellow-400/20"
                  }`}></div>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span>Passwords don't match</span>
                  </p>
                )}
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
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Create Account</span>
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
                  Already have an account?
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-1 text-sm font-medium bolt-gradient-text hover:scale-105 transition-transform duration-200"
                >
                  <Zap className="h-3 w-3" />
                  Sign In
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