/**
 * lib/resource-manager.ts — Fix #19 (resource cleanup in finally)
 */
import { logger } from '@/lib/logger';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

type CleanupFn = () => void | Promise<void>;

export class ResourceManager {
  private resources = new Map<string, CleanupFn>();

  register(name: string, fn: CleanupFn) {
    this.resources.set(name, fn);
  }

  async release(): Promise<void> {
    const errors: { name: string; error: unknown }[] = [];
    for (const [name, fn] of this.resources) {
      try {
        await fn();
        this.resources.delete(name);
      } catch (e) {
        errors.push({ name, error: e });
        logger.error(null, `[RM] Cleanup failed: ${name}`, e);
      }
    }
    this.resources.clear();
    if (errors.length)
      throw new Error(`Cleanup failed: ${errors.map((e) => e.name).join(', ')}`);
  }

  get isEmpty() {
    return this.resources.size === 0;
  }
}

export async function withResources<T>(fn: (rm: ResourceManager) => Promise<T>): Promise<T> {
  const rm = new ResourceManager();
  try {
    return await fn(rm);
  } finally {
    await rm.release().catch((e) => logger.error(null, '[withResources] release() failed', e));
  }
}

export async function createTempFile(
  rm: ResourceManager,
  content: Buffer | string,
  suffix = '.tmp'
): Promise<string> {
  const p = path.join(
    os.tmpdir(),
    `draftdeck-${Date.now()}-${Math.random().toString(36).slice(2)}${suffix}`
  );
  await fs.writeFile(p, content);
  rm.register(`tmp:${p}`, () => fs.unlink(p).catch(() => undefined));
  return p;
}

export async function safeUnlink(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
      logger.warn(null, `[safeUnlink] ${filePath}`, e);
  }
}
