"use client";
import { useEffect, useRef } from "react";

/**
 * useAutosave - Universal autosave hook for any serializable data (forms, files, diagrams, etc.)
 * Handles debounced save, immediate save before unload, and restore on mount.
 * Usage: useAutosave(key, value, onRestore)
 */
export function useAutosave<T>(
  key: string,
  value: T,
  onRestore: (val: T) => void
) {
  const timeoutRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  // Debounced save to localStorage
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      try {
        const stringified = JSON.stringify(value);
        localStorage.setItem(key, stringified);
      } catch (e) {
        console.error("Failed to save autosave", e);
      }
    }, 800);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, key]);

  // Restore on mount (handles files, diagrams, forms, etc.)
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Defensive: Only restore if parsed is not null/undefined
        if (parsed !== null && typeof parsed === "object") {
          onRestore(parsed);
        }
      } catch (e) {
        console.error("Failed to parse autosave", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Save immediately before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error("Failed to save before unload", e);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [value, key]);
}