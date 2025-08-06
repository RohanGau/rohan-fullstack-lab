// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier'
  ),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      tailwindcss: require('eslint-plugin-tailwindcss'),
    },
    rules: {
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/no-custom-classname': 'off',
    },
  },
];
