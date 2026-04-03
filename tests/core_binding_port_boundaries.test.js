import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('core binding port boundaries', () => {
  it('routes feature binding consumption through feature binding capability ports without creating full feature facades', () => {
    const expectations = {
      'game/core/bindings/combat_bindings.js': '../../features/combat/ports/public_binding_capabilities.js',
      'game/core/bindings/ui_bindings.js': '../../features/ui/ports/public_binding_capabilities.js',
      'game/core/bindings/canvas_bindings.js': '../../features/run/ports/public_binding_capabilities.js',
      'game/core/bindings/title_settings_bindings.js': '../../features/title/ports/public_binding_capabilities.js',
    };

    for (const [file, importPath] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).toContain(importPath);
      expect(source).not.toContain('/public.js');
      expect(source).not.toContain('createCombatFeatureFacade');
      expect(source).not.toContain('createUiFeatureFacade');
      expect(source).not.toContain('createRunFeatureFacade');
      expect(source).not.toContain('createTitleFeatureFacade');
    }
  });

  it('builds scoped feature refs through feature-owned port files instead of a core-owned symbol table', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'game/core/bootstrap/build_binding_feature_refs.js'),
      'utf8',
    );

    expect(source).toContain('../../features/ui/ports/public_feature_binding_ref_catalog.js');
    expect(source).not.toContain('/public_binding_ref_capabilities.js');
    expect(source).not.toContain('const FEATURE_REF_KEYS');
  });
});
