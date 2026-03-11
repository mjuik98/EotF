import { describe, expect, it, vi } from 'vitest';
import { Actions, Reducers } from '../game/core/state_actions.js';
import {
  addPlayerBuffStacks,
  reducePlayerSilenceGauge,
  resetPlayerTimeRiftGauge,
  setPlayerEcho,
  setPlayerShield,
} from '../game/domain/combat/turn/turn_state_mutators.js';

function createDispatchingState() {
  return {
    player: {
      shield: 2,
      echo: 15,
      maxEcho: 100,
      silenceGauge: 4,
      timeRiftGauge: 6,
      buffs: {},
    },
    markDirty: vi.fn(),
    dispatch(action, payload) {
      return Reducers[action](this, payload);
    },
  };
}

describe('turn_state_mutators reducer bridge', () => {
  it('uses reducer-backed updates for shield and echo when dispatch exists', () => {
    const gs = createDispatchingState();

    expect(setPlayerShield(gs, 7)).toBe(7);
    expect(setPlayerEcho(gs, 30)).toBe(30);

    expect(gs.player.shield).toBe(7);
    expect(gs.player.echo).toBe(30);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('uses reducer-backed updates for silence and time-rift gauge resets', () => {
    const gs = createDispatchingState();

    expect(reducePlayerSilenceGauge(gs, 10)).toBe(0);
    expect(resetPlayerTimeRiftGauge(gs)).toBe(0);

    expect(gs.player.silenceGauge).toBe(0);
    expect(gs.player.timeRiftGauge).toBe(0);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });

  it('routes buff stacking through player buff reducer when dispatch exists', () => {
    const gs = createDispatchingState();
    const dispatchSpy = vi.spyOn(gs, 'dispatch');

    addPlayerBuffStacks(gs, 'weakened', 2, { duration: 1 });
    addPlayerBuffStacks(gs, 'weakened', 1, { duration: 1 });

    expect(dispatchSpy).toHaveBeenCalledWith(Actions.PLAYER_BUFF, {
      id: 'weakened',
      stacks: 2,
      data: { duration: 1 },
    });
    expect(gs.player.buffs.weakened).toEqual({ stacks: 3, duration: 2 });
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
  });
});
