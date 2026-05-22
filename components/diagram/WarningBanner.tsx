"use client";

import React from "react";
import { LintError } from "@/lib/diagram-lint-store";
import { AlertTriangle, X, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WarningBannerProps {
  errors: LintError[];
  /** Called when the user clicks "Dismiss". */
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WarningBanner({ errors, onDismiss }: WarningBannerProps) {
  const warnings = errors.filter((e) => e.severity === "warning");
  if (warnings.length === 0) return null;

  const collapsed = warnings.length > 3;
  const visible = collapsed ? warnings.slice(0, 3) : warnings;
  const hiddenCount = warnings.length - visible.length;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative w-full overflow-hidden rounded-xl border border-amber-500/40 shadow-lg shadow-amber-900/20"
      style={{
        background:
          "linear-gradient(135deg, rgba(78,53,5,0.85) 0%, rgba(39,25,3,0.9) 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Subtle shimmer strip across the top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* ── Header row ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-200 leading-none">
              {warnings.length} Diagram Warning
              {warnings.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Render proceeded — review these for best results
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Dismiss warnings"
          className="flex items-center justify-center w-6 h-6 rounded-md text-amber-500 hover:text-amber-200 hover:bg-amber-800/40 transition-colors shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Warning list ─────────────────────────────────────────── */}
      <ul className="px-4 pb-2 space-y-1.5">
        {visible.map((w, i) => (
          <li
            key={`${w.ruleId}-${w.line}-${i}`}
            className="flex items-start gap-2 text-xs"
          >
            <ChevronRight className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
            <span className="text-amber-100/80">
              <span className="font-mono font-semibold text-amber-300 mr-1">
                L{w.line}
              </span>
              {w.message}
            </span>
          </li>
        ))}
        {collapsed && hiddenCount > 0 && (
          <li className="text-xs text-amber-500/60 pl-5">
            …and {hiddenCount} more warning{hiddenCount !== 1 ? "s" : ""}
          </li>
        )}
      </ul>

      {/* ── Footer action ─────────────────────────────────────────── */}
      <div className="flex items-center justify-end px-4 py-2 border-t border-amber-800/40">
        <button
          onClick={onDismiss}
          className="px-3 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-100 bg-amber-900/30 hover:bg-amber-800/40 border border-amber-700/40 hover:border-amber-600/60 transition-all"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default WarningBanner;
