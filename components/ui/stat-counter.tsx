"use client";

import { useEffect, useState } from "react";

interface StatCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  animate?: boolean; // New prop to control animation
}

export function StatCounter({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
  animate = true, // Default to true for animation
}: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!animate) {
      setCount(target);
      return;
    }

    if (target <= 0) return;

    const totalFrames = Math.floor(duration / 50);
    const increment = target / totalFrames;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const newCount = Math.round(increment * frame);
      if (newCount >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(newCount);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [target, duration, animate]);

  return (
    <span
      aria-label={`${prefix}${count}${suffix}`}
      className="text-xl xs:text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-text-glow text-shadow-professional dark:from-teal-400 dark:to-cyan-600"
    >
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}