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
import { resolveDesign } from "./design/engine";
import type { DesignTokens } from "./design/tokens";
import { selectLayout } from "./layout/intelligence";
import { materializeSlide } from "./layout/materialize";
import { runOptimizationPipeline } from "./optimization/pipeline";
import { builtInPasses } from "./optimization/passes";
import { selectAsset } from "./assets/intelligence";
import { defaultAssetProviders } from "./assets/providers";
import { ruleBasedCritic } from "./critic/rule-based";
import { benchmarkDeck, type BenchmarkReport } from "./benchmark/metrics";
import { PluginRegistry, defaultRegistry } from "./plugins/registry";
import { builtinChartPlugin } from "./charts/engine";
import { builtinDiagramPlugin } from "./diagrams/engine";

// register built-ins once
let registered = false;
function ensureBuiltins(registry: PluginRegistry) {
  if (registered && registry === defaultRegistry) return;
  for (const plugin of [
    builtinChartPlugin,
    builtinDiagramPlugin,
    ...builtInPasses,
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
  registry?: PluginRegistry;
  onProgress?: (stage: string, detail?: string) => void;
}

export interface GenerateResult {
  semantic: SemanticIR;
  resolved: ResolvedIR;
  benchmark: BenchmarkReport;
  designLanguage: string;
  passesRun: string[];
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

  progress("design", "Selecting design language");
  const design = resolveDesign(semanticInput.strategy, options.designLanguage);

  progress("assets", "Selecting imagery");
  const semantic = await attachAssets(semanticInput, design.tokens);

  progress("layout", "Laying out slides");
  const resolvedSlides = semantic.slides.map((slide) => {
    const selection = selectLayout(slide, design.tokens);
    return materializeSlide(
      slide,
      selection.layout.id,
      selection.result,
      design.tokens,
      registry,
    );
  });

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

  progress("critique", "Scoring quality");
  const critic = registry.all("critic")[0];
  if (critic && critic.kind === "critic") {
    resolved = {
      ...resolved,
      critic: await critic.critique(resolved, design.tokens),
    };
  }

  const benchmark = benchmarkDeck(resolved, design.tokens);

  return {
    semantic,
    resolved,
    benchmark,
    designLanguage: design.language.id,
    passesRun: optimization.passesRun,
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
