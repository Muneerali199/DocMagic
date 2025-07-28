"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export const ThemeToggle = React.forwardRef<HTMLButtonElement>((props, ref) => {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button ref={ref} variant="outline" size="icon" className="rounded-full" {...props}>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const handleToggle = () => {
    console.log("Theme toggle clicked!", { resolvedTheme });
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className="rounded-full cursor-pointer relative z-10"
      onClick={handleToggle}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      style={{ pointerEvents: 'auto' }}
      {...props}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
});

ThemeToggle.displayName = "ThemeToggle";