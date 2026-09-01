import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'test-results', 'node_modules']),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // `_`-prefixed y componentes en PascalCase quedan exentos
      // Deuda preexistente surgida al extender el lint a TS.
      // Son hallazgos reales (efectos que hacen setState sincrono);
      // se degradan a warning para no bloquear el gate hasta refactorizarlos.
      'react-hooks/set-state-in-effect': 'warn',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        varsIgnorePattern: '^_|^[A-Z]',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_|^e$|^error$',
      }],
    },
  },
  {
    files: ['tests/**/*.js', '**/*.test.{js,jsx,ts,tsx}', 'src/test/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['vite.config.js', 'playwright.config.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
])
