import { describe, expect, it, vi } from 'vitest';

import {
  decayEnemyWeaken,
  getEnemyAction,
  handleBossPhaseShift,
  processEnemyStun,
} from '../game/features/combat/domain/enemy_turn_domain.js';

describe('enemy_turn_domain', () => {
  it('consumes stunned and weakened stacks together when an enemy is stunned', () => {
    const enemy = {
      statusEffects: {
        stunned: 1,
        weakened: 1,
      },
    };

    expect(processEnemyStun(enemy)).toBe(true);
    expect(enemy.statusEffects.stunned).toBeUndefined();
    expect(enemy.statusEffects.weakened).toBeUndefined();
  });

  it('falls back to a strike action when enemy ai throws', () => {
    const enemy = {
      atk: 14,
      ai: () => {
        throw new Error('boom');
      },
    };

    expect(getEnemyAction(enemy, 3)).toEqual({
      type: 'strike',
      intent: '공격 14',
      dmg: 14,
    });
  });

  it('purges non-infinite player buffs on second boss phase and boosts attack on third phase', () => {
    const gs = {
      player: {
        buffs: {
          dodge: { stacks: 2 },
          time_warp_plus: { stacks: 95, energyPerTurn: 2 },
        },
      },
      addLog: vi.fn(),
    };
    const enemy = {
      name: 'Boss',
      atk: 10,
      phase: 1,
      statusEffects: {},
    };

    expect(handleBossPhaseShift(gs, enemy)).toEqual({ phase: 2, buffsPurged: true });
    expect(Object.keys(gs.player.buffs)).toEqual(['time_warp_plus']);
    expect(enemy.statusEffects.immune).toBe(1);

    expect(handleBossPhaseShift(gs, enemy)).toEqual({ phase: 3, buffsPurged: false });
    expect(enemy.atk).toBe(13);
  });

  it('decays enemy weakened stacks once per turn', () => {
    const enemy = {
      statusEffects: {
        weakened: 2,
      },
    };

    decayEnemyWeaken(enemy);
    expect(enemy.statusEffects.weakened).toBe(1);

    decayEnemyWeaken(enemy);
    expect(enemy.statusEffects.weakened).toBeUndefined();
  });
});
