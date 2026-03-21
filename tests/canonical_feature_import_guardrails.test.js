import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('canonical feature import guardrails', () => {
  it('runs a lint guard that blocks non-compat code from importing compat roots', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts.lint).toContain('node scripts/check-canonical-feature-imports.mjs');
    expect(() => {
      execFileSync(process.execPath, ['scripts/check-canonical-feature-imports.mjs'], {
        cwd: ROOT,
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
