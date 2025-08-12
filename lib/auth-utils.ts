"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Pages that can be browsed without authentication
export const BROWSABLE_PAGES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/documentation',
  '/templates', // Can view templates but not create/edit
  '/auth/signin',
  '/auth/register',
];

// Pages that require full authentication
export const PROTECTED_PAGES = [
  '/profile',
  '/settings',
  '/payment-demo',
];

export const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/register',
];

// Activities that require authentication (used for component-level protection)
export const PROTECTED_ACTIVITIES = {
  CREATE_DOCUMENT: 'create_document',
  EDIT_DOCUMENT: 'edit_document',
  SAVE_DOCUMENT: 'save_document',
  DOWNLOAD_DOCUMENT: 'download_document',
  CREATE_TEMPLATE: 'create_template',
  EDIT_TEMPLATE: 'edit_template',
  SAVE_TEMPLATE: 'save_template',
  ACCESS_PROFILE: 'access_profile',
  CHANGE_SETTINGS: 'change_settings',
  MAKE_PAYMENT: 'make_payment',
  UPLOAD_FILE: 'upload_file',
};

// Hook for checking authentication and redirecting if needed
export function useAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const requireAuth = (activity: string, redirectPath?: string) => {
    if (loading) return false;
    
    if (!user) {
      const currentPath = window.location.pathname;
      const targetPath = redirectPath || currentPath;
      
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with this action.",
        variant: "default",
      });
      
      // Redirect to sign in with return URL
      router.push(`/auth/signin?redirectTo=${encodeURIComponent(targetPath)}&activity=${encodeURIComponent(activity)}`);
      return false;
    }
    
    return true;
  };

  const checkAuthForActivity = (activity: string): boolean => {
    if (loading) return false;
    return !!user;
  };

  return {
    user,
    loading,
    requireAuth,
    checkAuthForActivity,
    isAuthenticated: !!user && !loading,
  };
}

// Utility function to check if a page is browsable
export function isBrowsablePage(pathname: string): boolean {
  return BROWSABLE_PAGES.some(page => {
    if (page === '/') return pathname === '/';
    return pathname.startsWith(page);
  });
}

// Utility function to check if a page requires full authentication
export function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PAGES.some(page => pathname.startsWith(page));
}

// Get activity description for user-friendly messages
export function getActivityDescription(activity: string): string {
  const descriptions = {
    [PROTECTED_ACTIVITIES.CREATE_DOCUMENT]: "create a new document",
    [PROTECTED_ACTIVITIES.EDIT_DOCUMENT]: "edit this document",
    [PROTECTED_ACTIVITIES.SAVE_DOCUMENT]: "save your document",
    [PROTECTED_ACTIVITIES.DOWNLOAD_DOCUMENT]: "download this document",
    [PROTECTED_ACTIVITIES.CREATE_TEMPLATE]: "create a new template",
    [PROTECTED_ACTIVITIES.EDIT_TEMPLATE]: "edit this template",
    [PROTECTED_ACTIVITIES.SAVE_TEMPLATE]: "save this template",
    [PROTECTED_ACTIVITIES.ACCESS_PROFILE]: "access your profile",
    [PROTECTED_ACTIVITIES.CHANGE_SETTINGS]: "change your settings",
    [PROTECTED_ACTIVITIES.MAKE_PAYMENT]: "make a payment",
    [PROTECTED_ACTIVITIES.UPLOAD_FILE]: "upload files",
  };
  
  return descriptions[activity] || "perform this action";
}
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}
// Component wrapper for protected activities (removed for now due to build issues)
export function useAuthRouteProtection() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && isAuthRoute(pathname)) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo') || '/';
      const safeRedirectTo = redirectTo.startsWith('/') && !redirectTo.includes('..') 
        ? redirectTo 
        : '/';
      
      toast({
        title: "Already Authenticated",
        description: "You are already signed in. Redirecting...",
      });
      
      // Small delay to show the toast
      setTimeout(() => {
        router.replace(safeRedirectTo);
      }, 1000);
    }
  }, [user, loading, pathname, router, toast]);

  return {
    user,
    loading,
    shouldRedirect: !loading && !!user && isAuthRoute(pathname)
  };
}