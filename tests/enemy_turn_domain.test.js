import { describe, expect, it, vi } from 'vitest';

import {
  decayEnemyWeaken,
  getEnemyAction,
  handleBossPhaseShift,
  processEnemyStatusTicks,
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

  it('applies planned status ticks through state commands and updates countdown statuses', () => {
    const enemy = {
      name: 'Shade',
      hp: 40,
      maxHp: 40,
      statusEffects: {
        poisoned: 2,
        poisonDuration: 2,
        burning: 1,
        abyss_regen: 3,
        marked: 2,
        immune: 1,
        doom: 2,
      },
    };
    const gs = {
      combat: {
        enemies: [enemy],
      },
      stats: {
        damageDealt: 0,
      },
      addLog: vi.fn(),
      triggerItems: vi.fn().mockReturnValue({ amount: 12 }),
      takeDamage: vi.fn(),
      onEnemyDeath: vi.fn(),
    };

    const events = processEnemyStatusTicks(gs);

    expect(events).toEqual([
      { index: 0, type: 'poison', dmg: 12, enemyDied: false, color: '#44ff88' },
      { index: 0, type: 'burning', dmg: 5, enemyDied: false, color: '#ff8844' },
    ]);
    expect(enemy.hp).toBe(26);
    expect(enemy.statusEffects).toEqual({
      poisoned: 2,
      poisonDuration: 1,
      abyss_regen: 3,
      marked: 1,
      doom: 1,
    });
    expect(gs.stats.damageDealt).toBe(17);
    expect(gs.takeDamage).not.toHaveBeenCalled();
    expect(gs.onEnemyDeath).not.toHaveBeenCalled();
    expect(gs.addLog).toHaveBeenCalledWith('☠️ Shade: 파멸 카운트다운 1', 'system');
  });

  it('stops after lethal poison without mutating later status counters', () => {
    const enemy = {
      name: 'Dummy',
      hp: 10,
      maxHp: 20,
      statusEffects: {
        poisoned: 2,
        poisonDuration: 3,
        burning: 1,
      },
    };
    const gs = {
      combat: {
        enemies: [enemy],
      },
      stats: {
        damageDealt: 0,
      },
      addLog: vi.fn(),
      onEnemyDeath: vi.fn(),
    };

    const events = processEnemyStatusTicks(gs);

    expect(events).toEqual([
      { index: 0, type: 'poison', dmg: 10, enemyDied: true, color: '#44ff88' },
    ]);
    expect(enemy.hp).toBe(0);
    expect(enemy.statusEffects).toEqual({
      poisoned: 2,
      poisonDuration: 3,
      burning: 1,
    });
    expect(gs.stats.damageDealt).toBe(10);
    expect(gs.onEnemyDeath).toHaveBeenCalledWith(enemy, 0);
  });
});
