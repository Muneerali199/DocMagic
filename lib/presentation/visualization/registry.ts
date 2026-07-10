import { BUILTIN_VISUALIZATION_PRIMITIVES } from "./primitives";
import type { VisualizationPrimitive, VisualizationRegistryContract } from "./types";

export class VisualizationRegistry implements VisualizationRegistryContract {
  private readonly primitives = new Map<string, VisualizationPrimitive>();

  register(primitive: VisualizationPrimitive): void {
    if (this.primitives.has(primitive.id)) throw new Error(`Visualization primitive already registered: ${primitive.id}`);
    this.primitives.set(primitive.id, primitive);
  }

  get(id: string): VisualizationPrimitive | undefined {
    return this.primitives.get(id);
  }

  all(): VisualizationPrimitive[] {
    return [...this.primitives.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
}

export function createDefaultVisualizationRegistry(): VisualizationRegistry {
  const registry = new VisualizationRegistry();
  for (const primitive of BUILTIN_VISUALIZATION_PRIMITIVES) registry.register(primitive);
  return registry;
}

export const defaultVisualizationRegistry = createDefaultVisualizationRegistry();
