import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat compat re-exports', () => {
  it('keeps legacy combat facade files as thin feature re-exports once ownership moves', () => {
    const expectations = {
      'game/combat/card_methods.js':
        "export { CardMethods } from '../features/combat/compat/card_methods.js';",
      'game/combat/combat_lifecycle.js':
        "export { CombatLifecycle } from '../features/combat/compat/combat_lifecycle.js';",
      'game/combat/combat_initializer.js':
        "export { CombatInitializer } from '../features/combat/ports/public_application_capabilities.js';",
      'game/combat/combat_methods.js':
        "export { CombatMethods } from '../features/combat/compat/combat_methods.js';",
      'game/combat/damage_system.js':
        "export { DamageSystem } from '../features/combat/compat/damage_system.js';",
      'game/combat/death_handler.js':
        "export { DeathHandler } from '../features/combat/compat/death_handler.js';",
      'game/combat/difficulty_scaler.js':
        "export { DifficultyScaler } from '../features/combat/ports/public_system_capabilities.js';",
      'game/combat/turn_manager.js':
        "export { TurnManager } from '../features/combat/compat/turn_manager.js';",
    };

    for (const [file, expected] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });

  it('keeps legacy damage helpers as a thin feature re-export', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/combat/damage_system_helpers.js'),
      'utf8',
    ).trim();

    expect(source).toBe([
      'export {',
      '  adjustEnemyStatusDuration,',
      '  advancePlayerChain,',
      '  applyLifesteal,',
      '  calculateBaseResolvedDamageValue,',
      '  calculatePotentialDamageValue,',
      '  calculateResolvedDamageValue,',
      '  createDamageRuntime,',
      '  finalizeResolvedDamageValue,',
      '  getDocFromDeps,',
      '  getWinFromDeps,',
      '  handleEnemyDamagePrevention,',
      '  resolveEnemyDamageResult,',
      '  resolveEnemyStatusTargetIndex,',
      '  resolveIncomingPlayerDamage,',
      '  resolveShieldGainAmount,',
      '  resolveEnemyTargetIndex,',
      '  runDealDamageClassHook,',
      "} from '../features/combat/ports/public_damage_runtime_capabilities.js';",
    ].join('\n'));
  });

  it('keeps legacy death helper facades as thin feature re-exports', () => {
    const expectations = {
      'game/combat/death_handler_runtime.js':
        "export * from '../features/combat/ports/public_death_runtime_capabilities.js';",
      'game/combat/death_handler_enemy_state.js':
        "export { applyEnemyDeathState } from '../features/combat/ports/public_death_application_capabilities.js';",
      'game/combat/death_handler_enemy_death_flow.js':
        "export { handleEnemyDeathFlow } from '../features/combat/ports/public_death_application_capabilities.js';",
      'game/combat/death_handler_outcome.js':
        "export * from '../features/combat/ports/public_death_runtime_capabilities.js';",
    };

    for (const [file, expected] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });
});
