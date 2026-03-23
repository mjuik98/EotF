import fs from 'node:fs';
import { configDefaults, defineConfig } from 'vitest/config';
import { listRepositoryTestFiles, partitionTestFiles } from './scripts/test_suite_manifest.mjs';

const suite = process.env.CODEX_VITEST_SUITE || 'full';
const allTestFiles = listRepositoryTestFiles();
const { fast, guardrails } = partitionTestFiles(allTestFiles);
const coverageThresholds = JSON.parse(fs.readFileSync(new URL('./config/quality/coverage_thresholds.json', import.meta.url), 'utf8'));

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
        ...coverageThresholds,
      },
    },
  },
});
