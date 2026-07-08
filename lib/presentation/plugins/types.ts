/**
 * Plugin architecture — extension contracts for every major engine.
 *
 * Built-in engines register through the same contracts as third-party
 * extensions; nothing is tightly coupled into the core. The orchestrator
 * resolves plugins from the registry at pipeline construction time.
 */

import type {
  ResolvedElement,
  ResolvedIR,
  ResolvedSlide,
  SemanticDiagramSchema,
  SemanticChartSchema,
  CriticReport,
} from "../ir/schema";
import type { z } from "zod";
import type { DesignTokens } from "../design/tokens";
import type { Frame } from "../ir/schema";

export type PluginKind =
  | "typography"
  | "diagram"
  | "chart"
  | "animation"
  | "accessibility"
  | "translation"
  | "optimization-pass"
  | "critic";

export interface PluginBase {
  id: string;
  kind: PluginKind;
  name: string;
  version?: string;
}

/** Adjusts resolved text styles (e.g. custom fitting, hyphenation, kerning). */
export interface TypographyPlugin extends PluginBase {
  kind: "typography";
  process(slide: ResolvedSlide, tokens: DesignTokens): ResolvedSlide;
}

/** Converts a semantic diagram spec into positioned native shapes. */
export interface DiagramPlugin extends PluginBase {
  kind: "diagram";
  supports: string[]; // diagram types this plugin handles
  layout(
    diagram: z.infer<typeof SemanticDiagramSchema>,
    frame: Frame,
    tokens: DesignTokens,
  ): ResolvedElement[];
}

/** Converts a semantic chart spec into a resolved chart element. */
export interface ChartPlugin extends PluginBase {
  kind: "chart";
  supports: string[]; // chart types this plugin handles
  resolve(
    chart: z.infer<typeof SemanticChartSchema>,
    frame: Frame,
    tokens: DesignTokens,
  ): ResolvedElement;
}

/** Reserved: plans slide/element entrance animations (future phase). */
export interface AnimationPlugin extends PluginBase {
  kind: "animation";
  plan(ir: ResolvedIR): ResolvedIR;
}

/** Improves accessibility of a resolved deck (contrast, alt text, order). */
export interface AccessibilityPlugin extends PluginBase {
  kind: "accessibility";
  process(ir: ResolvedIR, tokens: DesignTokens): ResolvedIR;
}

/** Reserved: translates deck content while preserving layout (future phase). */
export interface TranslationPlugin extends PluginBase {
  kind: "translation";
  translate(ir: ResolvedIR, targetLocale: string): Promise<ResolvedIR>;
}

/** A single deterministic pass in the Optimization Pipeline. */
export interface OptimizationPassPlugin extends PluginBase {
  kind: "optimization-pass";
  /** lower runs earlier */
  order: number;
  run(ir: ResolvedIR, tokens: DesignTokens): ResolvedIR;
}

/**
 * Critic interface — defined now so a vision-model critic can drop in later
 * with zero architectural change. Phase 1 ships a rule-based implementation.
 */
export interface CriticPlugin extends PluginBase {
  kind: "critic";
  critique(ir: ResolvedIR, tokens: DesignTokens): Promise<CriticReport>;
}

export type Plugin =
  | TypographyPlugin
  | DiagramPlugin
  | ChartPlugin
  | AnimationPlugin
  | AccessibilityPlugin
  | TranslationPlugin
  | OptimizationPassPlugin
  | CriticPlugin;
