// Root ESLint configuration (baseline).
// Per-app configs in apps/* and packages/* extend this baseline and add
// framework-specific rules (NestJS, React) during Sprint 1 implementation.
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2023: true,
  },
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'out/', 'coverage/', '**/*.d.ts'],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
