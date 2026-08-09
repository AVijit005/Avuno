import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

/**
 * Globals available to all backend code. `no-undef` has no type information,
 * so anything not listed here is reported as undefined.
 */
const nodeGlobals = {
  console: 'readonly',
  process: 'readonly',
  Buffer: 'readonly',
  fetch: 'readonly',
  Response: 'readonly',
  Request: 'readonly',
  Headers: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  setImmediate: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly',
  AbortController: 'readonly',
  AbortSignal: 'readonly',
  performance: 'readonly',
  structuredClone: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  module: 'readonly',
  require: 'readonly',
  global: 'readonly',
  globalThis: 'readonly',
  NodeJS: 'readonly',
};

/**
 * Test-runner globals. Previously absent, so every spec file reported
 * describe/it/expect as no-undef — dozens of phantom errors that made the
 * lint gate unusable and buried the real findings.
 */
const testGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  afterAll: 'readonly',
  afterEach: 'readonly',
  mock: 'readonly',
  spyOn: 'readonly',
  jest: 'readonly',
};

const tsLanguageOptions = {
  parser: tsParser,
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
};

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      ...tsLanguageOptions,
      globals: nodeGlobals,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': ['warn', { allow: ['error'] }],
    },
  },
  {
    // Flat config replaces `languageOptions` wholesale rather than merging it,
    // so this block must restate the parser and the base globals; otherwise it
    // falls back to espree and every TS construct becomes a parse error.
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    languageOptions: {
      ...tsLanguageOptions,
      globals: { ...nodeGlobals, ...testGlobals },
    },
    rules: {
      // Mocks and fixtures legitimately need loose typing.
      '@typescript-eslint/no-explicit-any': 'off',
      // Tests print diagnostics.
      'no-console': 'off',
    },
  },
];
