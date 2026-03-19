import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const ALLOWLIST = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'docs/metrics/feature_public_export_allowlist.json'), 'utf8'),
);

function extractNamedExports(source) {
  const names = new Set();

  for (const match of source.matchAll(/export\s+function\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);
  for (const match of source.matchAll(/export\s+const\s+([A-Za-z0-9_]+)/g)) names.add(match[1]);

  for (const match of source.matchAll(/export\s*\{([^}]+)\}/gs)) {
    const entries = match[1]
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => entry.split(/\s+as\s+/i)[1] || entry.split(/\s+as\s+/i)[0]);

    entries.forEach((name) => names.add(name.trim()));
  }

  return [...names].sort();
}

describe('feature public export allowlist', () => {
  it('prevents canonical feature public surfaces from growing new named exports without an explicit baseline update', () => {
    for (const [file, expectedNames] of Object.entries(ALLOWLIST)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(extractNamedExports(source)).toEqual(expectedNames);
    }
  });
});
