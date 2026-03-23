import { configDefaults, defineConfig } from 'vitest/config';
import { listRepositoryTestFiles, partitionTestFiles } from './scripts/test_suite_manifest.mjs';

const suite = process.env.CODEX_VITEST_SUITE || 'full';
const allTestFiles = listRepositoryTestFiles();
const { fast, guardrails } = partitionTestFiles(allTestFiles);

function getSuiteExcludes() {
  if (suite === 'fast') return guardrails;
  if (suite === 'guardrails') return fast;
  return [];
}

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      '**/.worktrees/**',
      ...getSuiteExcludes(),
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      include: ['game/**/*.js', 'engine/**/*.js', 'data/**/*.js'],
      exclude: [
        'tests/**',
        'game/core/main.js',
      ],
      thresholds: {
        lines: 70,
        functions: 55,
        statements: 70,
        branches: 60,
      },
    },
  },
});
