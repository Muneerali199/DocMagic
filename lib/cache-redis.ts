/**
 * lib/cache-redis.ts
 *
 * Distributed cache implementation backed by Upstash Redis.
 *
 * Implements the same surface area as the in-memory BoundedCache in
 * lib/cache.ts (get, set, delete, invalidateByTag, invalidateByPrefix,
 * flush) so consumers can switch between them without code changes.
 *
 * Upstash Redis is serverless-friendly: every call goes over HTTPS, so
 * it works in Next.js Edge Runtime and Node.js alike.
 *
 * Environment variables required when using this backend:
 *   UPSTASH_REDIS_URL   - REST API base URL from the Upstash console
 *   UPSTASH_REDIS_TOKEN - Read-write token from the Upstash console
 *
 * Tag-based invalidation is implemented with a Redis Set per tag.
 * Each set stores the cache keys that carry that tag. On invalidation
 * the set is read, every member is deleted, and the set is removed.
 *
 * Prefix-based invalidation uses Redis SCAN to find and delete keys.
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/lib/logger';

/** Internal envelope stored as the Redis value. */
interface RedisEntry<T> {
  value: T;
  tags: string[];
}

/** Key used for a tag's set of associated cache keys. */
function tagSetKey(tag: string): string {
  return `tag:${tag}`;
}

export class RedisCache {
  private client: Redis;
  private defaultTtlMs: number;

  constructor(defaultTtlMs: number) {
    this.defaultTtlMs = defaultTtlMs;
    this.client = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  /** Retrieve a value. Returns null on miss or if the key has expired. */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get<RedisEntry<T>>(key);
      if (!raw) return null;
      return raw.value;
    } catch (err) {
      logger.warn(null, '[cache-redis] get failed', { key, err });
      return null;
    }
  }

  /** Store a value. TTL defaults to the instance-level default. */
  async set<T>(
    key: string,
    value: T,
    opts: { ttlMs?: number; tags?: string[] } = {}
  ): Promise<void> {
    const ttlMs = opts.ttlMs ?? this.defaultTtlMs;
    const tags = opts.tags ?? [];
    const entry: RedisEntry<T> = { value, tags };

    try {
      // Store the entry with an expiry.
      await this.client.set(key, entry, { px: ttlMs });

      // Register the key in each tag's set so we can invalidate by tag.
      if (tags.length > 0) {
        const pipeline = this.client.pipeline();
        for (const tag of tags) {
          pipeline.sadd(tagSetKey(tag), key);
          // The tag set itself should expire after the longest TTL that will
          // ever reference it. We use the same TTL as the entry for simplicity.
          pipeline.pexpire(tagSetKey(tag), ttlMs);
        }
        await pipeline.exec();
      }
    } catch (err) {
      logger.warn(null, '[cache-redis] set failed', { key, err });
    }
  }

  /** Delete a single key. */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      logger.warn(null, '[cache-redis] delete failed', { key, err });
    }
  }

  /**
   * Delete all keys associated with one or more tags.
   * Returns the number of keys removed.
   */
  async invalidateByTag(...tags: string[]): Promise<number> {
    let total = 0;
    try {
      for (const tag of tags) {
        const tKey = tagSetKey(tag);
        const keys = await this.client.smembers(tKey);
        if (keys.length > 0) {
          const pipeline = this.client.pipeline();
          pipeline.del(...keys as [string, ...string[]]);
          pipeline.del(tKey);
          await pipeline.exec();
          total += keys.length;
        }
      }
      if (total > 0) {
        logger.debug(null, `[cache-redis] Invalidated ${total} entries`);
      }
    } catch (err) {
      logger.warn(null, '[cache-redis] invalidateByTag failed', { tags, err });
    }
    return total;
  }

  /**
   * Delete all keys whose name starts with a given prefix.
   * Uses SCAN to avoid blocking the Redis server.
   */
  async invalidateByPrefix(prefix: string): Promise<number> {
    let total = 0;
    try {
      let cursor: string | number = 0;
      do {
        const [nextCursor, keys]: [string | number, string[]] = await this.client.scan(cursor, {
          match: `${prefix}*`,
          count: 100,
        });
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys as [string, ...string[]]);
          total += keys.length;
        }
      } while (String(cursor) !== '0');
    } catch (err) {
      logger.warn(null, '[cache-redis] invalidateByPrefix failed', { prefix, err });
    }
    return total;
  }

  /**
   * Remove all keys from Redis.
   * WARNING: calls FLUSHDB which clears the entire database. Only suitable
   * for dedicated cache databases. Do not use if other data shares the DB.
   */
  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (err) {
      logger.warn(null, '[cache-redis] flush failed', { err });
    }
  }
}

/**
 * Returns true when the required Upstash environment variables are present,
 * indicating that the Redis backend should be used.
 */
export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN);
}
