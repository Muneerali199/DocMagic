/**
 * Repair Loop — applies the vision critic's structured repair actions.
 *
 * Repairs never touch geometry directly. Each action maps to a style-level
 * adjustment of the Design IR; the deck is then recompiled through the
 * SAME deterministic pipeline (Design Engine → Layout → Diagram → Chart →
 * Optimization). Result: targeted fixes with fully editable output.
 */

import type { DesignIR } from "../brain/design-director";
import type { RepairAction } from "../critic/vision-critic";

const DENSITY_UP: Record<DesignIR["density"], DesignIR["density"]> = {
  compact: "balanced",
  balanced: "airy",
  airy: "airy",
};

const TYPE_DOWN: Record<DesignIR["typeScale"], DesignIR["typeScale"]> = {
  generous: "regular",
  regular: "compact",
  compact: "compact",
};

const TYPE_UP: Record<DesignIR["typeScale"], DesignIR["typeScale"]> = {
  compact: "regular",
  regular: "generous",
  generous: "generous",
};

/**
 * Fold repair actions into a new Design IR. Pure — same input, same output.
 * Applies at most `maxRepairs` actions (vision critics can over-suggest).
 */
export function applyRepairs(
  designIR: DesignIR,
  repairs: RepairAction[],
  maxRepairs = 2,
): { designIR: DesignIR; applied: RepairAction[] } {
  let next = { ...designIR };
  const applied: RepairAction[] = [];

  for (const repair of repairs.slice(0, maxRepairs)) {
    switch (repair) {
      case "increase-whitespace":
        if (next.density !== "airy") {
          next = { ...next, density: DENSITY_UP[next.density] };
          applied.push(repair);
        }
        break;
      case "reduce-type-scale":
        if (next.typeScale !== "compact") {
          next = { ...next, typeScale: TYPE_DOWN[next.typeScale] };
          applied.push(repair);
        }
        break;
      case "increase-type-scale":
        if (next.typeScale !== "generous") {
          next = { ...next, typeScale: TYPE_UP[next.typeScale] };
          applied.push(repair);
        }
        break;
      case "increase-contrast":
        if (next.contrast !== "bold") {
          next = { ...next, contrast: "bold" };
          applied.push(repair);
        }
        break;
      case "soften-corners":
        if (next.corners !== "round") {
          next = {
            ...next,
            corners: next.corners === "sharp" ? "soft" : "round",
          };
          applied.push(repair);
        }
        break;
      case "sharpen-corners":
        if (next.corners !== "sharp") {
          next = { ...next, corners: "sharp" };
          applied.push(repair);
        }
        break;
    }
  }

  return { designIR: next, applied };
}
