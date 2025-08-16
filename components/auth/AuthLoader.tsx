import React from "react";
import {
  Sparkles,
  Star,
  Zap,
  Wand2,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";

interface AuthLoaderProps {
  shouldRedirect?: boolean;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ shouldRedirect = false }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden py-8">
      <div className="absolute inset-0 mesh-gradient opacity-10 animate-pulse"></div>

      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-10 top-20 -left-24 animate-float delay-100"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-15 bottom-20 -right-18 animate-float delay-300"></div>
      <div className="floating-orb w-40 h-40 sm:w-56 sm:h-56 bolt-gradient opacity-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float delay-500"></div>

      <div
        className="absolute inset-0 opacity-[0.01] animate-subtle-shimmer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <div className="w-full max-w-md mx-4 relative z-10">
        <div className="glass-effect p-6 sm:p-8 rounded-2xl shadow-2xl border border-yellow-400/10 relative overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-20"></div>

          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-yellow-500/30 animate-pulse" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Star className="h-4 w-4 text-blue-500/30 animate-pulse" />
          </div>

          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4 badge-bg">
                <Zap className="h-4 w-4 text-yellow-500/50 animate-pulse" />
                <div className="w-20 h-4 bg-gradient-to-r from-yellow-500/20 to-blue-500/20 rounded animate-pulse"></div>
                <Wand2 className="h-4 w-4 text-blue-500/50 animate-pulse" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="h-8 sm:h-10 bg-gradient-to-r from-gray-300/20 to-gray-400/20 rounded-lg animate-pulse mx-auto w-3/4"></div>
                <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-300/10 to-gray-400/10 rounded animate-pulse mx-auto w-2/3"></div>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground/50" />
                  <div className="h-4 w-20 bg-gray-300/20 rounded animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="h-12 glass-effect border-yellow-400/20 rounded-md animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-muted-foreground/50" />
                  <div className="h-4 w-16 bg-gray-300/20 rounded animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="h-12 glass-effect border-yellow-400/20 rounded-md animate-pulse"></div>
                </div>
              </div>

              <div className="h-14 sm:h-16 bolt-gradient/50 rounded-xl animate-pulse flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white/80" />
                <span className="ml-3 text-white/80 font-semibold">
                  {shouldRedirect ? "Redirecting..." : "Loading..."}
                </span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <div className="glass-effect p-4 rounded-xl border border-yellow-400/10">
                <div className="h-4 w-32 bg-gray-300/10 rounded animate-pulse mx-auto mb-3"></div>
                <div className="h-4 w-24 bg-gradient-to-r from-yellow-500/20 to-blue-500/20 rounded animate-pulse mx-auto"></div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="h-3 w-20 bg-gray-300/10 rounded animate-pulse mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoader;