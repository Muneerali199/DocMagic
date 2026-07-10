import type { VisualizationContext } from "../visualization/types";
import { presentationStyle } from "./helpers";
import {
  RENDERER_NATIVE_KINDS,
  type RankedVisualizationPlugin,
  type VisualizationCategory,
  type VisualizationPlugin,
} from "./types";

function validate(plugin: VisualizationPlugin): void {
  if (!plugin.id || !plugin.id.includes("/"))
    throw new Error(
      `Visualization plugin id must be stable and namespaced: ${plugin.id}`,
    );
  if (!plugin.metadata.editable)
    throw new Error(`Visualization plugin must be editable: ${plugin.id}`);
  if (!plugin.metadata.label || !plugin.metadata.description)
    throw new Error(`Visualization plugin metadata incomplete: ${plugin.id}`);
  for (const value of [
    plugin.metadata.readability,
    plugin.metadata.density,
    plugin.metadata.whitespace,
    plugin.metadata.hierarchy,
  ]) {
    if (value < 0 || value > 1)
      throw new Error(
        `Visualization plugin metadata must be normalized: ${plugin.id}`,
      );
  }
  if (
    plugin.metadata.nativeKinds.some((kind) => !RENDERER_NATIVE_KINDS.has(kind))
  )
    throw new Error(
      `Visualization plugin uses unsupported semantic kinds: ${plugin.id}`,
    );
}

export class VisualizationPluginCatalog {
  private readonly plugins = new Map<string, VisualizationPlugin>();

  constructor(plugins: VisualizationPlugin[] = []) {
    for (const plugin of plugins) this.register(plugin);
  }

  register(plugin: VisualizationPlugin): void {
    validate(plugin);
    if (this.plugins.has(plugin.id))
      throw new Error(`Visualization plugin already registered: ${plugin.id}`);
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): VisualizationPlugin | undefined {
    return this.plugins.get(id);
  }
  all(): VisualizationPlugin[] {
    return [...this.plugins.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
  byCategory(category: VisualizationCategory): VisualizationPlugin[] {
    return this.all().filter((plugin) => plugin.category === category);
  }

  rank(
    category: VisualizationCategory,
    context: VisualizationContext,
  ): RankedVisualizationPlugin[] {
    const style = presentationStyle(context);
    return this.byCategory(category)
      .filter((plugin) => plugin.supports(context))
      .map((plugin) => ({
        plugin,
        score: plugin.score(context),
        rationale: [
          `category=${category}`,
          `presentation-style=${style}`,
          `strategy=${context.composition.strategyId}`,
        ],
      }))
      .sort(
        (a, b) => b.score - a.score || a.plugin.id.localeCompare(b.plugin.id),
      );
  }

  select(
    category: VisualizationCategory,
    context: VisualizationContext,
  ): RankedVisualizationPlugin | undefined {
    return this.rank(category, context)[0];
  }
}
