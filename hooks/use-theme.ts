'use client';

import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';

/**
 * localStorage key used for persisting the user's theme preference.
 * This is the same key used by next-themes internally, ensuring consistency.
 */
export const THEME_STORAGE_KEY = 'theme';

/** Possible theme values the user can explicitly select. */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * useTheme — A reusable hook that abstracts localStorage persistence and
 * system preference detection for dark mode.
 *
 * Capabilities:
 *  - Persists the user's explicit choice in localStorage.
 *  - On first visit (no stored preference), respects `prefers-color-scheme`.
 *  - Provides the resolved theme ("light" | "dark") for conditional rendering.
 *  - Exposes a convenience `toggleTheme` function for quick light↔dark switching.
 *  - Exposes `isDark` / `isLight` booleans for ergonomic checks.
 *  - Handles SSR hydration safety via `mounted` flag.
 *
 * Usage:
 *   const { theme, resolvedTheme, isDark, setTheme, toggleTheme, mounted } = useTheme();
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme, themes } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /** Whether the currently resolved (visible) theme is dark. */
  const isDark = resolvedTheme === 'dark';

  /** Whether the currently resolved (visible) theme is light. */
  const isLight = resolvedTheme === 'light';

  /**
   * Toggle between light and dark mode.
   * If the current resolved theme is dark → switch to light, and vice-versa.
   * Always sets an explicit preference (never falls back to "system").
   */
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  /**
   * Check whether the user has an explicitly stored preference,
   * or if the theme is being inferred from the system.
   */
  const isUsingSystemTheme = theme === 'system';

  /**
   * The system's current preference independent of user override.
   * Useful for showing "Your system prefers dark mode" hints in settings.
   */
  const systemPreference: 'light' | 'dark' | undefined = systemTheme as
    | 'light'
    | 'dark'
    | undefined;

  return {
    /** The raw theme value: 'light' | 'dark' | 'system' */
    theme: theme as ThemePreference | undefined,

    /** The resolved theme after system preference evaluation: 'light' | 'dark' */
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,

    /** Whether the resolved theme is dark. */
    isDark,

    /** Whether the resolved theme is light. */
    isLight,

    /** Whether we're following the system preference. */
    isUsingSystemTheme,

    /** The system's own preference (independent of user choice). */
    systemPreference,

    /** Set a specific theme: 'light' | 'dark' | 'system'. */
    setTheme,

    /** Quick toggle between light and dark. */
    toggleTheme,

    /** All available theme values. */
    themes,

    /**
     * Whether the component has mounted on the client.
     * Always check this before rendering theme-dependent UI to avoid
     * hydration mismatches.
     */
    mounted,
  };
}
