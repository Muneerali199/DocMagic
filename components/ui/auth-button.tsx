"use client";

import { Button } from "@/components/ui/button";
import { useAuthGuard, getActivityDescription } from "@/lib/auth-utils";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
  activity: string;
  onAuthenticatedClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  showAuthIcon?: boolean;
  authPromptTitle?: string;
  authPromptDescription?: string;
}

export function AuthButton({
  activity,
  onAuthenticatedClick,
  children,
  className,
  variant = "default",
  size = "default",
  disabled = false,
  showAuthIcon = true,
  authPromptTitle,
  authPromptDescription,
  ...props
}: AuthButtonProps) {
  const { requireAuth, loading, isAuthenticated } = useAuthGuard();

  const handleClick = () => {
    if (isAuthenticated) {
      onAuthenticatedClick();
    } else {
      const title = authPromptTitle || `Sign in to ${getActivityDescription(activity)}`;
      const description = authPromptDescription || `You need to be signed in to ${getActivityDescription(activity)}.`;
      
      requireAuth(activity);
    }
  };

  if (loading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={true}
        className={cn(className)}
        {...props}
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      className={cn(
        className,
        !isAuthenticated && showAuthIcon && "relative"
      )}
      onClick={handleClick}
      {...props}
    >
      {!isAuthenticated && showAuthIcon && (
        <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
      )}
      {isAuthenticated && showAuthIcon && variant === "default" && (
        <Sparkles className="h-4 w-4 mr-2" />
      )}
      {children}
    </Button>
  );
}

// Specialized auth buttons for common activities
export function CreateDocumentButton({
  onAuthenticatedClick,
  children,
  className,
  ...props
}: Omit<AuthButtonProps, "activity">) {
  return (
    <AuthButton
      activity="create_document"
      onAuthenticatedClick={onAuthenticatedClick}
      className={cn("bolt-gradient text-white font-semibold", className)}
      authPromptTitle="Sign in to create documents"
      authPromptDescription="Create professional documents with AI assistance."
      {...props}
    >
      {children}
    </AuthButton>
  );
}

export function SaveDocumentButton({
  onAuthenticatedClick,
  children,
  className,
  ...props
}: Omit<AuthButtonProps, "activity">) {
  return (
    <AuthButton
      activity="save_document"
      onAuthenticatedClick={onAuthenticatedClick}
      className={cn("bg-green-600 hover:bg-green-700 text-white", className)}
      authPromptTitle="Sign in to save documents"
      authPromptDescription="Save your documents to access them later."
      {...props}
    >
      {children}
    </AuthButton>
  );
}

export function DownloadDocumentButton({
  onAuthenticatedClick,
  children,
  className,
  ...props
}: Omit<AuthButtonProps, "activity">) {
  return (
    <AuthButton
      activity="download_document"
      onAuthenticatedClick={onAuthenticatedClick}
      className={cn("bg-blue-600 hover:bg-blue-700 text-white", className)}
      authPromptTitle="Sign in to download documents"
      authPromptDescription="Download your documents in various formats."
      {...props}
    >
      {children}
    </AuthButton>
  );
}

export function EditTemplateButton({
  onAuthenticatedClick,
  children,
  className,
  ...props
}: Omit<AuthButtonProps, "activity">) {
  return (
    <AuthButton
      activity="edit_template"
      onAuthenticatedClick={onAuthenticatedClick}
      className={cn("bg-purple-600 hover:bg-purple-700 text-white", className)}
      authPromptTitle="Sign in to edit templates"
      authPromptDescription="Customize templates to match your needs."
      {...props}
    >
      {children}
    </AuthButton>
  );
}

// Auth-aware link component
interface AuthLinkProps {
  href: string;
  activity: string;
  children: React.ReactNode;
  className?: string;
  authPromptTitle?: string;
  authPromptDescription?: string;
}

export function AuthLink({
  href,
  activity,
  children,
  className,
  authPromptTitle,
  authPromptDescription,
}: AuthLinkProps) {
  const { requireAuth, isAuthenticated } = useAuthGuard();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      const title = authPromptTitle || `Sign in to ${getActivityDescription(activity)}`;
      const description = authPromptDescription || `You need to be signed in to ${getActivityDescription(activity)}.`;
      
      requireAuth(activity, href);
    }
  };

  return (
    <a
      href={href}
      className={cn(className)}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
