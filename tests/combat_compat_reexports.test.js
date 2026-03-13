import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat compat re-exports', () => {
  it('keeps legacy combat facade files as thin feature re-exports once ownership moves', () => {
    const expectations = {
      'game/combat/card_methods.js':
        "export { CardMethods } from '../features/combat/application/card_methods_compat.js';",
      'game/combat/combat_lifecycle.js':
        "export { CombatLifecycle } from '../features/combat/application/combat_lifecycle_compat.js';",
      'game/combat/combat_methods.js':
        "export { CombatMethods } from '../features/combat/application/combat_methods_compat.js';",
      'game/combat/damage_system.js':
        "export { DamageSystem } from '../features/combat/application/damage_system_compat.js';",
      'game/combat/death_handler.js':
        "export { DeathHandler } from '../features/combat/application/death_handler_compat.js';",
      'game/combat/turn_manager.js':
        "export { TurnManager } from '../features/combat/application/turn_manager_compat.js';",
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
      "} from '../features/combat/application/damage_system_runtime_helpers.js';",
    ].join('\n'));
  });
});
