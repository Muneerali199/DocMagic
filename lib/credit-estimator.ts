/**
 * Client-side credit cost estimator.
 *
 * Mirrors the backend deduction constants in lib/credits-service.ts so the
 * UI always shows the exact same value that the server will deduct. Any
 * changes to ACTION_COSTS must be kept in sync between both files.
 */

import { ACTION_COSTS, type ActionType } from './credits-service';

export interface EstimateParams {
  /** Only meaningful for 'presentation' — number of slides */
  slideCount?: number;
}

export interface CostEstimate {
  action: ActionType;
  totalCredits: number;
  /** Human-readable label, e.g. "1 credit" or "5 credits (5 slides)" */
  label: string;
  /** Whether the user currently has enough credits */
  canAfford: boolean;
  /** Whether this action would exceed the current budget-mode cap */
  exceedsBudget: boolean;
  creditsRemaining: number;
  /** Non-empty when the user cannot proceed and explains why */
  blockerReason?: string;
}

export type ActionLabel = Record<ActionType, string>;

export const ACTION_LABELS: ActionLabel = {
  resume: 'Resume Generation',
  presentation: 'Presentation Generation',
  diagram: 'Diagram Generation',
  letter: 'Letter Generation',
  ats_check: 'ATS Score Check',
  cover_letter: 'Cover Letter Generation',
};

/**
 * Calculate the total credit cost for an action, taking slide count into
 * account for presentations.
 */
export function estimateCost(action: ActionType, params?: EstimateParams): number {
  const base = ACTION_COSTS[action];
  if (action === 'presentation' && params?.slideCount) {
    return base * Math.max(1, params.slideCount);
  }
  return base;
}

/**
 * Build a human-readable cost label such as "1 credit" or "5 credits (5 slides)".
 */
export function buildCostLabel(action: ActionType, params?: EstimateParams): string {
  const total = estimateCost(action, params);
  const plural = total === 1 ? 'credit' : 'credits';
  if (action === 'presentation' && params?.slideCount && params.slideCount > 1) {
    return `${total} ${plural} (${params.slideCount} slides)`;
  }
  return `${total} ${plural}`;
}

/**
 * Build a full CostEstimate object, including affordability and budget checks.
 */
export function buildEstimate(
  action: ActionType,
  creditsRemaining: number,
  params?: EstimateParams,
  budgetRemaining?: number
): CostEstimate {
  const totalCredits = estimateCost(action, params);
  const canAfford = creditsRemaining >= totalCredits;
  const exceedsBudget =
    budgetRemaining !== undefined && totalCredits > budgetRemaining;

  let blockerReason: string | undefined;
  if (!canAfford) {
    blockerReason = `You need ${totalCredits} credit${totalCredits > 1 ? 's' : ''} but only have ${creditsRemaining} remaining.`;
  } else if (exceedsBudget) {
    blockerReason = `This action would exceed your budget cap by ${totalCredits - (budgetRemaining ?? 0)} credit${totalCredits - (budgetRemaining ?? 0) > 1 ? 's' : ''}.`;
  }

  return {
    action,
    totalCredits,
    label: buildCostLabel(action, params),
    canAfford,
    exceedsBudget,
    creditsRemaining,
    blockerReason,
  };
}
