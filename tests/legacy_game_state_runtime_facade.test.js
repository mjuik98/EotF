import { describe, expect, it, vi } from 'vitest';

import { createLegacyGameStateRuntimeFacade } from '../game/platform/legacy/state/legacy_game_state_runtime_facade.js';

describe('legacy_game_state_runtime_facade', () => {
  it('adds combat runtime helpers without exposing card helpers on the canonical game state object', () => {
    const gs = {
      combat: { enemies: [] },
      player: { buffs: {}, echoChain: 0 },
      stats: {},
      markDirty: vi.fn(),
      addLog: vi.fn(),
      triggerItems: vi.fn(),
    };

    const facade = createLegacyGameStateRuntimeFacade(gs);

    expect(facade).not.toBe(gs);
    expect(facade.dealDamage).toBeTypeOf('function');
    expect(facade.drawCards).toBeUndefined();
    expect(gs.dealDamage).toBeUndefined();
  });

  it('forwards writes back to the canonical game state object', () => {
    const gs = {
      currentScreen: 'title',
      dispatch(action, payload) {
        this.lastAction = { action, payload };
        this.currentScreen = payload.screen;
        return this.lastAction;
      },
    };

    const facade = createLegacyGameStateRuntimeFacade(gs);
    const result = facade.dispatch('screen:set', { screen: 'game' });

    expect(result).toEqual({ action: 'screen:set', payload: { screen: 'game' } });
    expect(gs.currentScreen).toBe('game');
    expect(gs.lastAction).toEqual(result);
  });
});
