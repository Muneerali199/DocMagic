'use client';

import React from 'react';
import { SlideQualityReport } from '@/lib/analyzeSlideQuality';

interface SlideQualityPanelProps {
  isOpen: boolean;
  reports: SlideQualityReport[];
  onAutoFix: (slideNumber: number, ruleIds: string[]) => void;
  onExportAnyway: () => void;
  onExportClean: () => void;
  onClose: () => void;
}

export function SlideQualityPanel({
  isOpen,
  reports,
  onAutoFix,
  onExportAnyway,
  onExportClean,
  onClose,
}: SlideQualityPanelProps) {
  if (!isOpen) return null;

  // Find all autoFixable issues across all reports
  const handleFixAll = () => {
    reports.forEach((report) => {
      const autoFixableRuleIds = report.issues
        .filter((issue) => issue.autoFixable)
        .map((issue) => issue.ruleId);
      
      if (autoFixableRuleIds.length > 0) {
        onAutoFix(report.slideNumber, autoFixableRuleIds);
      }
    });
  };

  // Check if there are any errors in any report
  const hasErrors = reports.some((report) =>
    report.issues.some((issue) => issue.severity === 'error')
  );

  // Check if there are any auto-fixable issues at all
  const hasAutoFixable = reports.some((report) =>
    report.issues.some((issue) => issue.autoFixable)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
              Slide Quality Check
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {reports.map((report) => {
            const errorCount = report.issues.filter((i) => i.severity === 'error').length;
            const warningCount = report.issues.filter((i) => i.severity === 'warning').length;
            const hasSlideErrors = errorCount > 0;

            return (
              <div
                key={report.slideNumber}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                {/* REPORT ROW */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Slide {report.slideNumber} — {report.slideTitle}
                  </span>
                  <div>
                    {report.passed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        ✓ Passed
                      </span>
                    ) : hasSlideErrors ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        ✗ {errorCount} Error(s)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        ⚠ {warningCount} Warning(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* ISSUES */}
                {report.issues.length > 0 && (
                  <div className="pl-4 mt-3 space-y-2 border-l border-zinc-100 dark:border-zinc-800">
                    {report.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2 mt-2">
                        {issue.severity === 'error' ? (
                          <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-zinc-600 dark:text-zinc-400 flex-1">
                          {issue.message}
                        </span>
                        {issue.autoFixable ? (
                          <button
                            type="button"
                            onClick={() => onAutoFix(report.slideNumber, [issue.ruleId])}
                            className="text-xs font-medium px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-400 rounded-md transition-colors flex-shrink-0"
                          >
                            Auto Fix
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 flex-shrink-0 self-center">
                            Fix Manually
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/80">
          <button
            type="button"
            onClick={handleFixAll}
            disabled={!hasAutoFixable}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 rounded-xl transition-all shadow-sm hover:shadow duration-200"
          >
            Fix All Auto-Fixable
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Some issues remain. Export anyway?')) {
                  onExportAnyway();
                }
              }}
              className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all duration-200"
            >
              Export Anyway
            </button>
            <button
              type="button"
              onClick={() => {
                const hasErrors = reports.some(r =>
                  r.issues.some(i => i.severity === 'error')
                );
                if (!hasErrors) {
                  alert('✅ Export Clean Deck triggered! No errors found.');
                  onExportClean();
                }
              }}
              disabled={hasErrors}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm ${
                hasErrors
                  ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow'
              }`}
            >
              Export Clean Deck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
