"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signOut: async () => {}
});

// Create supabase client outside component to ensure single instance
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Helper to send welcome email
    const sendWelcomeEmail = async (email: string | undefined) => {
      if (!email) return;
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Welcome to DocMagic!',
            text: 'Thank you for signing up. We are excited to have you on board!',
            html: '<h2>Welcome to DocMagic!</h2><p>Thank you for signing up. We are excited to have you on board!</p>'
          })
        });
      } catch (err) {
        console.error('Failed to send welcome email:', err);
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
        } else {
          // Set user from session
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
          // Send welcome email
          await sendWelcomeEmail(session?.user?.email);
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          router.push('/');
          router.refresh();
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed for:', session?.user?.email);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};