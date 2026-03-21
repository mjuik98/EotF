import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('compat public entrypoint guardrails', () => {
  it('runs a lint guard that forces compat roots to import feature public entrypoints only', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts.lint).toContain('node scripts/check-compat-public-entrypoints.mjs');
    expect(() => {
      execFileSync(process.execPath, ['scripts/check-compat-public-entrypoints.mjs'], {
        cwd: ROOT,
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
