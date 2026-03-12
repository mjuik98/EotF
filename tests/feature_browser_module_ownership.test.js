import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const FEATURE_BROWSER_MODULE_FILES = [
  'game/features/title/platform/browser/title_browser_modules.js',
  'game/features/run/platform/browser/run_browser_modules.js',
  'game/features/combat/platform/browser/combat_browser_modules.js',
];

describe('feature browser module ownership', () => {
  it('keeps browser module catalogs sourcing feature-local presentation facades', () => {
    for (const file of FEATURE_BROWSER_MODULE_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/from ['"].*game\/ui\//);
      expect(source).not.toMatch(/from ['"].*game\/presentation\//);
      expect(source).not.toMatch(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/ui\//);
      expect(source).not.toMatch(/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/presentation\//);
      expect(source).toMatch(/presentation\/browser\//);
    }
  });
});
