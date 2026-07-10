/**
 * Orchestrator — wires the full v2 compiler pipeline:
 *
 *   prompt
 *     → Presentation Strategist   (LLM: intent, audience, story, length, tone)
 *     → Narrative Planner         (LLM: Semantic IR — meaning only)
 *     → Design Engine             (deterministic: design language → tokens)
 *     → Asset Intelligence        (rank + attach image assets)
 *     → Layout Intelligence       (semantic layout selection per slide)
 *     → Materializer              (typography/color/diagram/chart engines)
 *     → Optimization Pipeline     (constraints, typography, a11y, charts)
 *     → Critic                    (rule-based quality report)
 *     → Resolved IR               (consumed by Presentation Compiler targets)
 *
 * Server-only (calls Nebius + asset providers).
 */

import type { ResolvedIR, SemanticIR } from "./ir/schema";
import { runStrategist } from "./brain/strategist";
import { runNarrativePlanner } from "./brain/planner";
import { runDesignDirector, type DesignIR } from "./brain/design-director";
import { resolveDesignWithDirector } from "./design/engine";
import { applyCraftLayer } from "./design/craft";
import type { DesignTokens } from "./design/tokens";
import { composeDeck } from "./layout/composition";
import { composeScenes } from "./scene/engine";
import type { SceneAssignment } from "./scene/types";
import { composePresentation } from "./composer/composer";
import type { CompositionPlan } from "./composer/types";
import { materializeSlide } from "./layout/materialize";
import { validateAndRepair } from "./validation/engine";
import { runOptimizationPipeline } from "./optimization/pipeline";
import { builtInPasses } from "./optimization/passes";
import { selectAsset } from "./assets/intelligence";
import { defaultAssetProviders } from "./assets/providers";
import { ruleBasedCritic } from "./critic/rule-based";
import {
  ruleBasedDesignCritic,
  type CriticResult,
} from "./critic/design-critic";
import { runVisionCritic, type VisionCritique } from "./critic/vision-critic";
import { applyRepairs } from "./optimization/repair";
import { benchmarkDeck, type BenchmarkReport } from "./benchmark/metrics";
import { PluginRegistry, defaultRegistry } from "./plugins/registry";
import { builtinChartPlugin } from "./charts/engine";
import { builtinDiagramPlugin } from "./diagrams/engine";
import { enrichWithDiagrams } from "./diagrams/intelligence";
import { advancedTypographyPass } from "./optimization/typography-premium";
import { premiumWhitespacePass } from "./optimization/whitespace-premium";

// register built-ins once
let registered = false;
function ensureBuiltins(registry: PluginRegistry) {
  if (registered && registry === defaultRegistry) return;
  for (const plugin of [
    builtinChartPlugin,
    builtinDiagramPlugin,
    ...builtInPasses,
    advancedTypographyPass,
    premiumWhitespacePass,
    ruleBasedCritic,
  ]) {
    if (!registry.get(plugin.kind, plugin.id)) registry.register(plugin);
  }
  if (registry === defaultRegistry) registered = true;
}

export interface GenerateOptions {
  slideCount?: number;
  audienceHint?: string;
  /** explicit design language id (overrides Design Engine selection) */
  designLanguage?: string;
  /** Design IR from the Design Director (style decisions, no coordinates) */
  designIR?: DesignIR;
  /** vision critic + repair loop (default true; needs NEBIUS_API_KEY) */
  enableVisionCritic?: boolean;
  registry?: PluginRegistry;
  onProgress?: (stage: string, detail?: string) => void;
}

export interface GenerateResult {
  semantic: SemanticIR;
  resolved: ResolvedIR;
  benchmark: BenchmarkReport;
  /** post-render Design Critic feedback (analysis only, no regeneration) */
  designCritique: CriticResult;
  /** Design Director output (style direction) */
  designIR?: DesignIR;
  /** vision model review of the rendered slides */
  visionCritique?: VisionCritique;
  /** repair actions actually applied by the Repair Loop */
  repairsApplied?: string[];
  designLanguage: string;
  passesRun: string[];
  /** Scene Composition Engine output (semantic composition metadata) */
  sceneAssignments: SceneAssignment[];
  /** Presentation Composer output (per-slide composition intent, no geometry) */
  compositionPlans: CompositionPlan[];
}

/** Attach the best-ranked asset to every semantic image element. */
async function attachAssets(
  semantic: SemanticIR,
  tokens: DesignTokens,
): Promise<SemanticIR> {
  const jobs: Promise<void>[] = [];
  const slides = semantic.slides.map((slide) => ({
    ...slide,
    elements: slide.elements.map((el) => {
      if (el.kind !== "image" || el.src) return el;
      const copy = { ...el };
      jobs.push(
        selectAsset(
          { query: el.query, context: slide.intent, aspect: el.aspect },
          tokens,
          defaultAssetProviders,
        ).then((asset) => {
          if (asset) copy.src = asset.url;
        }),
      );
      return copy;
    }),
  }));
  await Promise.all(jobs);
  // drop image elements that found no asset (layout will reflow without them)
  return {
    ...semantic,
    slides: slides.map((slide) => ({
      ...slide,
      elements: slide.elements.filter(
        (el) => el.kind !== "image" || Boolean(el.src),
      ),
    })),
  };
}

