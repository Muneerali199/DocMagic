import type { CompositionPlan } from "../composer/types";
import type { SemanticElement, SemanticSlide } from "../ir/schema";
import type { SceneAssignment } from "../scene/types";
import { buildSemanticProfile } from "./profile";
import { defaultVisualizationRegistry } from "./registry";
import type { VisualizationAssignment, VisualizationContext, VisualizationEngineOptions, VisualizationPrimitive, VisualizationResult } from "./types";

function fallbackElements(slide: SemanticSlide): SemanticElement[] {
  return slide.elements.map((element) => ({ ...element }));
}

function fallbackAssignment(slide: SemanticSlide): VisualizationAssignment {
  return {
    slideId: slide.id,
    primitiveId: "generic-native",
    family: "fallback",
    variant: "preserve-source",
    confidence: 0,
    rationale: ["No specialized primitive met the structural confidence threshold; preserved native semantic content."],
    blueprint: {
      family: "fallback",
      variant: "preserve-source",
      dominantRole: "source-content",
      supportingRoles: [],
      nativeKinds: [...new Set(slide.elements.map((element) => element.kind))].sort(),
      editable: true,
    },
    generatedElementIds: [],
  };
}

function selectPrimitive(primitives: VisualizationPrimitive[], context: VisualizationContext) {
  return primitives
    .map((primitive) => ({ primitive, score: primitive.score(context.profile) + (primitive.priority ?? 0) }))
    .sort((a, b) => b.score - a.score || a.primitive.id.localeCompare(b.primitive.id))[0];
}

export function visualizeSlides(
  slides: SemanticSlide[],
  scenes: SceneAssignment[],
  plans: CompositionPlan[],
  options: VisualizationEngineOptions = {},
): VisualizationResult {
  const registry = options.registry ?? defaultVisualizationRegistry;
  const minimumScore = options.minimumScore ?? 50;
  const sceneBySlide = new Map(scenes.map((scene) => [scene.slideId, scene]));
  const planBySlide = new Map(plans.map((plan) => [plan.slideId, plan]));
  const assignments: VisualizationAssignment[] = [];

  const enrichedSlides = slides.map((slide) => {
    const scene = sceneBySlide.get(slide.id);
    const composition = planBySlide.get(slide.id);
    if (!scene || !composition) {
      assignments.push(fallbackAssignment(slide));
      return { ...slide, elements: fallbackElements(slide) };
    }

    const profile = buildSemanticProfile(slide, scene, composition);
    const context: VisualizationContext = { slide, scene, composition, profile };
    const selected = selectPrimitive(registry.all(), context);
    if (!selected || selected.score < minimumScore) {
      assignments.push(fallbackAssignment(slide));
      return { ...slide, elements: fallbackElements(slide) };
    }

    const built = selected.primitive.build(context);
    const elements = built.elements.length ? built.elements : fallbackElements(slide);
    const sourceIds = new Set(slide.elements.map((element) => element.id));
    const generatedElementIds = elements.filter((element) => !sourceIds.has(element.id)).map((element) => element.id);
    assignments.push({
      slideId: slide.id,
      primitiveId: selected.primitive.id,
      family: selected.primitive.family,
      variant: built.variant,
      confidence: Math.min(1, Math.max(0, selected.score / 120)),
      rationale: [
        `Selected from typed slide structure (${profile.slideType}), scene (${profile.scene}), and native element topology.`,
        `Deterministic registry score: ${selected.score.toFixed(2)}.`,
      ],
      blueprint: built.blueprint,
      generatedElementIds,
    });
    return { ...slide, elements };
  });

  return { slides: enrichedSlides, assignments };
}
