export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true,
      isolatedModules: true,
    }],
  },
  transformIgnorePatterns: ['/node_modules/(?!react|react-dom|next|@testing-library)'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};