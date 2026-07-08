/**
 * Optimization Pipeline — ordered deterministic passes over Resolved IR.
 *
 * Sits between layout materialization and the Presentation Compiler:
 *   Semantic IR → layout/materialize → Optimization Pipeline → Resolved IR → Compiler
 *
 * Every pass is an OptimizationPassPlugin: pure, deterministic, no LLM.
 * External passes register through the plugin registry; built-in passes are
 * exported from ./passes and registered by the orchestrator.
 */

import type { ResolvedIR } from "../ir/schema";
import type { DesignTokens } from "../design/tokens";
import type { OptimizationPassPlugin } from "../plugins/types";

export interface OptimizationResult {
  ir: ResolvedIR;
  /** pass ids in the order they ran */
  passesRun: string[];
}

export function runOptimizationPipeline(
  ir: ResolvedIR,
  tokens: DesignTokens,
  passes: OptimizationPassPlugin[],
): OptimizationResult {
  const ordered = [...passes].sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  );
  let current = ir;
  const passesRun: string[] = [];
  for (const pass of ordered) {
    current = pass.run(current, tokens);
    passesRun.push(pass.id);
  }
  return { ir: current, passesRun };
}
