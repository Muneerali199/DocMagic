"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleToggle = () => {
    // Cycle through: light -> dark -> system
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
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
      {...props}
    >
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="light"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Sun className="h-[1.1rem] w-[1.1rem] text-amber-500" />
          </motion.div>
        ) : theme === "dark" ? (
          <motion.div
            key="dark"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Moon className="h-[1.1rem] w-[1.1rem] text-blue-400" />
          </motion.div>
        ) : (
          <motion.div
            key="system"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2, ease: "circOut" }}
          >
            <Monitor className="h-[1.1rem] w-[1.1rem] text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
});

ThemeToggle.displayName = "ThemeToggle";