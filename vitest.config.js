import fs from 'node:fs';
import { configDefaults, defineConfig } from 'vitest/config';
import { listRepositoryTestFiles, partitionTestFiles } from './scripts/test_suite_manifest.mjs';

const suite = process.env.CODEX_VITEST_SUITE || 'full';
const allTestFiles = listRepositoryTestFiles();
const { fast, guardrails } = partitionTestFiles(allTestFiles);
const coverageThresholds = JSON.parse(fs.readFileSync(new URL('./config/quality/coverage_thresholds.json', import.meta.url), 'utf8'));

function getSuiteIncludes() {
  if (suite === 'fast') return fast;
  if (suite === 'guardrails') return guardrails;
  return allTestFiles;
}

export default defineConfig({
  test: {
    include: getSuiteIncludes(),
    exclude: [
      ...configDefaults.exclude,
      '**/.worktrees/**',
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
