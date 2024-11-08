import pluginJs from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  // Flat Configs
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  reactPlugin.configs.flat.recommended,
  // Default Configs
  {
    files: ['**/*.{ts,tsx}'],
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
      'react-hooks': hooksPlugin,
    },
    rules: {
      // Base Warnings
      'no-console': 'warn',

      // Formatting
      'prettier/prettier': [
        'error',
        {
          semi: true,
          tabWidth: 2,
          singleQuote: true,
          trailingComma: 'all',
          bracketSpacing: true,
          useTabs: false,
        },
      ],

      // React
      ...hooksPlugin.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
];
