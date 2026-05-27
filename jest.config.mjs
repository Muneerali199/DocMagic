import { webcrypto } from 'node:crypto';
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  });
}
const { default: nextJest } = await import('next/jest.js');
const createJestConfig = nextJest({ dir: './' });
const config = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@upstash/redis$': '<rootDir>/__mocks__/@upstash/redis.ts',
  },
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: ['lib/**/*.ts', 'app/api/**/*.ts', '!**/__tests__/**'],
  transformIgnorePatterns: ['node_modules/(?!(uncrypto|@upstash/redis)/)'],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/lib/cache.test.ts',
    '<rootDir>/lib/__tests__/export.test.ts',
  ],
};

// THE FIX: Intercept the Next.js config and force our compile rules
export default async function customJestConfig() {
  // 1. Let Next.js build its default config
  const nextConfig = await createJestConfig(config)();
  
  // 2. Override the Next.js rules to compile Upstash and Uncrypto
  nextConfig.transformIgnorePatterns = [
    '/node_modules/(?!(@upstash|uncrypto)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  
  // 3. Return the hacked config to Jest
  return nextConfig;
}