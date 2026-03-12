import { describe, expect, it } from 'vitest';

import {
  applyEnemyHealState,
  applyEnemyDamageState,
  applyEnemyStatusUpdatesState,
  replacePlayerBuffsState,
  setCurrentCombatAttackerState,
} from '../game/features/combat/state/enemy_turn_state_commands.js';

describe('enemy_turn_state_commands', () => {
  it('tracks the current attacker index on combat state', () => {
    const state = { combat: { _currentAttackerIdx: null } };

    expect(setCurrentCombatAttackerState(state, 2)).toBe(2);
    expect(state.combat._currentAttackerIdx).toBe(2);
  });

  it('applies enemy hp changes and records dealt damage', () => {
    const state = {
      stats: {
        damageDealt: 5,
      },
    };
    const enemy = { hp: 18 };

    expect(applyEnemyDamageState(state, enemy, 11)).toBe(7);
    expect(enemy.hp).toBe(11);
    expect(state.stats.damageDealt).toBe(12);
  });

  it('replaces player buffs through a single state command', () => {
    const state = {
      player: {
        buffs: {
          dodge: { stacks: 1 },
        },
      },
    };
    const nextBuffs = {
      time_warp_plus: { stacks: 95, energyPerTurn: 2 },
    };

    expect(replacePlayerBuffsState(state, nextBuffs)).toBe(nextBuffs);
    expect(state.player.buffs).toEqual(nextBuffs);
  });

  it('applies enemy healing through a single state command', () => {
    const enemy = {
      hp: 12,
      maxHp: 20,
    };

    expect(applyEnemyHealState(enemy, 5)).toBe(17);
    expect(enemy.hp).toBe(17);
    expect(applyEnemyHealState(enemy, 99)).toBe(20);
    expect(enemy.hp).toBe(20);
  });

  it('applies batched enemy status updates through a single state command', () => {
    const enemy = {
      statusEffects: {
        poisoned: 2,
        poisonDuration: 3,
        burning: 1,
      },
    };

    applyEnemyStatusUpdatesState(enemy, [
      { statusKey: 'poisonDuration', nextValue: 2 },
      { statusKey: 'burning', nextValue: undefined },
      { statusKey: 'immune', nextValue: 1 },
    ]);

    expect(enemy.statusEffects).toEqual({
      poisoned: 2,
      poisonDuration: 2,
      immune: 1,
    });
  });
});
