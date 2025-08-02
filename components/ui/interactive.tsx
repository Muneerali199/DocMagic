"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  cursorScale?: number;
  cursorColor?: "blue" | "amber" | "emerald" | "purple";
}

export const Interactive = forwardRef<HTMLElement, InteractiveProps>(
  ({ as: Component = "div", children, className, cursorScale, cursorColor, ...props }, ref) => {
    const Comp = Component as any;
    
    return (
      <Comp
        ref={ref}
        data-interactive
        data-cursor-scale={cursorScale}
        data-cursor-color={cursorColor}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Interactive.displayName = "Interactive";