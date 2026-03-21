import { describe, expect, it, vi } from 'vitest';

import { registerRewardModules } from '../game/platform/browser/composition/register_reward_modules.js';

describe('registerRewardModules', () => {
  it('publishes a lazy reward facade instead of eagerly importing the full reward screen module', () => {
    const { RewardUI } = registerRewardModules();

    expect(RewardUI).toMatchObject({
      __lazyModule: true,
      showRewardScreen: expect.any(Function),
      takeRewardBlessing: expect.any(Function),
      takeRewardCard: expect.any(Function),
      takeRewardItem: expect.any(Function),
      takeRewardUpgrade: expect.any(Function),
      takeRewardRemove: expect.any(Function),
      showSkipConfirm: expect.any(Function),
      hideSkipConfirm: expect.any(Function),
      skipReward: expect.any(Function),
    });
  });
});
