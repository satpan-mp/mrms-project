// @mrms/config - React ESLint preset (extends base).
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    require.resolve('./base.cjs'),
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  plugins: ['react', 'react-hooks', 'react-refresh', 'jsx-a11y'],
  env: {
    browser: true,
    es2023: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // Accessibility is a hard requirement for MRMS (WCAG 2.1 AA).
    'jsx-a11y/no-autofocus': 'warn',
  },
};
