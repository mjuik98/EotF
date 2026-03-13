import { describe, expect, it, vi } from 'vitest';

import { createNodeHandoffRuntime } from '../game/features/run/application/create_node_handoff_runtime.js';

describe('create_node_handoff_runtime', () => {
  it('prefers feature node handoff actions over legacy fallback handlers', () => {
    const deps = {
      nodeHandoff: {
        startCombat: vi.fn(),
        openEvent: vi.fn(),
        openShop: vi.fn(),
        openRestSite: vi.fn(),
        openReward: vi.fn(),
      },
      startCombat: vi.fn(),
      triggerRandomEvent: vi.fn(),
      showShop: vi.fn(),
      showRestSite: vi.fn(),
      showRewardScreen: vi.fn(),
    };

    const runtime = createNodeHandoffRuntime(deps);
    runtime.startCombat('boss');
    runtime.openEvent();
    runtime.openShop();
    runtime.openRestSite();
    runtime.openReward('boss');

    expect(deps.nodeHandoff.startCombat).toHaveBeenCalledWith('boss');
    expect(deps.nodeHandoff.openEvent).toHaveBeenCalledTimes(1);
    expect(deps.nodeHandoff.openShop).toHaveBeenCalledTimes(1);
    expect(deps.nodeHandoff.openRestSite).toHaveBeenCalledTimes(1);
    expect(deps.nodeHandoff.openReward).toHaveBeenCalledWith('boss');
    expect(deps.startCombat).not.toHaveBeenCalled();
    expect(deps.triggerRandomEvent).not.toHaveBeenCalled();
  });

  it('falls back to legacy handlers when no feature handoff exists', () => {
    const deps = {
      openReward: vi.fn(),
      startCombat: vi.fn(),
      triggerRandomEvent: vi.fn(),
      showShop: vi.fn(),
      showRestSite: vi.fn(),
      showRewardScreen: vi.fn(),
    };

    const runtime = createNodeHandoffRuntime(deps);
    runtime.startCombat('mini_boss');
    runtime.openEvent();
    runtime.openShop();
    runtime.openRestSite();
    runtime.openReward(true);

    expect(deps.startCombat).toHaveBeenCalledWith('mini_boss');
    expect(deps.triggerRandomEvent).toHaveBeenCalledTimes(1);
    expect(deps.showShop).toHaveBeenCalledTimes(1);
    expect(deps.showRestSite).toHaveBeenCalledTimes(1);
    expect(deps.openReward).toHaveBeenCalledWith(true);
    expect(deps.showRewardScreen).not.toHaveBeenCalled();
  });
});
