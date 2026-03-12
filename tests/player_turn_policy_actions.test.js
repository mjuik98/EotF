import { describe, expect, it } from 'vitest';

import {
  createEndPlayerTurnPolicyOptions,
  createStartPlayerTurnAction,
} from '../game/features/combat/application/player_turn_policy_actions.js';

describe('player_turn_policy_actions', () => {
  it('creates a start-turn action that runs the feature-local command bundle', () => {
    const gs = {
      combat: { turn: 1, playerTurn: false },
      player: {
        energy: 0,
        maxEnergy: 3,
        shield: 7,
        buffs: {},
        deck: [],
        hand: [],
        graveyard: [],
        exhausted: [],
      },
      drawCards: () => {},
      triggerItems: () => {},
      addLog: () => {},
    };

    const startPlayerTurn = createStartPlayerTurnAction();
    const result = startPlayerTurn(gs);

    expect(result).toEqual({ isStunned: false });
    expect(gs.combat.turn).toBe(2);
    expect(gs.combat.playerTurn).toBe(true);
    expect(gs.player.energy).toBe(3);
    expect(gs.player.shield).toBe(0);
  });

  it('creates end-turn policy options from feature-local state commands', () => {
    const gs = {
      combat: { playerTurn: true },
      player: {
        hand: ['strike'],
        graveyard: [],
        buffs: { burn: { stacks: 1 } },
        echoChain: 2,
        silenceGauge: 2,
        timeRiftGauge: 4,
        costDiscount: 1,
        _nextCardDiscount: 1,
        zeroCost: true,
        _freeCardUses: 1,
      },
    };
    const options = createEndPlayerTurnPolicyOptions();

    options.consumePlayerBuffState(gs, 'burn');
    options.reducePlayerTurnSilenceGaugeState(gs, 1);
    options.resetPlayerTurnTimeRiftState(gs);
    options.finalizePlayerTurnEndState(gs);

    expect(gs.player.buffs.burn).toBeUndefined();
    expect(gs.player.silenceGauge).toBe(1);
    expect(gs.player.timeRiftGauge).toBe(0);
    expect(gs.player.hand).toEqual([]);
    expect(gs.player.graveyard).toEqual(['strike']);
    expect(gs.combat.playerTurn).toBe(false);
  });
});
