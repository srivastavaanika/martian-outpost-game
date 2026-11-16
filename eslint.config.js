import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // The engine must stay framework-free so it can be unit-tested and simulated headlessly.
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'framer-motion', 'zustand', 'phaser', '../ui/*', '../store'],
              message: 'src/engine must stay pure TypeScript (no UI / state-library / Phaser imports).',
            },
          ],
        },
      ],
    },
  },
  {
    // The scene renders state it is given; rules stay in the engine and state changes go through the store.
    // Cue tests may play the engine to get real reports to compare against.
    files: ['src/scene/**/*.ts'],
    ignores: ['src/scene/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '../engine',
              importNames: ['applyChoice', 'createGame'],
              message: 'The scene never changes game state; the store calls the engine.',
            },
          ],
          patterns: [
            {
              group: ['react', 'react-*', 'framer-motion', 'zustand', '../ui', '../ui/*', '../store', '../engine/engine'],
              message: 'src/scene must not import React, the UI, the store, or engine internals (use ../engine).',
            },
          ],
        },
      ],
    },
  },
);
