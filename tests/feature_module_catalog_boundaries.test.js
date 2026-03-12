import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const FILES = [
  'game/features/title/modules/title_module_catalog.js',
  'game/features/run/modules/run_module_catalog.js',
  'game/features/combat/modules/public_combat_modules.js',
];
const PUBLIC_FILES = [
  'game/features/title/public.js',
  'game/features/run/public.js',
  'game/features/combat/public.js',
];

describe('feature module catalog boundaries', () => {
  it('keeps feature module catalogs free of direct ui imports', () => {
    for (const file of FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\//);
    }
  });

  it('keeps feature public surfaces free of raw public module builder exports', () => {
    for (const file of PUBLIC_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/build.*PublicModules/);
    }
  });
});
