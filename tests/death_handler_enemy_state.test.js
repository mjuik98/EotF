import { describe, expect, it, vi } from 'vitest';

import { applyEnemyDeathState } from '../game/features/combat/public.js';

describe('death_handler_enemy_state', () => {
  it('records rewards, kill stats, and combat-end scheduling on lethal last hit', () => {
    const gs = {
      _endCombatScheduled: false,
      combat: {
        bossDefeated: false,
        enemies: [{ hp: 0 }],
        miniBossDefeated: false,
      },
      meta: {
        codex: {},
        totalKills: 4,
      },
      player: {
        kills: 7,
      },
    };
    const deps = {
      addGold: vi.fn(),
      addLog: vi.fn(),
      emitEnemyDeath: vi.fn(),
      isCombatEndScheduled: vi.fn(() => false),
      playEnemyDeath: vi.fn(),
      recordEnemyWorldKill: vi.fn(),
      registerEnemyKill: vi.fn(),
      scheduleCombatEnd: vi.fn(() => {
        gs._endCombatScheduled = true;
      }),
      triggerItems: vi.fn(),
    };

    const result = applyEnemyDeathState(gs, {
      gold: 18,
      id: 'boss_alpha',
      isBoss: true,
      isMiniBoss: false,
      name: 'Boss Alpha',
    }, 0, deps);

    expect(gs.player.kills).toBe(8);
    expect(gs.meta.totalKills).toBe(5);
    expect(gs.combat.bossDefeated).toBe(true);
    expect(result.shouldEndCombat).toBe(true);
    expect(result.goldGained).toBe(18);
    expect(deps.emitEnemyDeath).toHaveBeenCalledWith({
      enemy: { id: 'boss_alpha', name: 'Boss Alpha' },
      idx: 0,
    });
    expect(deps.addGold).toHaveBeenCalledWith(18);
    expect(deps.triggerItems).toHaveBeenCalledWith('enemy_kill', expect.objectContaining({
      gold: 18,
      idx: 0,
    }));
    expect(deps.registerEnemyKill).toHaveBeenCalledWith('boss_alpha');
    expect(deps.recordEnemyWorldKill).toHaveBeenCalledWith('boss_alpha');
    expect(deps.scheduleCombatEnd).toHaveBeenCalledTimes(1);
  });
});
