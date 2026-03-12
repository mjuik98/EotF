import {
  finishRewardFlow,
  skipRewardAction,
  takeRewardBlessingAction,
  takeRewardCardAction,
  takeRewardItemAction,
  takeRewardRemoveAction,
  takeRewardUpgradeAction,
} from './reward_runtime_actions.js';
import { createRewardRuntimeContext } from '../platform/browser/reward_runtime_context.js';

export function createRewardRuntime(deps = {}, runtime = createRewardRuntimeContext()) {
  return {
    finishReward() {
      return finishRewardFlow(deps);
    },

    takeRewardBlessing(blessing) {
      return takeRewardBlessingAction(blessing, deps, runtime);
    },

    takeRewardCard(cardId) {
      return takeRewardCardAction(cardId, deps, runtime);
    },

    takeRewardItem(itemKey) {
      return takeRewardItemAction(itemKey, deps, runtime);
    },

    takeRewardUpgrade() {
      return takeRewardUpgradeAction(deps, runtime);
    },

    takeRewardRemove() {
      return takeRewardRemoveAction(deps, runtime);
    },

    showSkipConfirm() {
      runtime.setSkipConfirmVisible?.(deps, true);
    },

    hideSkipConfirm() {
      runtime.setSkipConfirmVisible?.(deps, false);
    },

    skipReward() {
      return skipRewardAction(deps, runtime);
    },
  };
}
