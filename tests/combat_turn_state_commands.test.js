import { describe, expect, it, vi } from 'vitest';

import {
  addEnemyAttackState,
  addEnemyShieldState,
  addEnemyStatusStacksState,
  addPlayerBuffStacksState,
  advanceCombatTurnState,
  clampPlayerMaxEchoState,
  damageEnemyState,
  healEnemyState,
  moveHandToGraveyardState,
  pushCardToExhaustedState,
  resetTurnCardCostState,
  setCombatPlayerTurnState,
  setPlayerEchoChainState,
} from '../game/features/combat/state/commands/combat_turn_state_commands.js';

describe('combat_turn_state_commands', () => {
  it('applies grouped player/combat turn state updates through feature-owned commands', () => {
    const state = {
      combat: { turn: 2, playerTurn: false },
      player: {
        echo: 40,
        echoChain: 3,
        exhausted: [],
        graveyard: ['c'],
        hand: ['a', 'b'],
        maxEcho: 100,
        costDiscount: 2,
        _nextCardDiscount: 1,
        zeroCost: true,
        _freeCardUses: 1,
      },
    };

    expect(advanceCombatTurnState(state)).toBe(3);
    expect(setCombatPlayerTurnState(state, true)).toBe(true);
    expect(setPlayerEchoChainState(state, 0)).toBe(0);
    expect(clampPlayerMaxEchoState(state, 70)).toBe(70);

    moveHandToGraveyardState(state);
    pushCardToExhaustedState(state, 'burn');
    resetTurnCardCostState(state);

    expect(state.player.hand).toEqual([]);
    expect(state.player.graveyard).toEqual(['c', 'a', 'b']);
    expect(state.player.exhausted).toEqual(['burn']);
    expect(state.player.maxEcho).toBe(70);
    expect(state.player.echo).toBe(40);
    expect(state.player.costDiscount).toBe(0);
    expect(state.player._nextCardDiscount).toBe(0);
    expect(state.player.zeroCost).toBe(false);
    expect(state.player._freeCardUses).toBe(0);
  });

  it('applies grouped player/enemy combat mutations through feature-owned commands', () => {
    const state = {
      markDirty: vi.fn(),
      player: {
        buffs: {},
        echo: 15,
        maxEcho: 50,
      },
    };
    const enemy = {
      atk: 7,
      hp: 18,
      maxHp: 20,
      shield: 2,
      statusEffects: {},
    };

    expect(addPlayerBuffStacksState(state, 'weakened', 2, { duration: 1 })).toEqual({ stacks: 2, duration: 1 });
    expect(addEnemyShieldState(enemy, 5)).toBe(7);
    expect(addEnemyAttackState(enemy, 3)).toBe(10);
    expect(addEnemyStatusStacksState(enemy, 'thorns', 2)).toBe(2);
    expect(healEnemyState(enemy, 10)).toBe(20);
    expect(damageEnemyState(enemy, 6)).toBe(14);
  });
});
