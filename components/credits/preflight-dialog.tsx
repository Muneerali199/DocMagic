"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  AlertTriangle,
  XCircle,
  Zap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { CostEstimate } from "@/lib/credit-estimator";
import { ACTION_LABELS } from "@/lib/credit-estimator";

interface PreflightDialogProps {
  open: boolean;
  estimate: CostEstimate | null;
  creditsTotal?: number;
  /** Called when user clicks "Proceed" */
  onConfirm: () => void;
  /** Called when user clicks "Cancel" */
  onCancel: () => void;
}

export function PreflightDialog({
  open,
  estimate,
  creditsTotal = 20,
  onConfirm,
  onCancel,
}: PreflightDialogProps) {
  if (!estimate) return null;

  const isBlocked = !estimate.canAfford || estimate.exceedsBudget;

  const progressPct = Math.min(
    (estimate.creditsRemaining / Math.max(creditsTotal, 1)) * 100,
    100
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {isBlocked ? (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            ) : (
              <Coins className="h-5 w-5 text-yellow-500 shrink-0" />
            )}
            {ACTION_LABELS[estimate.action]}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Credit cost estimate before generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Cost breakdown */}
          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated cost</span>
              <Badge
                variant={isBlocked ? "destructive" : "secondary"}
                className="text-sm font-semibold gap-1"
              >
                <Coins className="h-3 w-3" />
                {estimate.label}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Your balance</span>
                <span
                  className={
                    estimate.creditsRemaining < estimate.totalCredits
                      ? "text-red-500 font-medium"
                      : estimate.creditsRemaining < estimate.totalCredits * 3
                      ? "text-amber-500 font-medium"
                      : "text-green-600 font-medium"
                  }
                >
                  {estimate.creditsRemaining} remaining
                </span>
              </div>
              <Progress
                value={progressPct}
                className={`h-2 ${
                  progressPct < 20
                    ? "[&>div]:bg-red-500"
                    : progressPct < 50
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-green-500"
                }`}
              />
            </div>

            {estimate.creditsRemaining > 0 && !isBlocked && (
              <p className="text-xs text-muted-foreground">
                After this action:{" "}
                <span className="font-medium text-foreground">
                  {Math.max(0, estimate.creditsRemaining - estimate.totalCredits)} credits left
                </span>
              </p>
            )}
          </div>

          {/* Blocker / warning message */}
          {estimate.blockerReason && (
            <div
              className={`flex gap-3 rounded-lg p-3 text-sm border ${
                isBlocked
                  ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                  : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{estimate.blockerReason}</span>
            </div>
          )}

          {/* Upgrade prompt for blocked users */}
          {!estimate.canAfford && (
            <Link href="/pricing" onClick={onCancel}>
              <Button
                variant="outline"
                className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20 gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Upgrade for More Credits
              </Button>
            </Link>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          {!isBlocked && (
            <Button
              onClick={onConfirm}
              className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-yellow-400 to-blue-600 text-white hover:opacity-90"
            >
              <Zap className="h-4 w-4" />
              Proceed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
