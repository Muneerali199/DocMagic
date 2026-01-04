"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Zap,
  Star,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  Wand2,
  Shield,
  Check,
  Loader2,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    
    // Check if we have the required tokens/codes in URL
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If there's a code in URL, exchange it for session
        const code = searchParams ? searchParams.get('code') : null;
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setError("Invalid or expired reset link. Please request a new one.");
          }
        } else if (!session) {
          // No code and no session - might be a hash-based flow
          // Supabase handles this automatically in some cases
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          if (!accessToken) {
            // Wait a moment for Supabase to handle the auth
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (!retrySession) {
                setError("Invalid or expired reset link. Please request a new one.");
              }
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };
    
    checkSession();
  }, [searchParams, supabase.auth]);

  const getPasswordStrength = (pass: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 1) return { strength, label: "Weak", color: "from-red-400 to-orange-500" };
    if (strength <= 2) return { strength, label: "Fair", color: "from-orange-400 to-yellow-500" };
    if (strength <= 3) return { strength, label: "Good", color: "from-yellow-400 to-green-500" };
    return { strength, label: "Strong", color: "from-green-400 to-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = password.length >= 6 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure passwords match and are at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setResetComplete(true);
      
      toast({
        title: "Password Reset Successful! ✨",
        description: "Your password has been updated. You can now sign in.",
      });

      // Redirect to signin after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
        <div className="absolute inset-0 mesh-gradient opacity-20"></div>
        
        <div className="w-full max-w-md mx-4 relative z-10">
          <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-2xl border border-red-400/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">
                Reset Link Expired
              </h1>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              
              <div className="space-y-3">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bolt-gradient text-white">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background elements */}
      <div className="absolute inset-0 mesh-gradient opacity-20 animate-pulse-glow"></div>

      {/* Floating orbs */}
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24 animate-float delay-100"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18 animate-float delay-300"></div>
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float delay-500"></div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div
        className={`w-full max-w-md mx-4 relative z-10 transition-all duration-1000 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Card */}
        <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-2xl border border-yellow-400/20 relative overflow-hidden group hover:border-yellow-400/40 transition-all duration-500 backdrop-blur-xl">
          {/* Shimmer */}
          <div className="absolute inset-0 shimmer opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 group-hover:scale-125 transition-transform duration-300">
            <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4 group-hover:scale-125 transition-transform duration-300">
            <Star className="h-4 w-4 text-blue-500 animate-spin" style={{ animationDuration: "3s" }} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div
              className={`text-center mb-6 sm:mb-8 transition-all duration-700 delay-200 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4 group hover:scale-105 transition-all duration-300">
                <KeyRound className="h-4 w-4 text-yellow-500 group-hover:animate-pulse" />
                <span className="text-sm font-medium bolt-gradient-text">
                  {resetComplete ? "Success!" : "Reset Password"}
                </span>
                <Wand2 className="h-4 w-4 text-blue-500 group-hover:animate-spin" />
              </div>

              <h1 className="modern-display text-2xl sm:text-3xl font-bold mb-2">
                {resetComplete ? (
                  <>
                    Password{" "}
                    <span className="bolt-gradient-text">Updated!</span>
                  </>
                ) : (
                  <>
                    Create New{" "}
                    <span className="bolt-gradient-text">Password</span>
                  </>
                )}
              </h1>
              <p className="modern-body text-muted-foreground text-sm sm:text-base">
                {resetComplete
                  ? "Your password has been successfully reset"
                  : "Enter a strong password for your account"}
              </p>
            </div>

            {resetComplete ? (
              // Success state
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mb-6 animate-bounce shadow-xl">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>

                <div className="glass-effect p-4 rounded-xl border border-green-400/30 mb-6 text-center">
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Password successfully updated!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Redirecting to sign in...
                  </p>
                </div>

                <Link href="/auth/signin">
                  <Button className="bolt-gradient text-white">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              // Form
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password field */}
                <div
                  className={`space-y-2 transition-all duration-500 delay-300 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <Label
                    htmlFor="password"
                    className={`text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                      focusedField === "password" ? "text-yellow-600 scale-105" : ""
                    }`}
                  >
                    <Lock
                      className={`h-4 w-4 text-muted-foreground transition-all duration-300 ${
                        focusedField === "password" ? "text-yellow-500 animate-pulse" : ""
                      }`}
                    />
                    New Password
                    {password && password.length >= 6 && (
                      <Shield className="h-3 w-3 text-green-500 animate-scale-in" />
                    )}
                  </Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter new password"
                      required
                      className="glass-effect border-yellow-400/30 focus:border-yellow-400/60 pl-4 pr-12 py-3"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-2 animate-fade-in-up">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.strength
                                ? `bg-gradient-to-r ${passwordStrength.color}`
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        passwordStrength.strength <= 1 ? "text-red-500" :
                        passwordStrength.strength <= 2 ? "text-orange-500" :
                        passwordStrength.strength <= 3 ? "text-yellow-600" :
                        "text-green-500"
                      }`}>
                        Password strength: {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password field */}
                <div
                  className={`space-y-2 transition-all duration-500 delay-400 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <Label
                    htmlFor="confirmPassword"
                    className={`text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                      focusedField === "confirmPassword" ? "text-yellow-600 scale-105" : ""
                    }`}
                  >
                    <Lock
                      className={`h-4 w-4 text-muted-foreground transition-all duration-300 ${
                        focusedField === "confirmPassword" ? "text-yellow-500 animate-pulse" : ""
                      }`}
                    />
                    Confirm Password
                    {passwordsMatch && (
                      <Check className="h-3 w-3 text-green-500 animate-scale-in" />
                    )}
                  </Label>
                  <div className="relative group">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Confirm new password"
                      required
                      className={`glass-effect pl-4 pr-12 py-3 ${
                        confirmPassword && !passwordsMatch
                          ? "border-red-400/60 focus:border-red-400/80"
                          : "border-yellow-400/30 focus:border-yellow-400/60"
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <div
                  className={`transition-all duration-500 delay-500 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <Button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="w-full bolt-gradient text-white font-semibold py-4 sm:py-5 rounded-xl relative text-lg disabled:opacity-50 shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-center gap-3 relative z-20">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="font-bold">Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          <span className="font-bold">Reset Password</span>
                          <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </form>
            )}

            {/* Back to sign in */}
            {!resetComplete && (
              <div
                className={`mt-6 text-center transition-all duration-500 delay-600 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-sm font-medium bolt-gradient-text hover:scale-105 transition-all duration-200 group"
                >
                  <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span>Back to Sign In</span>
                  <Zap className="h-3 w-3 group-hover:animate-pulse" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
