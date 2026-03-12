import { describe, expect, it } from 'vitest';

import {
  beginPlayerTurnState,
  advancePlayerPoisonDurationState,
  consumePlayerBuffStackState,
  finalizePlayerTurnEndState,
  reducePlayerTurnEnergyState,
  reducePlayerTurnMaxEchoState,
  reducePlayerTurnSilenceGaugeState,
  resetPlayerTurnTimeRiftState,
} from '../game/features/combat/state/player_turn_state_commands.js';

describe('player_turn_state_commands', () => {
  it('consumes stacked player buffs through feature-local state commands', () => {
    const state = {
      player: {
        buffs: {
          burning: { stacks: 2 },
        },
      },
    };

    expect(consumePlayerBuffStackState(state, 'burning')).toBe(true);
    expect(state.player.buffs.burning.stacks).toBe(1);

    expect(consumePlayerBuffStackState(state, 'burning')).toBe(true);
    expect(state.player.buffs.burning).toBeUndefined();
  });

  it('reduces player turn energy and advances poison duration', () => {
    const state = {
      player: {
        energy: 3,
        buffs: {
          poisoned: {
            stacks: 2,
            poisonDuration: 2,
          },
        },
      },
    };

    expect(reducePlayerTurnEnergyState(state, 1)).toBe(2);
    expect(advancePlayerPoisonDurationState(state)).toBe(1);
    expect(state.player.buffs.poisoned.poisonDuration).toBe(1);

    expect(advancePlayerPoisonDurationState(state)).toBeUndefined();
    expect(state.player.buffs.poisoned).toBeUndefined();
  });

  it('applies grouped player turn lifecycle state updates', () => {
    const state = {
      combat: {
        playerTurn: false,
        turn: 3,
      },
      player: {
        energy: 1,
        maxEnergy: 4,
        shield: 9,
        echo: 90,
        maxEcho: 100,
        silenceGauge: 3,
        timeRiftGauge: 5,
        hand: ['a', 'b'],
        graveyard: ['c'],
        buffs: {},
        costDiscount: 2,
        _nextCardDiscount: 1,
        zeroCost: true,
        _freeCardUses: 2,
        echoChain: 6,
      },
    };

    beginPlayerTurnState(state, { isStunned: false });
    expect(state.combat.turn).toBe(4);
    expect(state.combat.playerTurn).toBe(true);
    expect(state.player.energy).toBe(4);
    expect(state.player.shield).toBe(0);

    expect(reducePlayerTurnMaxEchoState(state, 10)).toBe(90);
    expect(reducePlayerTurnSilenceGaugeState(state, 2)).toBe(1);
    expect(resetPlayerTurnTimeRiftState(state)).toBe(0);

    finalizePlayerTurnEndState(state);
    expect(state.player.hand).toEqual([]);
    expect(state.player.graveyard).toEqual(['c', 'a', 'b']);
    expect(state.player.echoChain).toBe(0);
    expect(state.combat.playerTurn).toBe(false);
    expect(state.player.costDiscount).toBe(0);
    expect(state.player._nextCardDiscount).toBe(0);
    expect(state.player.zeroCost).toBe(false);
    expect(state.player._freeCardUses).toBe(0);
  });
});
