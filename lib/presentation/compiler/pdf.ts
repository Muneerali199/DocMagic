/**
 * Presentation Compiler — PDF target.
 *
 * Phase 1 strategy: print-to-PDF from the HTML compiler's PrintDeck surface.
 * The HTML target already renders pixel-exact slides from Resolved IR, so the
 * PDF inherits full fidelity with zero duplicate layout code. The viewer
 * exposes this via a dedicated print route + window.print().
 *
 * A vector-native PDF target (pdf-lib) can register later as another
 * compiler target without touching the pipeline.
 */

"use client";

import type { ResolvedIR } from "../ir/schema";

const PRINT_STORAGE_KEY = "v2-presentation-print";

/** Stash the deck for the print route and open it. */
export function exportPdf(ir: ResolvedIR): void {
  // sessionStorage is appropriate here: transient handoff to the print tab,
  // not persistence.
  sessionStorage.setItem(PRINT_STORAGE_KEY, JSON.stringify(ir));
  const w = window.open("/v2/print", "_blank");
  if (!w) {
    // popup blocked: navigate in place
    window.location.href = "/v2/print";
  }
}

/** Read the deck on the print route. */
export function readPrintDeck(): ResolvedIR | null {
  try {
    const raw = sessionStorage.getItem(PRINT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResolvedIR;
  } catch {
    return null;
  }
}
