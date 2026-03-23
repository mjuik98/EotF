import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('presentation compat re-exports', () => {
  it('keeps migrated combat presentation files as thin feature re-exports', () => {
    const files = {
    };

    for (const [file, expected] of Object.entries(files)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });

  it('removes combat presentation compat wrappers once tests and consumers use feature-owned modules directly', () => {
    const removedFiles = [
      'game/presentation/combat/combat_enemy_list_presenter.js',
      'game/presentation/combat/combat_enemy_view_model_presenter.js',
      'game/presentation/combat/combat_turn_action_presenter.js',
      'game/presentation/combat/combat_turn_state_presenter.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });

  it('removes reward runtime compat wrappers once callers use the feature-owned reward public surface directly', () => {
    const removedFiles = [
      'game/ui/screens/reward_ui_runtime.js',
      'game/ui/screens/reward_ui_screen_runtime.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
