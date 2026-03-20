import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getEventDeps: vi.fn(() => ({ token: 'event-deps' })),
  getRewardDeps: vi.fn(() => ({ token: 'reward-deps' })),
  getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
  buildFeatureContractAccessors: vi.fn((contractMap, depsFactory) => Object.freeze(
    Object.fromEntries(
      Object.keys(contractMap).map((name) => [
        name,
        (overrides = {}) => ({
          ...(depsFactory?.[name]?.() || {}),
          ...overrides,
        }),
      ]),
    ),
  )),
}));

import * as Deps from '../game/core/deps_factory.js';
import { createEventRewardBindings } from '../game/core/bindings/event_reward_bindings.js';

describe('createEventRewardBindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes event, reward, and run-return actions through feature ports', () => {
    const modules = {
      EventUI: {
        triggerRandomEvent: vi.fn(),
        showEvent: vi.fn(),
        resolveEvent: vi.fn(),
        showShop: vi.fn(),
      },
      RewardUI: {
        showRewardScreen: vi.fn(),
        skipReward: vi.fn(),
      },
      RunReturnUI: {
        returnFromReward: vi.fn(),
        returnToGame: vi.fn(),
      },
    };
    const fns = {};

    createEventRewardBindings(modules, fns);

    fns.triggerRandomEvent();
    fns.showEvent({ id: 'merchant' });
    fns.resolveEvent(2);
    fns.showShop();
    fns.showRewardScreen(true);
    fns.skipReward();
    fns.returnFromReward();
    fns.returnToGame(false);

    expect(modules.EventUI.triggerRandomEvent).toHaveBeenCalledWith({ token: 'event-deps' });
    expect(modules.EventUI.showEvent).toHaveBeenCalledWith({ id: 'merchant' }, { token: 'event-deps' });
    expect(modules.EventUI.resolveEvent).toHaveBeenCalledWith(2, { token: 'event-deps' });
    expect(modules.EventUI.showShop).toHaveBeenCalledWith({ token: 'event-deps' });
    expect(modules.RewardUI.showRewardScreen).toHaveBeenCalledWith(true, { token: 'reward-deps' });
    expect(modules.RewardUI.skipReward).toHaveBeenCalledWith({ token: 'reward-deps' });
    expect(modules.RunReturnUI.returnFromReward).toHaveBeenCalledWith({ token: 'run-return-deps' });
    expect(modules.RunReturnUI.returnToGame).toHaveBeenCalledWith(false, { token: 'run-return-deps' });
    expect(Deps.getEventDeps).toHaveBeenCalledTimes(4);
    expect(Deps.getRewardDeps).toHaveBeenCalledTimes(2);
    expect(Deps.getRunReturnDeps).toHaveBeenCalledTimes(2);
  });
});
