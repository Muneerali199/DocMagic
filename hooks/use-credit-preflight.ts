"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buildEstimate, type CostEstimate, type EstimateParams } from '@/lib/credit-estimator';
import { useBudgetMode } from './use-budget-mode';
import type { ActionType } from '@/lib/credits-service';

export interface PreflightState {
  /** Currently fetched credits remaining; undefined while loading */
  creditsRemaining: number | undefined;
  /** True while fetching the credit balance */
  loadingCredits: boolean;
  /** Trigger a preflight check. Returns true if the caller may proceed
   *  immediately (no dialog needed). Returns false if the dialog was
   *  opened or the action is blocked. */
  check: (
    action: ActionType,
    onConfirm: () => Promise<void> | void,
    params?: EstimateParams
  ) => Promise<boolean>;
  /** True when the preflight dialog should be visible */
  dialogOpen: boolean;
  closeDialog: () => void;
  /** The current estimate shown in the dialog */
  pendingEstimate: CostEstimate | null;
  /** Called by the dialog's "Proceed" button */
  confirmAction: () => void;
  /** Refresh credit balance (call after successful generation) */
  refreshCredits: () => void;
  budgetMode: ReturnType<typeof useBudgetMode>;
}

export function useCreditPreflight(): PreflightState {
  const [creditsRemaining, setCreditsRemaining] = useState<number | undefined>(undefined);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingEstimate, setPendingEstimate] = useState<CostEstimate | null>(null);
  const pendingAction = useRef<(() => Promise<void> | void) | null>(null);

  const budgetMode = useBudgetMode();
  const supabase = createClient();

  const fetchCredits = useCallback(async () => {
    setLoadingCredits(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/credits', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCreditsRemaining(data.creditsRemaining ?? 0);
      }
    } catch {
      // Silently degrade — preflight becomes informational only
    } finally {
      setLoadingCredits(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const check = useCallback(
    async (
      action: ActionType,
      onConfirm: () => Promise<void> | void,
      params?: EstimateParams
    ): Promise<boolean> => {
      const remaining = creditsRemaining ?? 0;
      const estimate = buildEstimate(
        action,
        remaining,
        params,
        budgetMode.budgetRemaining
      );

      // If the user can afford it AND it doesn't exceed budget,
      // skip the dialog and proceed immediately.
      if (estimate.canAfford && !estimate.exceedsBudget) {
        return true;
      }

      // Otherwise open the preflight dialog so the user can see why
      // they're blocked (or confirm despite a budget warning).
      pendingAction.current = onConfirm;
      setPendingEstimate(estimate);
      setDialogOpen(true);
      return false;
    },
    [creditsRemaining, budgetMode.budgetRemaining]
  );

  const confirmAction = useCallback(() => {
    setDialogOpen(false);
    if (pendingAction.current) {
      const fn = pendingAction.current;
      pendingAction.current = null;
      // Run asynchronously so the dialog closes first
      Promise.resolve(fn()).catch(console.error);
    }
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    pendingAction.current = null;
    setPendingEstimate(null);
  }, []);

  return {
    creditsRemaining,
    loadingCredits,
    check,
    dialogOpen,
    closeDialog,
    pendingEstimate,
    confirmAction,
    refreshCredits: fetchCredits,
    budgetMode,
  };
}
