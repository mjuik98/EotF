import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('compat re-exports', () => {
  it('removes the remaining systems and combat-domain compat wrappers once callers use canonical owners directly', () => {
    const removedFiles = [
      'game/domain/audio/audio_event_helpers.js',
      'game/domain/audio/helpers/attack_audio_helpers.js',
      'game/domain/audio/helpers/audio_event_core.js',
      'game/domain/audio/helpers/event_audio_helpers.js',
      'game/domain/audio/helpers/reaction_audio_helpers.js',
      'game/domain/audio/helpers/status_audio_helpers.js',
      'game/domain/audio/helpers/ui_audio_helpers.js',
      'game/domain/class/class_mechanic_rules.js',
      'game/domain/class/class_mechanics.js',
      'game/domain/class/class_trait_view_model.js',
      'game/domain/combat/turn/end_player_turn_policy.js',
      'game/domain/combat/turn/enemy_effect_resolver.js',
      'game/domain/combat/turn/infinite_stack_buffs.js',
      'game/domain/combat/turn/start_player_turn_policy.js',
      'game/domain/combat/turn/turn_manager_helpers.js',
      'game/domain/combat/turn/turn_state_mutators.js',
      'game/domain/event/rest/build_rest_options.js',
      'game/domain/event/shop/build_shop_config.js',
      'game/systems/event_manager.js',
      'game/systems/run_rules.js',
      'game/systems/run_rules_curses.js',
      'game/systems/run_rules_difficulty.js',
      'game/systems/run_rules_meta.js',
      'game/systems/run_rules_regions.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
