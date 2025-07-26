"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: (User & {
    bio?: string;
    privacy?: {
      showAvatar?: boolean;
      showBio?: boolean;
      showActivity?: boolean;
    };
  }) | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateAvatar: (avatarId: string) => void; // ✅ Added this line
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  updateAvatar: () => {}, // ✅ Prevent undefined error
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN") {
          console.log("User signed in successfully");
          router.refresh();
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          router.push("/");
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
    } catch (error) {
      console.error("Error in signOut:", error);
    }
  };

  // ✅ Add the updateAvatar function
  const updateAvatar = (avatarId: string) => {
    try {
      localStorage.setItem("user-avatar", avatarId); // Save to localStorage
      console.log("Avatar updated to:", avatarId);
    } catch (error) {
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
