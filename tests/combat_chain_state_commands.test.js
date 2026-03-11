import { describe, expect, it, vi } from 'vitest';

import {
  applyPassiveResonanceBurstState,
  syncCombatMaxChainState,
} from '../game/features/combat/state/combat_chain_state_commands.js';

describe('combat_chain_state_commands', () => {
  it('syncs max chain from current player chain', () => {
    const state = {
      player: { echoChain: 6 },
      stats: { maxChain: 3 },
    };

    const chain = syncCombatMaxChainState(state);

    expect(chain).toBe(6);
    expect(state.stats.maxChain).toBe(6);
  });

  it('applies passive resonance burst damage and reports kills', () => {
    const onEnemyDeath = vi.fn();
    const state = {
      combat: {
        enemies: [
          { id: 'e1', hp: 3 },
          { id: 'e2', hp: 8 },
        ],
      },
      stats: {
        damageDealt: 1,
      },
    };

    const hits = applyPassiveResonanceBurstState(state, 5, { onEnemyDeath });

    expect(hits).toEqual([
      { index: 0, dealt: 3, killed: true },
      { index: 1, dealt: 5, killed: false },
    ]);
    expect(state.combat.enemies[0].hp).toBe(0);
    expect(state.combat.enemies[1].hp).toBe(3);
    expect(state.stats.damageDealt).toBe(9);
    expect(onEnemyDeath).toHaveBeenCalledWith(state.combat.enemies[0], 0);
  });
});
