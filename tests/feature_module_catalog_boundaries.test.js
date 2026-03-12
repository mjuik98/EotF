import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const FILES = [
  'game/features/codex/modules/codex_module_catalog.js',
  'game/features/title/modules/title_module_catalog.js',
  'game/features/run/modules/run_module_catalog.js',
  'game/features/combat/modules/public_combat_modules.js',
];
const BROWSER_MODULE_FILES = [
  'game/features/run/platform/browser/run_browser_modules.js',
  'game/features/combat/platform/browser/combat_browser_modules.js',
];
const PUBLIC_FILES = [
  'game/features/codex/public.js',
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

  it('keeps browser module entrypoints free of direct map and hud ui imports', () => {
    for (const file of BROWSER_MODULE_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/ui\/map/);
      expect(source).not.toMatch(/ui\/hud/);
    }
  });

  it('keeps feature public surfaces free of raw public module builder exports', () => {
    for (const file of PUBLIC_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).not.toMatch(/build.*PublicModules/);
    }
  });
});
