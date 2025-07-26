"use client";

import { useEffect, useState } from "react";

interface StatCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function StatCounter({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
}: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [target, duration]);

  return (
    <span
      aria-label={`${prefix}${count}${suffix}`}
      className="text-xl xs:text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-text-glow text-shadow-professional dark:from-teal-400 dark:to-cyan-600"
    >
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}