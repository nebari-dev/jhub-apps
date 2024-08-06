import pluginJs from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@stylistic/ts': stylisticTs,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    rules: {
      // Base Warnings
      'no-console': 'warn',

      // Stylistic Issues
      '@stylistic/ts/quotes': ['error', 'single'],
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/ts/semi': ['error', 'always'],
      '@stylistic/ts/comma-dangle': ['error', 'always-multiline'],

      // TypeScript
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
    },
    ignores: ['*.test.tsx'],
  },
];
