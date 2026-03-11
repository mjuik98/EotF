import { beforeEach, describe, expect, it, vi } from 'vitest';

import { registerSubscribers, clearSubscribers } from '../game/core/event_subscribers.js';
import { EventBus } from '../game/core/event_bus.js';
import { Actions } from '../game/core/state_actions.js';
import { GAME } from '../game/core/global_bridge.js';

describe('event subscribers player silence actions', () => {
  beforeEach(() => {
    clearSubscribers();
    GAME.API = {};
    GAME.Modules = {};
    GAME._depsBase = null;
  });

  it('routes silence updates through injected action and local widget updater', () => {
    const updateUI = vi.fn();
    const updateNoiseWidget = vi.fn();

    registerSubscribers({
      CombatHudUI: { updateNoiseWidget },
      doc: { body: null },
      win: {},
      actions: { updateUI },
    });

    EventBus.emit(Actions.PLAYER_SILENCE, {
      payload: { amount: 1 },
      result: { silenceAfter: 1 },
      gs: { player: { silence: 1 } },
    });

    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(updateNoiseWidget).toHaveBeenCalledTimes(1);
  });
});
