/**
 * Presentation Art Director — public surface.
 *
 * Deterministic stage between the Visualization Engine and the Layout Engine
 * that converts a technically-correct deck into an art-directed one: emotional
 * intent, visual hierarchy, premium whitespace, and deck-level rhythm. Emits
 * semantic design decisions only — never coordinates or renderer output.
 */

export { directPresentation } from "./director";
export { inferEmotionalIntent } from "./intent";
export { buildHierarchy, descriptorOf } from "./hierarchy";
export { sequenceRhythm } from "./rhythm";
export type { RhythmSignal, RhythmDecision } from "./rhythm";
export type { HierarchyModel } from "./hierarchy";
export * from "./types";
