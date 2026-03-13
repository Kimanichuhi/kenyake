// eslint.config.ts (or .js — .ts is better for type safety if you have TS in the project)
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores (first item in array)
  { ignores: ['dist/**', '.vite/**', 'node_modules/**'] },

  // Main config for TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,           // or .recommendedTypeChecked for stricter type-aware rules
      // ...tseslint.configs.stylistic,           // optional: nicer formatting rules
    ],
    languageOptions: {
      ecmaVersion: 2022,                          // updated to more modern default
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        project: true,                            // enables type-aware linting if you want stricter rules later
        tsconfigRootDir: import.meta.dirname,     // helps with project resolution (ESLint 9+)
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks recommended (exhaustive-deps etc.)
      ...reactHooks.configs.recommended.rules,

      // Vite + React Refresh: warn instead of error for HMR compatibility
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Common tweaks
      '@typescript-eslint/no-unused-vars': 'off',  // you already have this; or set to 'warn' if preferred
      '@typescript-eslint/no-explicit-any': 'warn', // optional: catch 'any' usage gently
      'no-console': 'warn',                        // optional: discourage console.logs in prod code
    },
  },

  // Optional: separate config for JS files if you have any (e.g. vite.config.js)
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    ...js.configs.recommended,
    rules: {
      // Add JS-specific rules if needed
    },
  }
);
