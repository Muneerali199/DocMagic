import { registerPluginPrimitives } from "../visualizations/adapter";
import { VisualizationPluginCatalog } from "../visualizations/catalog";
import { ALL_VISUALIZATION_PLUGINS } from "../visualizations/categories";
import type {
  VisualizationPrimitive,
  VisualizationRegistryContract,
} from "./types";

export class VisualizationRegistry implements VisualizationRegistryContract {
  private readonly primitives = new Map<string, VisualizationPrimitive>();

  register(primitive: VisualizationPrimitive): void {
    if (this.primitives.has(primitive.id))
      throw new Error(
        `Visualization primitive already registered: ${primitive.id}`,
      );
    this.primitives.set(primitive.id, primitive);
  }

  get(id: string): VisualizationPrimitive | undefined {
    return this.primitives.get(id);
  }

  all(): VisualizationPrimitive[] {
    return [...this.primitives.values()].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
  }
}

export const defaultVisualizationPluginCatalog = new VisualizationPluginCatalog(
  ALL_VISUALIZATION_PLUGINS,
);

export function createDefaultVisualizationRegistry(): VisualizationRegistry {
  const registry = new VisualizationRegistry();
  registerPluginPrimitives(registry, defaultVisualizationPluginCatalog);
  return registry;
}

export const defaultVisualizationRegistry =
  createDefaultVisualizationRegistry();
