'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />
          <div className="w-full max-w-md relative z-10">
            <div className="glass-effect p-8 rounded-2xl shadow-2xl border border-red-500/20 text-center space-y-6 backdrop-blur-xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground text-sm">
                  An unexpected error occurred in this section. Your data is safe.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10">
                  <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                    {this.state.error.message || 'Unknown error'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleReset}
                  className="bolt-gradient text-white font-semibold py-6 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-xl border-yellow-400/20 hover:bg-yellow-400/5"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
