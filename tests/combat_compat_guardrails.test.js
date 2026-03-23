import { describe, expect, it } from 'vitest';
import { readText } from './helpers/guardrail_fs.js';

describe('combat compat guardrails', () => {
  it('keeps feature-local combat compat files as thin re-exports to canonical application modules', () => {
    const expectations = {
      'game/features/combat/compat/card_methods.js':
        "export { CardMethods } from '../application/card_methods_facade.js';",
      'game/features/combat/compat/combat_lifecycle.js':
        "export { CombatLifecycle } from '../application/combat_lifecycle_facade.js';",
      'game/features/combat/compat/combat_methods.js':
        "export { CombatMethods } from '../application/combat_methods_facade.js';",
      'game/features/combat/compat/death_handler.js':
        "export { DeathHandler } from '../application/death_handler_facade.js';",
      'game/features/combat/compat/turn_manager.js':
        "export { TurnManager } from '../application/turn_manager_facade.js';",
    };

    for (const [file, expected] of Object.entries(expectations)) {
      expect(readText(file).trim()).toBe(expected);
    }
  });

  it('removes legacy combat root facades once tests import canonical combat ownership directly', () => {
    const removedFiles = [
      'game/combat/card_methods.js',
      'game/combat/class_mechanics.js',
      'game/combat/combat_initializer.js',
      'game/combat/combat_lifecycle.js',
      'game/combat/combat_methods.js',
      'game/combat/damage_system.js',
      'game/combat/damage_system_helpers.js',
      'game/combat/death_handler.js',
      'game/combat/death_handler_enemy_death_flow.js',
      'game/combat/death_handler_enemy_state.js',
      'game/combat/death_handler_outcome.js',
      'game/combat/death_handler_runtime.js',
      'game/combat/difficulty_scaler.js',
      'game/combat/legacy_game_state_card_ports.js',
      'game/combat/turn_manager.js',
      'game/combat/turn_manager_helpers.js',
    ];

    for (const file of removedFiles) {
      expect(() => readText(file)).toThrow();
    }
  });
});
