/**
 * Plugin registry — engines resolve their extensions from here.
 * Built-in plugins self-register at module load; consumers can register
 * additional plugins before running the pipeline.
 */

import type { Plugin, PluginKind } from "./types";

export class PluginRegistry {
  private plugins = new Map<string, Plugin>();

  register(plugin: Plugin): void {
    const key = `${plugin.kind}:${plugin.id}`;
    if (this.plugins.has(key)) {
      throw new Error(`Plugin already registered: ${key}`);
    }
    this.plugins.set(key, plugin);
  }

  unregister(kind: PluginKind, id: string): void {
    this.plugins.delete(`${kind}:${id}`);
  }

  get<T extends Plugin>(kind: PluginKind, id: string): T | undefined {
    return this.plugins.get(`${kind}:${id}`) as T | undefined;
  }

  all<T extends Plugin>(kind: PluginKind): T[] {
    const result: T[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.kind === kind) result.push(plugin as T);
    }
    return result;
  }
}

/** Shared default registry used by the orchestrator. */
export const defaultRegistry = new PluginRegistry();
