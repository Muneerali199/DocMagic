/**
 * Scene Composition Engine — deterministic scene + variant assignment.
 *
 * Runs BEFORE layout resolution. For every slide it:
 *   1. classifies the slide into a presentation scene (classifier.ts)
 *   2. selects a composition variant from the scene library
 *
 * Diversity rules (all deterministic, no RNG):
 *   - consecutive slides never share the same composition variant
 *   - consecutive slides avoid repeating the same scene unless the content
 *     genuinely demands it (the runner-up scene must be a close semantic fit)
 *   - variant reuse across the deck is discouraged via usage counting
 *   - variant fit is scored against the slide's content volume and element
 *     mix so structure still matches the material
 *
 * Output is exclusively semantic composition metadata (SceneAssignment).
 * No coordinates ever leave this module — positioning belongs to the
 * existing Layout Engine.
 */

import type { SemanticSlide } from "../ir/schema";
import { categorize } from "../layout/library";
import { classifySlide, type SceneClassification } from "./classifier";
import { getScene } from "./library";
import type { CompositionVariant, SceneAssignment, SceneId } from "./types";

// ---------------------------------------------------------------------------
// Deterministic hashing (FNV-1a) — stable tie-breaking without RNG
// ---------------------------------------------------------------------------

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// ---------------------------------------------------------------------------
// Variant fit scoring
// ---------------------------------------------------------------------------

function contentVolume(slide: SemanticSlide): number {
  let chars = 0;
  for (const el of slide.elements) {
    if (el.kind === "text") {
      chars += el.content.length + (el.items?.join("").length ?? 0);
    }
  }
  return Math.min(1, chars / 900);
}

function dominantFocal(slide: SemanticSlide): CompositionVariant["focal"] {
  const c = categorize(slide);
  const data = c.metrics.length + c.charts.length + c.tables.length;
  const structure = c.diagrams.length;
  const media = c.media.length;
  const text = c.texts.length;
  if (structure > 0 && structure >= data) return "structure";
  if (data > Math.max(media, 1)) return "data";
  if (media > 0 && text <= 2) return "media";
  if (text >= 3) return "narrative";
  return "statement";
}

/** How well a variant's composition intent matches the slide's material. */
function variantFit(variant: CompositionVariant, slide: SemanticSlide): number {
  let score = 0;

  // focal alignment: the variant should spotlight what the slide contains
  const focal = dominantFocal(slide);
  if (variant.focal === focal) score += 10;
  else if (variant.focal === "narrative" || focal === "statement") score += 4;

  // density alignment: dense material should not land on an airy variant
  const volume = contentVolume(slide);
  score -= Math.abs(volume - variant.density) * 12;

  // element count vs zone capacity (soft)
  const n = slide.elements.length;
  const capacity = variant.zones.length;
  score -= Math.min(6, Math.abs(n - capacity) * 1.5);

  return score;
}

// ---------------------------------------------------------------------------
// Diversity-aware selection
// ---------------------------------------------------------------------------

const DIVERSITY = {
  /** same variant as the immediately previous slide — effectively forbidden */
  adjacentVariantRepeat: 100,
  /** same scene as the immediately previous slide */
  adjacentSceneRepeat: 15,
  /** each earlier use of a variant anywhere in the deck */
  variantReuse: 6,
  /** each earlier use of the same structure as the previous slide */
  adjacentStructureRepeat: 5,
  /** runner-up scene must be within this margin to replace a repeated scene */
  sceneSwapMargin: 10,
} as const;

/** Scenes where content dictates structure; repeats are legitimate. */
const REPEAT_EXEMPT_SCENES = new Set<SceneId>(["hero", "quote"]);

interface SelectionState {
  prev?: SceneAssignment;
  variantUsage: Map<string, number>;
  sceneUsage: Map<SceneId, number>;
}

function resolveScene(
  classification: SceneClassification,
  state: SelectionState,
): { scene: SceneId; rationale: string[] } {
  const rationale = [...classification.rationale];
  let scene = classification.scene;

  // Avoid repeating the previous slide's scene when a close-scoring
  // alternative exists. If nothing is semantically close, the repeat is
  // "explicitly required by the presentation structure" and stands.
  if (
    state.prev &&
    state.prev.scene === scene &&
    !REPEAT_EXEMPT_SCENES.has(scene)
  ) {
    const alternative = classification.ranking.find(
      (r) => r.scene !== scene && r.score > 0,
    );
    if (
      alternative &&
      classification.score - alternative.score <= DIVERSITY.sceneSwapMargin
    ) {
      rationale.push(
        `scene swap: "${scene}" repeated previous slide; ` +
          `"${alternative.scene}" is a close fit (${alternative.score} vs ${classification.score})`,
      );
      scene = alternative.scene;
    } else {
      rationale.push(
        `scene repeat allowed: no close alternative to "${scene}"`,
      );
    }
  }

  return { scene, rationale };
}

function selectVariant(
  scene: SceneId,
  slide: SemanticSlide,
  state: SelectionState,
): { variant: CompositionVariant; rationale: string[] } {
  const definition = getScene(scene);
  const rationale: string[] = [];
  const seed = fnv1a(`${slide.id}::${slide.intent}::${scene}`);

  let best: CompositionVariant = definition.variants[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  definition.variants.forEach((variant, idx) => {
    let score = variantFit(variant, slide);

    // hard diversity: never repeat the previous slide's exact variant
    if (state.prev && state.prev.variant.id === variant.id) {
      score -= DIVERSITY.adjacentVariantRepeat;
    }
    // soft diversity: discourage structural echo of the previous slide
    if (state.prev && state.prev.variant.structure === variant.structure) {
      score -= DIVERSITY.adjacentStructureRepeat;
    }
    // deck-wide variant reuse decay
    score -= (state.variantUsage.get(variant.id) ?? 0) * DIVERSITY.variantReuse;

    // deterministic tie-breaking: seeded preference, stable per slide
    score += ((seed >> (idx % 8)) & 0x3) * 0.01;

    if (score > bestScore) {
      bestScore = score;
      best = variant;
    }
  });

  rationale.push(`variant "${best.id}" selected (fit ${bestScore.toFixed(2)})`);
  return { variant: best, rationale };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Assign a scene + composition variant to every slide in the deck.
 * Pure and deterministic: identical input always yields identical output.
 */
export function composeScenes(slides: SemanticSlide[]): SceneAssignment[] {
  const assignments: SceneAssignment[] = [];
  const state: SelectionState = {
    variantUsage: new Map(),
    sceneUsage: new Map(),
  };

  slides.forEach((slide, index) => {
    const classification = classifySlide(slide, {
      index,
      total: slides.length,
    });
    const { scene, rationale: sceneRationale } = resolveScene(
      classification,
      state,
    );
    const { variant, rationale: variantRationale } = selectVariant(
      scene,
      slide,
      state,
    );

    const assignment: SceneAssignment = {
      slideId: slide.id,
      scene,
      variant,
      score: classification.score,
      rationale: [...sceneRationale, ...variantRationale],
    };

    assignments.push(assignment);
    state.prev = assignment;
    state.variantUsage.set(
      variant.id,
      (state.variantUsage.get(variant.id) ?? 0) + 1,
    );
    state.sceneUsage.set(scene, (state.sceneUsage.get(scene) ?? 0) + 1);
  });

  return assignments;
}

export { classifySlide } from "./classifier";
export { SCENE_LIBRARY, getScene } from "./library";
export type {
  SceneAssignment,
  SceneId,
  CompositionVariant,
  SceneDefinition,
} from "./types";
