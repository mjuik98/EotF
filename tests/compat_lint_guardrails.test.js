import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';
import { readJson } from './helpers/guardrail_fs.js';

describe('compat lint guardrails', () => {
  it('runs a lint guard that forces compat roots to import feature public entrypoints only', () => {
    const packageJson = readJson('package.json');

    expect(packageJson.scripts.lint).toContain('node scripts/check-compat-public-entrypoints.mjs');
    expect(() => {
      execFileSync(process.execPath, ['scripts/check-compat-public-entrypoints.mjs'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      });
    }).not.toThrow();
  });

  it('runs a lint guard that blocks non-compat code from importing compat roots', () => {
    const packageJson = readJson('package.json');

    expect(packageJson.scripts.lint).toContain('node scripts/check-canonical-feature-imports.mjs');
    expect(() => {
      execFileSync(process.execPath, ['scripts/check-canonical-feature-imports.mjs'], {
        cwd: process.cwd(),
        stdio: 'pipe',
      });
    }).not.toThrow();
  }, 20000);
});
