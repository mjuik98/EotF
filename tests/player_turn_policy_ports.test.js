import { describe, expect, it, vi } from 'vitest';

import {
  createEndPlayerTurnPolicyCommands,
  createStartPlayerTurnPolicyCommands,
} from '../game/features/combat/ports/player_turn_policy_ports.js';

describe('player_turn_policy_ports', () => {
  it('builds start-turn policy commands from feature-local state commands', () => {
    const state = {
      combat: { turn: 2, playerTurn: false },
      player: {
        energy: 1,
        maxEnergy: 3,
        shield: 5,
        echo: 100,
        maxEcho: 100,
        exhausted: [],
        hand: ['strike'],
        deck: [],
        graveyard: [],
        buffs: { weaken: { stacks: 2 } },
      },
      markDirty: vi.fn(),
    };

    const commands = createStartPlayerTurnPolicyCommands();
    commands.beginPlayerTurnState(state, { isStunned: false });
    commands.consumePlayerBuffState(state, 'weaken');
    commands.exhaustRandomPlayerCardState(state, [{ key: 'hand', cards: state.player.hand }], 0);
    commands.reducePlayerTurnEnergyState(state, 1);
    commands.reducePlayerTurnMaxEchoState(state, 10);

    expect(state.combat.turn).toBe(3);
    expect(state.combat.playerTurn).toBe(true);
    expect(state.player.energy).toBe(2);
    expect(state.player.shield).toBe(0);
    expect(state.player.buffs.weaken.stacks).toBe(1);
    expect(state.player.exhausted).toEqual(['strike']);
    expect(state.player.hand).toEqual([]);
    expect(state.player.maxEcho).toBe(90);
    expect(state.markDirty).toHaveBeenCalledWith('hand');
  });

  it('allows end-turn policy command overrides while keeping default commands', () => {
    const state = {
      combat: { playerTurn: true },
      player: {
        hand: ['strike'],
        graveyard: [],
        buffs: { burn: { stacks: 1 } },
        echoChain: 2,
        silenceGauge: 3,
        timeRiftGauge: 4,
        costDiscount: 1,
        _nextCardDiscount: 1,
        zeroCost: true,
        _freeCardUses: 1,
      },
    };
    const resetSpy = vi.fn((gs) => {
      gs.player.timeRiftGauge = 99;
      return gs.player.timeRiftGauge;
    });

    const commands = createEndPlayerTurnPolicyCommands({
      resetPlayerTurnTimeRiftState: resetSpy,
    });

    commands.consumePlayerBuffState(state, 'burn');
    commands.reducePlayerTurnSilenceGaugeState(state, 2);
    commands.resetPlayerTurnTimeRiftState(state);
    commands.finalizePlayerTurnEndState(state);

    expect(state.player.buffs.burn).toBeUndefined();
    expect(state.player.silenceGauge).toBe(1);
    expect(state.player.timeRiftGauge).toBe(99);
    expect(resetSpy).toHaveBeenCalledWith(state);
    expect(state.player.hand).toEqual([]);
    expect(state.player.graveyard).toEqual(['strike']);
    expect(state.player.echoChain).toBe(0);
    expect(state.combat.playerTurn).toBe(false);
  });
});
