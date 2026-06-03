/**
 * Jest manual mock for @upstash/redis.
 *
 * The real @upstash/redis package ships ESM-only transitive deps (e.g.
 * uncrypto) that Jest cannot transform out of the box. Since the unit
 * tests only exercise the in-process BoundedCache, a lightweight stub
 * is sufficient for the test suite to compile and run without error.
 */

export class Redis {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async set(_key: string, _value: unknown, _opts?: unknown): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async del(..._keys: string[]): Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async smembers(_key: string): Promise<string[]> {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sadd(_key: string, ..._members: string[]): Promise<void> {}

  async scan(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cursor: string | number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _opts?: unknown,
  ): Promise<[string | number, string[]]> {
    return ['0', []];
  }

  async flushdb(): Promise<void> {}

  pipeline() {
    const self = this;
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      del: (..._keys: string[]) => self.pipeline(),
      exec: async () => [],
    };
  }
}
