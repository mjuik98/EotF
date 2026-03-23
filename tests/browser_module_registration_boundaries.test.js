import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('browser module registration boundaries', () => {
  it('keeps feature browser module publication off the legacy registry import path', () => {
    const expectations = {
      'game/features/ui/platform/browser/ensure_settings_browser_modules.js': 'function createFeatureModuleBagEnsurer',
      'game/features/codex/platform/browser/ensure_codex_browser_modules.js': 'function createFeatureModuleBagEnsurer',
      'game/features/run/platform/browser/ensure_run_flow_browser_modules.js': 'function createFeatureModuleBagEnsurer',
      'game/core/bootstrap/init_story_system_bridge.js': '../../platform/legacy/game_module_registry.js',
    };

    for (const [file, importPath] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).toContain(importPath);
      expect(source).not.toContain('modules.GAME.register(');
      if (file.startsWith('game/features/')) {
        expect(source).not.toContain('platform/legacy/game_module_registry.js');
      }
    }
  });
});
