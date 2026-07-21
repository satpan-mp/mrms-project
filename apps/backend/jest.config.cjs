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
  // Coverage ratchet floor. The foundation is mostly wiring, so absolute
  // coverage is low today; this floor prevents regressions and is raised toward
  // the 80% target as real feature logic lands (see docs/certification).
  coverageThreshold: {
    global: {
      statements: 12,
      branches: 20,
      functions: 25,
      lines: 12,
    },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@mrms/types$': '<rootDir>/../../../packages/types/src/index.ts',
  },
};
