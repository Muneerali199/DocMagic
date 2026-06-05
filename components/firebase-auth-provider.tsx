"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/init";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getOrCreateSupabaseUser } from "@/lib/auth-utils";

// Define the auth context type
interface AuthContextType {
  user: FirebaseUser | null;
  supabaseUserId: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUserId: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithGitHub: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {}
});

// Custom hook to use auth context
export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};

// Firebase Auth Provider component
export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize Supabase client
  const supabase = useCallback(() => createClient(), []);

  // Initialize Firebase auth state listener
  useEffect(() => {
    // Check initial Firebase auth state
    const checkInitialState = async () => {
      try {
        const firebaseUser = firebaseAuth.getCurrentUser();
        if (firebaseUser) {
          // Get or create corresponding Supabase user
          const supabaseId = await getOrCreateSupabaseUser(firebaseUser);
          setUser(firebaseUser);
          setSupabaseUserId(supabaseId);
          console.log('Firebase user loaded:', firebaseUser.email);
        } else {
          setUser(null);
          setSupabaseUserId(null);
        }
      } catch (error) {
        console.error('Error checking initial auth state:', error);
        setUser(null);
        setSupabaseUserId(null);
      } finally {
        setLoading(false);
      }
    };

    checkInitialState();

    // Set up auth state listener
    const unsubscribe = firebaseAuth.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get or create corresponding Supabase user
          const supabaseId = await getOrCreateSupabaseUser(firebaseUser);
          setUser(firebaseUser);
          setSupabaseUserId(supabaseId);
          console.log('Firebase user signed in:', firebaseUser.email);
          
          // Refresh route to update server components
          router.refresh();
        } catch (error) {
          console.error('Error handling Firebase auth state change:', error);
          // Sign out from Firebase if there's an error with Supabase mapping
          await firebaseAuth.signOut();
        }
      } else {
        setUser(null);
        setSupabaseUserId(null);
        console.log('Firebase user signed out');
        
        // Redirect to home and refresh
        router.push('/');
        router.refresh();
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, supabase]);

  // Auth handler functions
  const signInWithGoogle = useCallback(async () => {
    try {
      await firebaseAuth.signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }, []);

  const signInWithGitHub = useCallback(async () => {
    try {
      await firebaseAuth.signInWithGitHub();
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      await firebaseAuth.signInWithEmail(email, password);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  // Provide auth context
  return (
    <AuthContext.Provider value={{
      user,
      supabaseUserId,
      loading,
      signInWithGoogle,
      signInWithGitHub,
      signInWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};