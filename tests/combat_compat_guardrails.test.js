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

  it('keeps legacy combat facade files as thin feature re-exports once ownership moves', () => {
    const expectations = {
      'game/combat/card_methods.js':
        "export { CardMethods } from '../features/combat/public.js';",
      'game/combat/combat_lifecycle.js':
        "export { CombatLifecycle } from '../features/combat/public.js';",
      'game/combat/combat_initializer.js':
        "export { CombatInitializer } from '../features/combat/public.js';",
      'game/combat/combat_methods.js':
        "export { CombatMethods } from '../features/combat/public.js';",
      'game/combat/damage_system.js':
        "export { DamageSystem } from '../features/combat/public.js';",
      'game/combat/death_handler.js':
        "export { DeathHandler } from '../features/combat/public.js';",
      'game/combat/difficulty_scaler.js':
        "export { DifficultyScaler } from '../features/combat/public.js';",
      'game/combat/turn_manager.js':
        "export { TurnManager } from '../features/combat/public.js';",
    };

    for (const [file, expected] of Object.entries(expectations)) {
      expect(readText(file).trim()).toBe(expected);
    }
  });

  it('keeps legacy damage helpers as a thin feature re-export', () => {
    expect(readText('game/combat/damage_system_helpers.js').trim()).toBe([
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
      "} from '../features/combat/public.js';",
    ].join('\n'));
  });

  it('keeps legacy death helper facades as thin feature re-exports', () => {
    const expectations = {
      'game/combat/death_handler_runtime.js':
        "export * from '../features/combat/public.js';",
      'game/combat/death_handler_enemy_state.js':
        "export { applyEnemyDeathState } from '../features/combat/public.js';",
      'game/combat/death_handler_enemy_death_flow.js':
        "export { handleEnemyDeathFlow } from '../features/combat/public.js';",
      'game/combat/death_handler_outcome.js':
        "export * from '../features/combat/public.js';",
    };

    for (const [file, expected] of Object.entries(expectations)) {
      expect(readText(file).trim()).toBe(expected);
    }
  });
});
