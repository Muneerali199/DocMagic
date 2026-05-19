"use client";

import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { estimateCost, type EstimateParams } from "@/lib/credit-estimator";
import type { ActionType } from "@/lib/credits-service";

interface CreditCostBadgeProps {
  action: ActionType;
  params?: EstimateParams;
  className?: string;
  /** Current remaining credits — if provided, shows a low-balance warning colour */
  creditsRemaining?: number;
}

/**
 * Tiny inline badge that shows "1 credit" next to a generate button.
 * Pure presentational — no data fetching.
 */
export function CreditCostBadge({
  action,
  params,
  className,
  creditsRemaining,
}: CreditCostBadgeProps) {
  const cost = estimateCost(action, params);
  const isLow = creditsRemaining !== undefined && creditsRemaining < cost * 2;
  const canAfford = creditsRemaining === undefined || creditsRemaining >= cost;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border",
        canAfford
          ? isLow
            ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400"
            : "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400"
          : "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400",
        className
      )}
      title={`This action costs ${cost} credit${cost > 1 ? "s" : ""}`}
    >
      <Coins className="h-3 w-3" />
      {cost} {cost === 1 ? "credit" : "credits"}
    </span>
  );
}
