'use client';

import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none"></div>
          
          <div className="w-full max-w-md relative z-10">
            <div className="glass-effect p-8 rounded-2xl shadow-2xl border border-red-500/20 text-center space-y-6 backdrop-blur-xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              
              <div className="space-y-2">
                <h1 className="modern-display text-3xl font-bold text-shadow-professional">
                  System Error
                </h1>
                <p className="modern-body text-muted-foreground">
                  A critical system error occurred. We've been notified and are working on it.
                </p>
              </div>

              <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10 mb-6">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                  {process.env.NODE_ENV === 'development' 
                    ? (error.message || "An unexpected system error occurred")
                    : "A critical system error occurred. Please refresh the page or contact support."
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => reset()}
                  className="bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Restart Application
                </Button>
                
                <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground pt-4 border-t border-yellow-400/10">
                DraftDeckAI Premium Experience
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

