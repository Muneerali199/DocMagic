/**
 * @fileoverview Zustand store for the lint-gated diagram render/export pipeline.
 *
 * Flow:
 *   runLint(source, action, format?)
 *     → lintMermaid → errors
 *     → severity 'error' (non-fixable) → lintState = 'error'   (action blocked)
 *     → autoFixable errors exist       → lintState = 'diff-pending' (DiagramDiffViewer)
 *     → warnings only                  → lintState = 'warning'  (banner, action runs)
 *     → no errors                      → lintState = 'idle'      (action runs)
 */

'use client';

import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Public types (re-exported so consumers avoid importing the root .js file)
// ---------------------------------------------------------------------------

export interface LintError {
  ruleId: string;
  severity: 'error' | 'warning';
  message: string;
  line: number;
  column: number;
  autoFixable: boolean;
}

export interface FixRecord {
  ruleId: string;
  originalText: string;
  fixedText: string;
  lineNumber: number;
}

export interface AutoFixResult {
  fixedSource: string;
  appliedFixes: FixRecord[];
  skippedConflicts: FixRecord[];
}

export type LintGateState = 'idle' | 'error' | 'warning' | 'diff-pending';
export type PendingAction = 'render' | 'export';

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface DiagramLintState {
  lintErrors: LintError[];
  fixResult: AutoFixResult | null;
  lintState: LintGateState;
  pendingAction: PendingAction | null;
  pendingFormat: 'png' | 'svg' | null;
  warningDismissed: boolean;

  /**
   * Run lintMermaid on `source`, set the gate state, and return whether the
   * calling action should proceed immediately.
   *
   * - `{ proceed: true  }` → caller runs the action with `source`
   * - `{ proceed: false }` → caller blocks; overlays handle next step
   */
  runLint: (
    source: string,
    action: PendingAction,
    format?: 'png' | 'svg',
    lintFn?: (src: string) => LintError[],
    autoFixFn?: (src: string, errors: LintError[]) => AutoFixResult,
  ) => { proceed: boolean; source: string };

  /**
   * Reconstruct the source using only the accepted fixes (by their synthesised IDs)
   * then reset the gate state.
   */
  resolveDiff: (
    originalSource: string,
    acceptedFixIds: string[],
    autoFixFn?: (src: string, errors: LintError[]) => AutoFixResult,
  ) => string;

  dismissWarning: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial state snapshot (used in reset)
// ---------------------------------------------------------------------------

const INITIAL: Pick<
  DiagramLintState,
  'lintErrors' | 'fixResult' | 'lintState' | 'pendingAction' | 'pendingFormat' | 'warningDismissed'
> = {
  lintErrors: [],
  fixResult: null,
  lintState: 'idle',
  pendingAction: null,
  pendingFormat: null,
  warningDismissed: false,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDiagramLintStore = create<DiagramLintState>((set, get) => ({
  ...INITIAL,

  // ── runLint ───────────────────────────────────────────────────────────────
  runLint(source, action, format, lintFn, autoFixFn) {
    // Reset to a clean slate for this run
    set({ ...INITIAL, pendingAction: action, pendingFormat: format ?? null });

    // If lint functions were not injected (e.g., module not loaded yet) → proceed
    if (!lintFn || !autoFixFn) {
      return { proceed: true, source };
    }

    try {
      const errors = lintFn(source);

      const errorSeverity  = errors.filter((e) => e.severity === 'error');
      const warningSeverity = errors.filter((e) => e.severity === 'warning');

      if (errorSeverity.length > 0) {
        const autoFixableErrors = errorSeverity.filter((e) => e.autoFixable);

        if (autoFixableErrors.length > 0) {
          // At least some errors are fixable → show diff viewer
          const fixResult = autoFixFn(source, errorSeverity);
          set({ lintErrors: errors, fixResult, lintState: 'diff-pending' });
          return { proceed: false, source };
        }

        // All errors are non-fixable → hard block
        set({ lintErrors: errors, lintState: 'error' });
        return { proceed: false, source };
      }

      if (warningSeverity.length > 0) {
        // Warnings only → show banner, let action run
        set({ lintErrors: errors, lintState: 'warning', warningDismissed: false });
        return { proceed: true, source };
      }

      // No issues
      return { proceed: true, source };
    } catch (err) {
      console.warn('[DiagramLintStore] runLint threw:', err);
      return { proceed: true, source };
    }
  },

  // ── resolveDiff ───────────────────────────────────────────────────────────
  resolveDiff(originalSource, acceptedFixIds, autoFixFn) {
    const { lintErrors } = get();
    let resolvedSource = originalSource;

    if (autoFixFn && acceptedFixIds.length > 0) {
      try {
        // Synthesised IDs are "${ruleId}-L${line}"
        const acceptedSet = new Set(acceptedFixIds);
        const acceptedErrors = lintErrors.filter((e) =>
          acceptedSet.has(`${e.ruleId}-L${e.line}`),
        );

        if (acceptedErrors.length > 0) {
          const { fixedSource } = autoFixFn(originalSource, acceptedErrors);
          resolvedSource = fixedSource;
        }
      } catch (err) {
        console.warn('[DiagramLintStore] resolveDiff threw:', err);
      }
    }

    set({ ...INITIAL });
    return resolvedSource;
  },

  // ── dismissWarning ────────────────────────────────────────────────────────
  dismissWarning() {
    set({ warningDismissed: true });
  },

  // ── reset ─────────────────────────────────────────────────────────────────
  reset() {
    set({ ...INITIAL });
  },
}));
