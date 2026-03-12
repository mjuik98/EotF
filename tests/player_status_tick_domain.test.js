import { describe, expect, it, vi } from 'vitest';

import { processPlayerStatusTicks } from '../game/features/combat/domain/player_status_tick_domain.js';

describe('player_status_tick_domain', () => {
  it('applies slowed/confusion status and returns UI actions', () => {
    const gs = {
      player: {
        hp: 40,
        energy: 3,
        hand: [{ id: 'a' }, { id: 'b' }],
        buffs: {
          slowed: { stacks: 1 },
          confusion: { stacks: 1 },
        },
      },
      combat: {
        active: true,
      },
      addLog: vi.fn(),
      takeDamage: vi.fn(),
    };
    const shuffleArrayFn = vi.fn();

    const result = processPlayerStatusTicks(gs, { shuffleArrayFn });

    expect(result).toEqual({
      alive: true,
      actions: ['renderCombatCards', 'updateStatusDisplay', 'updateUI'],
    });
    expect(gs.player.energy).toBe(2);
    expect(gs.player.buffs.slowed).toBeUndefined();
    expect(gs.player.buffs.confusion).toBeUndefined();
    expect(shuffleArrayFn).toHaveBeenCalledWith(gs.player.hand);
  });

  it('stops turn processing when burning damage defeats the player', () => {
    const gs = {
      player: {
        hp: 1,
        buffs: {
          burning: { stacks: 1 },
        },
      },
      combat: {
        active: true,
      },
      takeDamage: vi.fn(() => {
        gs.player.hp = 0;
        gs.combat.active = false;
      }),
    };

    const result = processPlayerStatusTicks(gs);

    expect(result).toEqual({ alive: false, actions: [] });
    expect(gs.player.buffs.burning).toBeUndefined();
  });
});
