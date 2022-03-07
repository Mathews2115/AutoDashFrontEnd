module.exports = {
  ignorePatterns: ['dist', 'node_modules'],
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    quotes: ['off', "single"],
    'no-unused-vars': ['warning', { argsIgnorePattern: '^_' }],
  },
  settings: { 'import/resolver': 'webpack' },
};
