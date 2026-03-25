import { describe, expect, it, vi } from 'vitest';

import {
  createEndPlayerTurnPolicyOptions,
  createStartPlayerTurnAction,
} from '../game/features/combat/application/player_turn_policy_actions.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { Trigger } from '../game/data/triggers.js';

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

  it('consumes balanced_scale and eternal_fragment draw bonuses in the actual start-turn draw count', () => {
    const drawCardsState = vi.fn();
    const gs = {
      currentRegion: 1,
      combat: { turn: 1, playerTurn: false },
      player: {
        energy: 0,
        maxEnergy: 3,
        shield: 0,
        buffs: {},
        deck: [],
        hand: [],
        graveyard: [],
        exhausted: [],
        hp: 20,
        maxHp: 20,
        items: ['balanced_scale', 'eternal_fragment'],
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
      addLog: vi.fn(),
      markDirty: vi.fn(),
    };

    gs.triggerItems(Trigger.COMBAT_START);
    gs.player.energy = 0;
    gs.triggerItems(Trigger.TURN_END);

    const startPlayerTurn = createStartPlayerTurnAction({
      drawCardsState,
      resolveActiveRegionId: () => 1,
    });
    const result = startPlayerTurn(gs);

    expect(result).toEqual({ isStunned: false });
    expect(drawCardsState).toHaveBeenCalledWith(gs, 7, { skipRift: true });
    expect(gs._scaleDrawReset).toBe(true);
  });
});
