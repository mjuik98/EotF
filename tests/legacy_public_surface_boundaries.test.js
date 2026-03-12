import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const CORE_FILES = [
  'game/core/init_sequence.js',
  'game/core/global_bridge.js',
  'game/core/game_api.js',
  'game/core/event_binding_registry.js',
  'game/core/bootstrap/register_legacy_surface.js',
  'game/core/bootstrap/build_binding_legacy_surface_step_groups.js',
  'game/core/deps_factory_runtime.js',
  'game/core/event_subscriber_context.js',
];

const LEGACY_IMPORT_EXCEPTIONS = {
  'game/core/game_api.js': ['platform/legacy/game_api_compat.js'],
};

describe('legacy public surface boundaries', () => {
  it('keeps core legacy imports routed through platform/legacy/public.js', () => {
    for (const file of CORE_FILES) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      const legacyImports = Array.from(source.matchAll(/platform\/legacy\/[^'"`]+/g), (match) => match[0]);
      const allowedImports = new Set([
        'platform/legacy/public.js',
        'platform/legacy/window_binding_names.js',
        ...(LEGACY_IMPORT_EXCEPTIONS[file] || []),
      ]);

      for (const legacyImport of legacyImports) {
        expect(allowedImports.has(legacyImport)).toBe(true);
      }
    }
  });
});