/** Deterministic back half: Semantic IR → Resolved IR. Exported for tests. */
export async function compileSemanticIR(
  semanticInput: SemanticIR,
  options: GenerateOptions = {},
): Promise<Omit<GenerateResult, "semantic"> & { semantic: SemanticIR }> {
  const registry = options.registry ?? defaultRegistry;
  ensureBuiltins(registry);
  const progress = options.onProgress ?? (() => {});

  progress("design-director", "Directing visual style");
  let designIRResult = options.designIR;
  if (!designIRResult) {
    designIRResult = await runDesignDirector(
      semanticInput,
      options.slideCount || 6,
    );
  }

  progress("design", "Selecting design language");
  const design = resolveDesignWithDirector(
    semanticInput.strategy,
    designIRResult,
    options.designLanguage,
  );

  progress("diagram-intelligence", "Detecting diagrammatic content");
  const diagramEnriched = enrichWithDiagrams(semanticInput);
  if (diagramEnriched.conversions.length > 0) {
    progress(
      "diagram-intelligence",
      `Converted to native diagrams: ${diagramEnriched.conversions.length}`,
    );
  }

  progress("assets", "Selecting imagery");
  const semantic = await attachAssets(diagramEnriched.ir, design.tokens);

  progress("scene", "Selecting presentation scenes");
  const sceneAssignments = composeScenes(semantic.slides);

  progress("composer", "Planning composition intent");
  const composition2 = composePresentation(semantic.slides, sceneAssignments);
  const compositionPlans = composition2.plans;

  progress("compose", "Composing deck (layout diversity + rhythm)");
  const composition = composeDeck(
    semantic.slides,
    design.tokens,
    sceneAssignments,
    compositionPlans,
  );
  const resolvedSlides = composition.map((c) =>
    materializeSlide(c.slide, c.layout.id, c.result, design.tokens, registry),
  );

  let resolved: ResolvedIR = {
    version: "2.0.0",
    stage: "resolved",
    title: semantic.title,
    strategy: semantic.strategy,
    designLanguage: design.language.id,
    canvas: { width: 1280, height: 720 },
    slides: resolvedSlides,
  };

  progress("optimize", "Running optimization pipeline");
  const optimization = runOptimizationPipeline(
    resolved,
    design.tokens,
    registry.all("optimization-pass"),
  );
  resolved = optimization.ir;

  // Design Validation Engine: enforce professional design rules (contrast,
  // overflow, bounds, alignment, paragraph measure) with auto-repair, before
  // any scoring or decoration touches the deck.
  progress("validate", "Validating design rules");
  const validation = validateAndRepair(resolved, design.tokens);
  if (validation.repairedCount > 0) {
    progress(
      "validate",
      `Auto-repaired ${validation.repairedCount} design issues`,
    );
  }

  progress("critique", "Scoring quality");
  const critic = registry.all("critic")[0];
  if (critic && critic.kind === "critic") {
    resolved = {
      ...resolved,
      critic: await critic.critique(resolved, design.tokens),
    };
  }

  const benchmark = benchmarkDeck(resolved, design.tokens);

  progress("design-critique", "Evaluating rendered design");
  const designCritique = await ruleBasedDesignCritic.evaluate(
    resolved,
    design.tokens,
  );

  // Craft layer: designer-signature details (eyebrow rules, footers, ghost
  // numerals, corner accents, background rhythm). Applied after deterministic
  // critics (which audit content) so intentional low-contrast decoration is
  // not penalized; the vision critic reviews the final crafted result.
  progress("craft", "Applying designer craft details");
  applyCraftLayer(
    resolved.slides,
    design.tokens,
    design.language.id,
    resolved.title,
  );

  let visionCritique: VisionCritique | undefined;
  let repairsApplied: string[] = [];
  if (options.enableVisionCritic !== false) {
    progress("vision-critic", "Reviewing rendered slides with vision model");
    try {
      visionCritique = await runVisionCritic(resolved, design.tokens);
      if (visionCritique.repairs.length > 0) {
        progress(
          "repair-loop",
          `Applying ${visionCritique.repairs.length} targeted fixes`,
        );
        repairsApplied = applyRepairs(resolved, visionCritique.repairs);
        if (repairsApplied.length > 0) {
          // re-benchmark after repairs
          const postRepairBench = benchmarkDeck(resolved, design.tokens);
          progress(
            "repair-loop",
            `Benchmark improved: ${postRepairBench.scores.overall.toFixed(1)}/100`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : "";
      console.log("[v0] vision critic error (non-fatal):", msg);
      if (stack) console.log(stack);
      // vision critic is optional; don't fail the whole pipeline
    }
  }

  return {
    semantic,
    resolved,
    benchmark,
    designCritique,
    designIR: designIRResult,
    visionCritique,
    repairsApplied: repairsApplied.length > 0 ? repairsApplied : undefined,
    designLanguage: design.language.id,
    passesRun: optimization.passesRun,
    sceneAssignments,
    compositionPlans,
  };
}

/** Full pipeline: prompt → Resolved IR. */
export async function generatePresentation(
  prompt: string,
  options: GenerateOptions = {},
): Promise<GenerateResult> {
  const progress = options.onProgress ?? (() => {});

  progress("strategy", "Understanding intent and audience");
  const strategy = await runStrategist(prompt, {
    slideCount: options.slideCount,
    audienceHint: options.audienceHint,
  });

  progress("narrative", "Planning the story");
  const semantic = await runNarrativePlanner(prompt, strategy);

  return compileSemanticIR(semantic, options);
}
