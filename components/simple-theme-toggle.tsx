"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function SimpleThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    console.log("Simple theme toggle clicked!", { resolvedTheme });
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-10 h-10 rounded-full border border-gray-300 hover:border-gray-400 flex items-center justify-center bg-white dark:bg-gray-800 transition-colors cursor-pointer"
      style={{ 
        pointerEvents: 'auto',
        zIndex: 100,
        position: 'relative'
      }}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
