"use client";

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'draftdeck_budget_mode';

export interface BudgetSettings {
  enabled: boolean;
  /** Maximum credits allowed per calendar day (0 = unlimited) */
  dailyCap: number;
  /** Maximum credits allowed per browser session (0 = unlimited) */
  sessionCap: number;
  /** Credits consumed so far today */
  dailyUsed: number;
  /** YYYY-MM-DD of the day dailyUsed was last recorded */
  dailyDate: string;
  /** Credits consumed since the page loaded (in-memory only) */
  sessionUsed: number;
}

const DEFAULT_SETTINGS: BudgetSettings = {
  enabled: false,
  dailyCap: 10,
  sessionCap: 5,
  dailyUsed: 0,
  dailyDate: '',
  sessionUsed: 0,
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readFromStorage(): BudgetSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: BudgetSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    // Reset daily counter if date has changed
    if (parsed.dailyDate !== todayStr()) {
      parsed.dailyUsed = 0;
      parsed.dailyDate = todayStr();
    }
    // sessionUsed is always 0 on fresh load (not persisted)
    parsed.sessionUsed = 0;
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeToStorage(s: BudgetSettings) {
  if (typeof window === 'undefined') return;
  try {
    // Don't persist sessionUsed — it should be 0 on next load
    const toSave = { ...s, sessionUsed: 0 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Silently ignore storage errors (e.g. private mode, quota exceeded)
  }
}

export interface BudgetModeAPI {
  settings: BudgetSettings;
  /** Toggle budget mode on/off */
  setEnabled: (enabled: boolean) => void;
  /** Update daily cap. Pass 0 for unlimited. */
  setDailyCap: (cap: number) => void;
  /** Update session cap. Pass 0 for unlimited. */
  setSessionCap: (cap: number) => void;
  /** How many credits remain under the current budget (undefined = no limit active) */
  budgetRemaining: number | undefined;
  /** Check whether a proposed cost fits within the budget */
  wouldExceedBudget: (cost: number) => boolean;
  /** Record that `cost` credits were consumed. Call after a successful generation. */
  recordUsage: (cost: number) => void;
  /** Reset session counter (called automatically on mount) */
  resetSession: () => void;
}

export function useBudgetMode(): BudgetModeAPI {
  const [settings, setSettings] = useState<BudgetSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(readFromStorage());
  }, []);

  const save = useCallback((updater: (prev: BudgetSettings) => BudgetSettings) => {
    setSettings((prev) => {
      const next = updater(prev);
      writeToStorage(next);
      return next;
    });
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => save((prev) => ({ ...prev, enabled })),
    [save]
  );

  const setDailyCap = useCallback(
    (dailyCap: number) => save((prev) => ({ ...prev, dailyCap })),
    [save]
  );

  const setSessionCap = useCallback(
    (sessionCap: number) => save((prev) => ({ ...prev, sessionCap })),
    [save]
  );

  const recordUsage = useCallback(
    (cost: number) => {
      save((prev) => ({
        ...prev,
        dailyUsed: prev.dailyUsed + cost,
        dailyDate: todayStr(),
        sessionUsed: prev.sessionUsed + cost,
      }));
    },
    [save]
  );

  const resetSession = useCallback(() => {
    setSettings((prev) => ({ ...prev, sessionUsed: 0 }));
  }, []);

  // Budget remaining = the tighter of daily cap and session cap
  const budgetRemaining: number | undefined = (() => {
    if (!settings.enabled) return undefined;
    const dailyLeft = settings.dailyCap > 0
      ? Math.max(0, settings.dailyCap - settings.dailyUsed)
      : Infinity;
    const sessionLeft = settings.sessionCap > 0
      ? Math.max(0, settings.sessionCap - settings.sessionUsed)
      : Infinity;
    const min = Math.min(dailyLeft, sessionLeft);
    return min === Infinity ? undefined : min;
  })();

  const wouldExceedBudget = useCallback(
    (cost: number) => budgetRemaining !== undefined && cost > budgetRemaining,
    [budgetRemaining]
  );

  return {
    settings,
    setEnabled,
    setDailyCap,
    setSessionCap,
    budgetRemaining,
    wouldExceedBudget,
    recordUsage,
    resetSession,
  };
}
