"use client";

import React, { useState, useEffect } from "react";
import { LintError } from "@/lib/diagram-lint-store";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wand2,
  CheckCircle2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Documentation Mapping
// ---------------------------------------------------------------------------
const RULE_DOCS: Record<string, string> = {
  "unquoted-parentheses":
    "https://mermaid.js.org/syntax/flowchart.html#node-shapes-1",
  "reserved-keyword-node-id":
    "https://mermaid.js.org/syntax/flowchart.html",
  "missing-subgraph-end":
    "https://mermaid.js.org/syntax/flowchart.html#subgraphs",
  "malformed-html-label":
    "https://mermaid.js.org/syntax/flowchart.html#interaction",
  "invalid-sequence-arrow":
    "https://mermaid.js.org/syntax/sequenceDiagram.html#messages",
  "special-chars-state-id":
    "https://mermaid.js.org/syntax/stateDiagram.html",
  "spaces-in-node-id":
    "https://mermaid.js.org/syntax/flowchart.html",
  "mismatched-shape-brackets":
    "https://mermaid.js.org/syntax/flowchart.html#node-shapes-1",
  "gantt-date-format-mismatch":
    "https://mermaid.js.org/syntax/gantt.html",
  "invalid-gitgraph-commit":
    "https://mermaid.js.org/syntax/gitgraph.html",
};

function getDocsUrl(ruleId: string): string {
  return RULE_DOCS[ruleId] ?? "https://mermaid.js.org/";
}

// Helper to get error ID
const getErrorId = (error: LintError): string => {
  return `${error.ruleId}-L${error.line}`;
};

export interface LintResultsPanelProps {
  errors: LintError[];
  onAutoFix: (errorIds: string[]) => void;
  onHighlightLine?: (line: number) => void;
  className?: string;
}

export function LintResultsPanel({
  errors,
  onAutoFix,
  onHighlightLine,
  className = "",
}: LintResultsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // Sort errors by severity (errors first, then warnings) and then by line
  const sortedErrors = [...errors].sort((a, b) => {
    if (a.severity === "error" && b.severity === "warning") return -1;
    if (a.severity === "warning" && b.severity === "error") return 1;
    return a.line - b.line;
  });

  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;
  const fixableErrors = errors.filter((e) => e.autoFixable);

  // Initialize and sync checkedIds whenever errors change
  useEffect(() => {
    setCheckedIds(fixableErrors.map(getErrorId));
  }, [errors]);

  const handleToggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const fixableIds = fixableErrors.map(getErrorId);
    if (checkedIds.length === fixableIds.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(fixableIds);
    }
  };

  const handleRowClick = (e: React.MouseEvent, line: number) => {
    // If the click was inside a checkbox, link, or button, ignore row highlight action
    const target = e.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest("a") ||
      target.closest("button")
    ) {
      return;
    }

    if (onHighlightLine) {
      onHighlightLine(line);
    } else {
      const textarea = document.getElementById("diagramCode") as HTMLTextAreaElement;
      if (textarea) {
        const lines = textarea.value.split("\n");
        if (line >= 1 && line <= lines.length) {
          let startIdx = 0;
          for (let i = 0; i < line - 1; i++) {
            startIdx += lines[i].length + 1;
          }
          const endIdx = startIdx + lines[line - 1].length;
          textarea.focus();
          textarea.setSelectionRange(startIdx, endIdx);

          // Scroll the textarea to the line center
          const lineHeight = parseInt(
            window.getComputedStyle(textarea).lineHeight || "20",
            10
          );
          textarea.scrollTop =
            lineHeight * (line - 1) - textarea.clientHeight / 2;
        }
      }
    }
  };

  const handleApplyFix = () => {
    if (checkedIds.length > 0) {
      onAutoFix(checkedIds);
    }
  };

  if (errors.length === 0) {
    return (
      <div className={`glass-effect border border-green-500/20 bg-green-950/10 p-4 rounded-xl flex items-center gap-3 ${className}`}>
        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-green-400">All checks passed!</h4>
          <p className="text-xs text-slate-400">No syntax errors or warnings detected in your Mermaid diagram code.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-effect border border-yellow-400/20 bg-slate-950/60 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${className}`}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center justify-between px-4 py-3 bg-slate-900/60 cursor-pointer select-none border-b border-yellow-400/10 hover:bg-slate-900/90 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h4 className="text-xs sm:text-sm font-bold text-slate-200">
            Diagram Diagnostics
          </h4>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                <AlertCircle className="w-3 h-3" />
                {errorCount} {errorCount === 1 ? "Error" : "Errors"}
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" />
                {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
              </span>
            )}
          </div>
        </div>

        <button
          aria-label={isCollapsed ? "Expand diagnostics" : "Collapse diagnostics"}
          className="flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Collapsible Body ──────────────────────────────────────────────── */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          <ul className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto pr-1 space-y-2">
            {sortedErrors.map((error, idx) => {
              const errorId = getErrorId(error);
              const isChecked = checkedIds.includes(errorId);
              const isError = error.severity === "error";

              return (
                <li
                  key={`${error.ruleId}-${error.line}-${error.column}-${idx}`}
                  onClick={(e) => handleRowClick(e, error.line)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer group select-none ${
                    isError
                      ? "bg-red-950/20 border-red-900/30 hover:bg-red-950/30"
                      : "bg-amber-950/15 border-amber-900/25 hover:bg-amber-950/25"
                  }`}
                >
                  {/* Left element: Checkbox or dot */}
                  {error.autoFixable ? (
                    <div className="mt-0.5 shrink-0 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCheck(errorId)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-yellow-500 focus:ring-yellow-500/50 cursor-pointer"
                        aria-label={`Select fix for ${error.ruleId} on line ${error.line}`}
                      />
                    </div>
                  ) : (
                    <div className="mt-1.5 shrink-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full block ${
                          isError ? "bg-red-500" : "bg-amber-500"
                        }`}
                      />
                    </div>
                  )}

                  {/* Diagnostic content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono font-semibold border ${
                          isError
                            ? "bg-red-950/50 text-red-300 border-red-800/40"
                            : "bg-amber-950/50 text-amber-300 border-amber-800/40"
                        }`}
                      >
                        {error.ruleId}
                      </span>
                      <span className="text-slate-500 font-medium">
                        Line {error.line}, Col {error.column}
                      </span>
                      {error.autoFixable && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                          ⚡ Auto-fixable
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-200 leading-normal font-medium">
                      {error.message}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Click to highlight inside editor
                    </p>
                  </div>

                  {/* Manual documentation link */}
                  {!error.autoFixable && (
                    <div className="shrink-0 self-center">
                      <a
                        href={getDocsUrl(error.ruleId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <span>Fix manually</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* ── Actions Footer ────────────────────────────────────────────── */}
          {fixableErrors.length > 0 && (
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={handleToggleAll}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                {checkedIds.length === fixableErrors.length
                  ? "Deselect All"
                  : "Select All Auto-Fixable"}
              </button>

              <button
                type="button"
                onClick={handleApplyFix}
                disabled={checkedIds.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-fix selected ({checkedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LintResultsPanel;
