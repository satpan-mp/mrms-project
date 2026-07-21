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
  },
};
