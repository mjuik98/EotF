import { describe, expect, it, vi } from 'vitest';

import { createRewardActions } from '../game/features/event/app/reward_actions.js';

describe('reward_actions', () => {
  it('routes reward and return actions through reward ports when no reward flow contract is available', () => {
    const modules = {
      RewardUI: {
        showRewardScreen: vi.fn(),
        takeRewardCard: vi.fn(),
        takeRewardItem: vi.fn(),
        takeRewardUpgrade: vi.fn(),
        takeRewardRemove: vi.fn(),
        showSkipConfirm: vi.fn(),
        hideSkipConfirm: vi.fn(),
        skipReward: vi.fn(),
      },
      RunReturnUI: {
        returnFromReward: vi.fn(),
        returnToGame: vi.fn(),
      },
    };
    const ports = {
      getRewardDeps: vi.fn(() => ({ token: 'reward-deps' })),
      getRewardFlowDeps: vi.fn(() => undefined),
      getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
    };
    const actions = createRewardActions(modules, ports);

    actions.showRewardScreen(true);
    actions.openReward('boss');
    actions.takeRewardCard('strike');
    actions.takeRewardItem('relic');
    actions.takeRewardUpgrade();
    actions.takeRewardRemove();
    actions.showSkipConfirm();
    actions.hideSkipConfirm();
    actions.skipReward();
    actions.returnFromReward();
    actions.returnToGame(false);

    expect(modules.RewardUI.showRewardScreen).toHaveBeenCalledWith(true, { token: 'reward-deps' });
    expect(modules.RewardUI.showRewardScreen).toHaveBeenCalledWith('boss', { token: 'reward-deps' });
    expect(modules.RewardUI.takeRewardCard).toHaveBeenCalledWith('strike', { token: 'reward-deps' });
    expect(modules.RewardUI.takeRewardItem).toHaveBeenCalledWith('relic', { token: 'reward-deps' });
    expect(modules.RewardUI.takeRewardUpgrade).toHaveBeenCalledWith({ token: 'reward-deps' });
    expect(modules.RewardUI.takeRewardRemove).toHaveBeenCalledWith({ token: 'reward-deps' });
    expect(modules.RewardUI.showSkipConfirm).toHaveBeenCalledWith({ token: 'reward-deps' });
    expect(modules.RewardUI.hideSkipConfirm).toHaveBeenCalledWith({ token: 'reward-deps' });
    expect(modules.RewardUI.skipReward).toHaveBeenCalledWith({ token: 'reward-deps' });
    expect(modules.RunReturnUI.returnFromReward).toHaveBeenCalledWith({ token: 'run-return-deps' });
    expect(modules.RunReturnUI.returnToGame).toHaveBeenCalledWith(false, { token: 'run-return-deps' });
    expect(ports.getRewardDeps).toHaveBeenCalledTimes(9);
    expect(ports.getRewardFlowDeps).toHaveBeenCalledTimes(2);
    expect(ports.getRunReturnDeps).toHaveBeenCalledTimes(1);
  });

  it('prefers reward flow contracts for reward screen transitions', () => {
    const modules = {
      RewardUI: {
        showRewardScreen: vi.fn(),
      },
    };
    const rewardFlow = {
      openReward: vi.fn(),
    };
    const ports = {
      getRewardDeps: vi.fn(() => ({ token: 'reward-deps' })),
      getRewardFlowDeps: vi.fn(() => rewardFlow),
      getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
    };

    const actions = createRewardActions(modules, ports);
    actions.showRewardScreen(true);
    actions.openReward('boss');

    expect(rewardFlow.openReward).toHaveBeenCalledWith(true);
    expect(rewardFlow.openReward).toHaveBeenCalledWith('boss');
    expect(modules.RewardUI.showRewardScreen).not.toHaveBeenCalled();
    expect(ports.getRewardDeps).not.toHaveBeenCalled();
  });
});
