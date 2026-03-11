import {
  getDoc,
} from '../../ui/screens/reward_ui_helpers.js';
import {
  setSkipConfirmVisible,
} from '../../ui/screens/reward_ui_render.js';
import { showRewardScreenRuntime } from '../../ui/screens/reward_ui_screen_runtime.js';
import {
  skipRewardRuntime,
  takeRewardBlessingRuntime,
  takeRewardCardRuntime,
  takeRewardItemRuntime,
  takeRewardRemoveRuntime,
  takeRewardUpgradeRuntime,
} from '../../ui/screens/reward_ui_runtime.js';

export const RewardUI = {
  showRewardScreen(mode = false, deps = {}) {
    showRewardScreenRuntime(this, mode, deps);
  },

  takeRewardBlessing(blessing, deps = {}) {
    return takeRewardBlessingRuntime(blessing, deps);
  },

  takeRewardCard(cardId, deps = {}) {
    return takeRewardCardRuntime(cardId, deps);
  },

  takeRewardItem(itemKey, deps = {}) {
    return takeRewardItemRuntime(itemKey, deps);
  },

  takeRewardUpgrade(deps = {}) {
    return takeRewardUpgradeRuntime(deps);
  },

  takeRewardRemove(deps = {}) {
    return takeRewardRemoveRuntime(deps);
  },

  showSkipConfirm(deps = {}) {
    setSkipConfirmVisible(getDoc(deps), true);
  },

  hideSkipConfirm(deps = {}) {
    setSkipConfirmVisible(getDoc(deps), false);
  },

  skipReward(deps = {}) {
    return skipRewardRuntime(deps);
  },
};
