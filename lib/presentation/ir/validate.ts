/**
 * Validation + repair helpers for the Presentation IR.
 * Used by the Narrative Planner (to validate LLM output) and by the
 * deterministic pipeline (to assert invariants between passes).
 */

import { z } from "zod";
import {
  SemanticIRSchema,
  ResolvedIRSchema,
  PresentationStrategySchema,
  type SemanticIR,
  type ResolvedIR,
  type PresentationStrategy,
} from "./schema";

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  errors: string[];
}

function run<T>(
  schema: { safeParse: (input: unknown) => z.SafeParseReturnType<unknown, T> },
  input: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data, errors: [] };
  return {
    ok: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".") || "(root)"}: ${i.message}`,
    ),
  };
}

export function validateStrategy(
  input: unknown,
): ValidationResult<PresentationStrategy> {
  return run(PresentationStrategySchema, input);
}

export function validateSemanticIR(
  input: unknown,
): ValidationResult<SemanticIR> {
  return run(SemanticIRSchema, input);
}

export function validateResolvedIR(
  input: unknown,
): ValidationResult<ResolvedIR> {
  return run(ResolvedIRSchema, input);
}

/**
 * Extract the first JSON object from raw LLM text output.
 * Handles markdown fences and leading/trailing prose.
 */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  // strip markdown fences
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // fall through to brace matching
  }
  const start = candidate.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in model output");
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const ch = candidate[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') inString = !inString;
    if (inString) continue;
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, i + 1));
      }
    }
  }
  throw new Error("Unbalanced JSON object in model output");
}

/**
 * Cheap deterministic repairs for common LLM output defects before Zod parse.
 */
export function repairSemanticIR(input: unknown): unknown {
  if (typeof input !== "object" || input === null) return input;
  const ir = input as Record<string, unknown>;

  if (Array.isArray(ir.slides)) {
    ir.slides = ir.slides
      .filter((s) => typeof s === "object" && s !== null)
      .map((s, si) => {
        const slide = s as Record<string, unknown>;
        if (typeof slide.id !== "string" || !slide.id)
          slide.id = `slide-${si + 1}`;
        if (typeof slide.intent !== "string") slide.intent = "";
        if (Array.isArray(slide.elements)) {
          slide.elements = slide.elements
            .filter((e) => typeof e === "object" && e !== null)
            .map((e, ei) => {
              const el = e as Record<string, unknown>;
              if (typeof el.id !== "string" || !el.id)
                el.id = `el-${si + 1}-${ei + 1}`;
              // planners sometimes emit "type" instead of "kind"
              if (!el.kind && typeof el.type === "string") el.kind = el.type;
              return el;
            });
        }
        return slide;
      });
  }
  return ir;
}
