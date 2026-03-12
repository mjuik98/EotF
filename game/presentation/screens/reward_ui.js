import {
  createRewardRuntime,
  showRewardScreenRuntime,
} from '../../features/reward/public.js';

export const RewardUI = {
  showRewardScreen(mode = false, deps = {}) {
    showRewardScreenRuntime(this, mode, deps);
  },

  takeRewardBlessing(blessing, deps = {}) {
    return createRewardRuntime(deps).takeRewardBlessing(blessing);
  },

  takeRewardCard(cardId, deps = {}) {
    return createRewardRuntime(deps).takeRewardCard(cardId);
  },

  takeRewardItem(itemKey, deps = {}) {
    return createRewardRuntime(deps).takeRewardItem(itemKey);
  },

  takeRewardUpgrade(deps = {}) {
    return createRewardRuntime(deps).takeRewardUpgrade();
  },

  takeRewardRemove(deps = {}) {
    return createRewardRuntime(deps).takeRewardRemove();
  },

  showSkipConfirm(deps = {}) {
    createRewardRuntime(deps).showSkipConfirm();
  },

  hideSkipConfirm(deps = {}) {
    createRewardRuntime(deps).hideSkipConfirm();
  },

  skipReward(deps = {}) {
    return createRewardRuntime(deps).skipReward();
  },
};
