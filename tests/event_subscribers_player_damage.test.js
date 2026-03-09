import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerSubscribers, clearSubscribers } from '../game/core/event_subscribers.js';
import { EventBus } from '../game/core/event_bus.js';
import { Actions } from '../game/core/state_actions.js';
import { GAME } from '../game/core/global_bridge.js';

describe('event subscribers player damage hud deps', () => {
  beforeEach(() => {
    clearSubscribers();
    GAME.API = {};
    GAME.Modules = {};
    GAME._depsBase = null;
  });

  it('routes player damage through the central player stat refresh entry point', () => {
    const updatePlayerStats = vi.fn();
    const gs = {
      player: { hp: 40, maxHp: 50, shield: 5, buffs: { unbreakable_wall: { stacks: 99 } } },
    };

    registerSubscribers({
      HudUpdateUI: { updatePlayerStats },
      doc: { body: null },
      win: { innerWidth: 1280, innerHeight: 720 },
      actions: {},
    });

    EventBus.emit(Actions.PLAYER_DAMAGE, {
      payload: { amount: 3 },
      result: { actualDamage: 3, shieldAbsorbed: 0 },
      gs,
    });

    expect(updatePlayerStats).toHaveBeenCalledTimes(1);
    expect(updatePlayerStats).toHaveBeenCalledWith(gs);
  });
});
