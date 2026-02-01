import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      // Add Node.js globals (process, console, setTimeout, etc.)
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      
      // Use TypeScript version of no-unused-vars instead of base rule
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      
      // Allow any for now (can be stricter later)
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // Allow empty catch blocks (common pattern)
      'no-empty': ['error', { allowEmptyCatch: true }],
      
      // Allow useless escapes (regex patterns)
      'no-useless-escape': 'warn',
    },
  },
  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.d.ts',
      'src/script/**', // Ignore migration scripts
    ],
  },
  prettierConfig,
];
