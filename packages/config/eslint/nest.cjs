// @mrms/config - NestJS ESLint preset (extends base).
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [require.resolve('./base.cjs')],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    // NestJS relies heavily on decorators + DI; relax a few base rules.
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // CRITICAL: the base preset's `consistent-type-imports` (inline fix style)
    // rewrites injected-class imports to `import type { X }`. That erases the
    // runtime class reference that `emitDecoratorMetadata` needs for NestJS
    // constructor dependency injection, so DI fails at runtime with
    // "argument Object at index [0]". Disable it for the backend: injected
    // providers/controllers MUST be imported as values. (See ADR-010.)
    '@typescript-eslint/consistent-type-imports': 'off',
  },
};
