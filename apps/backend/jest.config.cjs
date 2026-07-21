/** Unit test config (colocated *.spec.ts). Integration/e2e use test/jest-e2e.json. */
/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  collectCoverageFrom: ['**/*.ts', '!**/*.module.ts', '!**/main.ts', '!**/worker.ts'],
  coverageDirectory: '../coverage',
  // Use the V8 provider: the default 'babel' provider re-instruments sources and
  // strips TypeScript decorator metadata (emitDecoratorMetadata), which breaks
  // NestJS dependency injection under coverage. V8 uses native coverage and
  // preserves the ts-jest output, so DI-based specs run correctly.
  coverageProvider: 'v8',
  // Coverage ratchet floor. Raised after real unit coverage of the shared
  // config (env validation) and the global exception filter landed, lifting
  // measured coverage to ~56% statements / ~74% branches / ~65% functions.
  // The floor sits just below the current measurement to prevent regressions
  // while leaving headroom, and is raised toward the 80% target as real
  // feature logic lands in Sprint 1B (see docs/reports/QUALITY-GATES.md).
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 65,
      functions: 60,
      lines: 50,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@mrms/types$': '<rootDir>/../../../packages/types/src/index.ts',
  },
};
