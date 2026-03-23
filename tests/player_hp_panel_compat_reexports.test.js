import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('player hp panel compat re-exports', () => {
  it('removes ui/shared player hp panel wrappers once callers use the shared player hp panel public surface directly', () => {
    const removedFiles = [
      'game/ui/shared/player_hp_panel_render_ui.js',
      'game/ui/shared/player_hp_panel_runtime_ui.js',
      'game/ui/shared/player_hp_panel_ui.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
