"use client";

import React from "react";
import { LintError } from "@/lib/diagram-lint-store";
import {
  AlertCircle,
  X,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RULE_DOCS: Record<string, string> = {
  "unquoted-parentheses":
    "Wrap node labels that contain special characters in double-quotes.",
  "reserved-keyword-node-id":
    "Rename the node — Mermaid reserves this word for its own syntax.",
  "missing-subgraph-end":
    'Every subgraph block must be closed with an "end" statement.',
  "malformed-html-label": "Close all HTML tags inside node labels.",
  "invalid-sequence-arrow":
    "Sequence diagrams only support ->, -->>, -x, --x, -), and --).",
  "special-chars-state-id":
    "Use the 'state \"Label\" as ID' notation for state IDs with hyphens.",
  "spaces-in-node-id": "Replace spaces with underscores or wrap in quotes.",
  "mismatched-shape-brackets": "Opening and closing bracket types must match.",
  "gantt-date-format-mismatch": "Task date must match the declared dateFormat.",
  "invalid-gitgraph-commit":
    'Use the id: keyword: commit id: "my message".',
};

function hint(ruleId: string): string {
  return RULE_DOCS[ruleId] ?? "Review the Mermaid documentation for this rule.";
}

// ---------------------------------------------------------------------------
// Sub-component — a single error row
// ---------------------------------------------------------------------------

function ErrorRow({ error }: { error: LintError }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-950/40 border border-red-800/40 hover:bg-red-950/60 transition-colors">
      {/* Severity dot */}
      <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_1px_rgba(239,68,68,0.7)]" />

      <div className="flex-1 min-w-0 space-y-1">
        {/* Top row: rule badge + location */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-900/50 text-red-300 border border-red-700/50">
            {error.ruleId}
          </span>
          <span className="text-[10px] text-slate-500">
            Line&nbsp;{error.line}, Col&nbsp;{error.column}
          </span>
          {error.autoFixable && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-900/40 text-amber-300 border border-amber-700/40">
              ⚡ auto-fixable
            </span>
          )}
        </div>

        {/* Message */}
        <p className="text-sm text-slate-200 leading-snug">{error.message}</p>

        {/* Hint */}
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <ChevronRight className="w-3 h-3 shrink-0" />
          {hint(error.ruleId)}
        </p>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export interface LintErrorPanelProps {
  errors: LintError[];
  /** Called when the user dismisses the panel without fixing anything. */
  onClose: () => void;
}

export function LintErrorPanel({ errors, onClose }: LintErrorPanelProps) {
  const hardErrors = errors.filter((e) => e.severity === "error");
  const fixableCount = hardErrors.filter((e) => e.autoFixable).length;
  const nonFixableCount = hardErrors.length - fixableCount;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(6px)" }}
    >
      {/* Panel */}
      <div
        className="w-full max-w-xl flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-red-800/50"
        style={{
          background:
            "linear-gradient(135deg, #0f0a14 0%, #130c0c 50%, #0a0f1a 100%)",
          maxHeight: "85vh",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 bg-red-950/50 border-b border-red-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 leading-none">
                Diagram Cannot Be Rendered
              </h2>
              <p className="text-xs text-red-400 mt-0.5">
                {hardErrors.length} syntax error
                {hardErrors.length !== 1 ? "s" : ""} must be resolved first
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close lint panel"
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Summary badges ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3 bg-slate-900/50 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-800/40">
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-300">
              {nonFixableCount} require manual fix
            </span>
          </div>
          {fixableCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
              <span className="text-xs font-semibold text-amber-300">
                ⚡ {fixableCount} auto-fixable
              </span>
            </div>
          )}
        </div>

        {/* ── Error list ────────────────────────────────────────────────── */}
        <ul className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {hardErrors.map((e, i) => (
            <ErrorRow key={`${e.ruleId}-${e.line}-${i}`} error={e} />
          ))}
        </ul>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-slate-900/70 border-t border-slate-800/60">
          <p className="text-xs text-slate-500">
            Fix the errors in your diagram code, then try again.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LintErrorPanel;
