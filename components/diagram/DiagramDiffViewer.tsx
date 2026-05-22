"use client";

import React, { useMemo, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FixRecord {
  /** Unique identifier for this fix (e.g. ruleId + line). */
  id: string;
  /** 1-based line number in the *original* source that was changed. */
  line: number;
  /** Rule that triggered this fix. */
  ruleId: string;
  /** Human-readable description of what was changed. */
  description: string;
  /** The original line content (before fix). */
  originalLine: string;
  /** The replacement line content (after fix). */
  fixedLine: string;
}

export interface DiagramDiffViewerProps {
  /** Original Mermaid source before any fixes. */
  original: string;
  /** Fixed Mermaid source after all auto-fixes have been applied. */
  fixed: string;
  /** Structured records for each applied fix. */
  fixes: FixRecord[];
  /** Called when the user clicks "Confirm". Receives only the accepted fixes. */
  onApply: (acceptedFixes: FixRecord[]) => void;
  /** Optional: called when the user cancels without applying any fixes. */
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Diff engine  (no external libraries)
// ---------------------------------------------------------------------------

type LineKind = "equal" | "removed" | "added" | "empty";

interface DiffLine {
  kind: LineKind;
  lineNo: number | null; // 1-based line number, null for padding
  content: string;
}

interface DiffResult {
  left: DiffLine[];  // original side
  right: DiffLine[]; // fixed side
}

/**
 * Compute a side-by-side line-level diff between two multi-line strings.
 *
 * Uses a simple LCS-based diff (Myers-style) implemented from scratch.
 * Padding rows are inserted to keep the two panels aligned.
 */
function computeDiff(originalSrc: string, fixedSrc: string): DiffResult {
  const aLines = originalSrc.split(/\r?\n/);
  const bLines = fixedSrc.split(/\r?\n/);

  // --- LCS table (patience-style via DP) ---
  const m = aLines.length;
  const n = bLines.length;

  // dp[i][j] = length of LCS of aLines[0..i-1] and bLines[0..j-1]
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aLines[i - 1] === bLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Back-track to recover the edit script
  type EditOp = { op: "equal" | "remove" | "insert"; aIdx: number; bIdx: number };
  const ops: EditOp[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      ops.push({ op: "equal", aIdx: i - 1, bIdx: j - 1 });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ op: "insert", aIdx: i, bIdx: j - 1 });
      j--;
    } else {
      ops.push({ op: "remove", aIdx: i - 1, bIdx: j });
      i--;
    }
  }
  ops.reverse();

  // Build side-by-side rows, pairing removes with inserts
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];

  // Group consecutive removes/inserts so we can pair them row-by-row
  let k = 0;
  while (k < ops.length) {
    const op = ops[k];

    if (op.op === "equal") {
      const lineNo = op.aIdx + 1;
      left.push({ kind: "equal", lineNo, content: aLines[op.aIdx] });
      right.push({ kind: "equal", lineNo: op.bIdx + 1, content: bLines[op.bIdx] });
      k++;
    } else {
      // Collect a run of removes then inserts (or vice-versa)
      const removes: EditOp[] = [];
      const inserts: EditOp[] = [];

      while (k < ops.length && ops[k].op === "remove") {
        removes.push(ops[k++]);
      }
      while (k < ops.length && ops[k].op === "insert") {
        inserts.push(ops[k++]);
      }

      const maxLen = Math.max(removes.length, inserts.length);
      for (let r = 0; r < maxLen; r++) {
        const rem = removes[r];
        const ins = inserts[r];

        left.push(
          rem
            ? { kind: "removed", lineNo: rem.aIdx + 1, content: aLines[rem.aIdx] }
            : { kind: "empty", lineNo: null, content: "" }
        );
        right.push(
          ins
            ? { kind: "added", lineNo: ins.bIdx + 1, content: bLines[ins.bIdx] }
            : { kind: "empty", lineNo: null, content: "" }
        );
      }
    }
  }

  return { left, right };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const LINE_KIND_LEFT_CLS: Record<LineKind, string> = {
  equal:   "bg-transparent text-slate-300",
  removed: "bg-red-950/60 text-red-300 border-l-2 border-red-500",
  added:   "bg-transparent text-slate-500 italic",
  empty:   "bg-slate-800/30",
};

const LINE_KIND_RIGHT_CLS: Record<LineKind, string> = {
  equal:   "bg-transparent text-slate-300",
  removed: "bg-transparent text-slate-500 italic",
  added:   "bg-emerald-950/60 text-emerald-300 border-l-2 border-emerald-500",
  empty:   "bg-slate-800/30",
};

const LINE_NO_LEFT_CLS: Record<LineKind, string> = {
  equal:   "text-slate-600",
  removed: "text-red-600",
  added:   "text-slate-700",
  empty:   "text-transparent",
};

const LINE_NO_RIGHT_CLS: Record<LineKind, string> = {
  equal:   "text-slate-600",
  removed: "text-slate-700",
  added:   "text-emerald-600",
  empty:   "text-transparent",
};

