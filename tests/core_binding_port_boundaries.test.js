import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('core binding port boundaries', () => {
  it('routes feature binding consumption through feature public surfaces without creating full feature facades', () => {
    const expectations = {
      'game/core/bindings/combat_bindings.js': '../../features/combat/public.js',
      'game/core/bindings/ui_bindings.js': '../../features/ui/public.js',
      'game/core/bindings/canvas_bindings.js': '../../features/run/public.js',
      'game/core/bindings/title_settings_bindings.js': '../../features/title/public.js',
    };

    for (const [file, importPath] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).toContain(importPath);
      expect(source).not.toContain('createCombatFeatureFacade');
      expect(source).not.toContain('createUiFeatureFacade');
      expect(source).not.toContain('createRunFeatureFacade');
      expect(source).not.toContain('createTitleFeatureFacade');
    }
  });
});
