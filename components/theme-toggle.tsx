"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ThemeToggle = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>((props, ref) => {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 opacity-50"
        disabled
        {...props}
      >
        <Sun className="h-[1.1rem] w-[1.1rem]" />
      </Button>
    );
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simple toggle between light and dark if system is not preferred
    // or cycle: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full h-9 w-9 relative hover:bg-accent/50 transition-colors duration-300",
        "cursor-pointer z-50 pointer-events-auto",
        props.className
      )}
      onClick={handleToggle}
      aria-label="Toggle theme"
      type="button"
      {...props}
    >
      {theme === "light" && <Sun className="h-[1.1rem] w-[1.1rem] text-amber-500" />}
      {theme === "dark" && <Moon className="h-[1.1rem] w-[1.1rem] text-blue-400" />}
      {theme === "system" && <Monitor className="h-[1.1rem] w-[1.1rem] text-muted-foreground" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
});

ThemeToggle.displayName = "ThemeToggle";