function DiffPanel({
  lines,
  title,
  lineKindCls,
  lineNoCls,
}: {
  lines: DiffLine[];
  title: string;
  lineKindCls: Record<LineKind, string>;
  lineNoCls: Record<LineKind, string>;
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700 flex items-center gap-2 shrink-0">
        <div
          className={`w-2 h-2 rounded-full ${
            title === "Original" ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </span>
      </div>

      {/* Lines */}
      <div className="overflow-auto flex-1 font-mono text-xs leading-5">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((row, idx) => (
              <tr key={idx} className={`${lineKindCls[row.kind]} transition-colors`}>
                {/* Line number */}
                <td
                  className={`select-none text-right pr-3 pl-2 w-10 shrink-0 border-r border-slate-700/50 ${
                    lineNoCls[row.kind]
                  }`}
                  style={{ userSelect: "none" }}
                >
                  {row.lineNo ?? ""}
                </td>

                {/* Change glyph */}
                <td className="w-4 text-center shrink-0 opacity-70">
                  {row.kind === "removed" ? "−" : row.kind === "added" ? "+" : ""}
                </td>

                {/* Content */}
                <td className="pl-2 pr-4 whitespace-pre">
                  {row.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DiagramDiffViewer({
  original,
  fixed,
  fixes,
  onApply,
  onCancel,
}: DiagramDiffViewerProps) {
  // Track which fixes are accepted (all accepted by default)
  const [accepted, setAccepted] = useState<Set<string>>(
    () => new Set(fixes.map((f) => f.id))
  );

  const diff = useMemo(() => computeDiff(original, fixed), [original, fixed]);

  const totalChanges = diff.left.filter((l) => l.kind === "removed").length;
  const acceptedCount = accepted.size;

  // --- Handlers ---
  const toggleFix = useCallback((id: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const acceptAll = useCallback(() => {
    setAccepted(new Set(fixes.map((f) => f.id)));
  }, [fixes]);

  const rejectAll = useCallback(() => {
    setAccepted(new Set());
  }, []);

  const handleConfirm = useCallback(() => {
    const acceptedFixes = fixes.filter((f) => accepted.has(f.id));
    onApply(acceptedFixes);
  }, [fixes, accepted, onApply]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700/60 shadow-2xl overflow-hidden">

      {/* ── Top toolbar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/90 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30">
            <svg className="w-4 h-4 text-violet-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h5M2 8h5M2 12h5M9 4h5M9 8h5M9 12h5" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 leading-none">
              Diagram Diff Viewer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalChanges} line{totalChanges !== 1 ? "s" : ""} changed ·{" "}
              {fixes.length} fix{fixes.length !== 1 ? "es" : ""} available
            </p>
          </div>
        </div>

        {/* Bulk action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={acceptAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-900/40 border border-emerald-700/50 hover:bg-emerald-800/50 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={rejectAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-300 bg-red-900/30 border border-red-700/40 hover:bg-red-800/40 transition-colors"
          >
            Reject All
          </button>
        </div>
      </div>

      {/* ── Side-by-side diff panels ────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 divide-x divide-slate-700/60 overflow-hidden">
        <DiffPanel
          lines={diff.left}
          title="Original"
          lineKindCls={LINE_KIND_LEFT_CLS}
          lineNoCls={LINE_NO_LEFT_CLS}
        />
        <DiffPanel
          lines={diff.right}
          title="Fixed"
          lineKindCls={LINE_KIND_RIGHT_CLS}
          lineNoCls={LINE_NO_RIGHT_CLS}
        />
      </div>

      {/* ── Fix list ─────────────────────────────────────────────────────────── */}
      {fixes.length > 0 && (
        <div className="shrink-0 border-t border-slate-700 bg-slate-900/80">
          {/* Section heading */}
          <div className="px-5 pt-3 pb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Applied Fixes
            </span>
            <span className="text-xs text-slate-500">
              <span className="text-slate-300 font-medium">{acceptedCount}</span>
              {" / "}
              {fixes.length} accepted
            </span>
          </div>

          {/* Scrollable fix list */}
          <ul className="max-h-52 overflow-y-auto divide-y divide-slate-800/80 px-2 pb-2">
            {fixes.map((fix) => {
              const isAccepted = accepted.has(fix.id);
              return (
                <li
                  key={fix.id}
                  onClick={() => toggleFix(fix.id)}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer select-none transition-colors ${
                    isAccepted
                      ? "hover:bg-emerald-900/20"
                      : "hover:bg-slate-800/60 opacity-50"
                  }`}
                >
                  {/* Custom checkbox */}
                  <div
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border transition-all ${
                      isAccepted
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-transparent border-slate-600"
                    } flex items-center justify-center`}
                  >
                    {isAccepted && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l3 3 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Fix details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Rule badge */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-900/40 text-violet-300 border border-violet-700/40">
                        {fix.ruleId}
                      </span>
                      {/* Line badge */}
                      <span className="text-[10px] text-slate-500">
                        Line {fix.line}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Accept this fix: {fix.description}
                    </p>
                    {/* Inline before/after */}
                    <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                      <div className="bg-red-950/40 text-red-400 rounded px-2 py-1 truncate border border-red-900/30">
                        − {fix.originalLine.trim()}
                      </div>
                      <div className="bg-emerald-950/40 text-emerald-400 rounded px-2 py-1 truncate border border-emerald-900/30">
                        + {fix.fixedLine.trim()}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Bottom action bar ────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-slate-800/60 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          {acceptedCount === 0
            ? "No fixes selected — original will be kept."
            : `${acceptedCount} fix${acceptedCount !== 1 ? "es" : ""} will be applied.`}
        </p>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 hover:border-slate-500 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              acceptedCount > 0
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 8l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Apply Fixes
            {acceptedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-violet-500/40 text-violet-200">
                {acceptedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiagramDiffViewer;
