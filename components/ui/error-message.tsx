"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  action,
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-destructive/90">{message}</p>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
