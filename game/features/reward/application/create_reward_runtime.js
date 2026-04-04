import {
  finishRewardFlow,
  skipRewardAction,
  takeRewardBlessingAction,
  takeRewardCardAction,
  takeRewardItemAction,
  takeRewardRemoveAction,
  takeRewardUpgradeAction,
} from './reward_runtime_actions.js';
import { resolveRewardRuntimeContext } from '../ports/reward_runtime_context_ports.js';

export function createRewardRuntime(deps = {}, runtime = null) {
  const rewardRuntime = resolveRewardRuntimeContext(deps, runtime);
  return {
    finishReward() {
      return finishRewardFlow(deps);
    },

    takeRewardBlessing(blessing) {
      return takeRewardBlessingAction(blessing, deps, rewardRuntime);
    },

    takeRewardCard(cardId) {
      return takeRewardCardAction(cardId, deps, rewardRuntime);
    },

    takeRewardItem(itemKey) {
      return takeRewardItemAction(itemKey, deps, rewardRuntime);
    },

    takeRewardUpgrade() {
      return takeRewardUpgradeAction(deps, rewardRuntime);
    },

    takeRewardRemove() {
      return takeRewardRemoveAction(deps, rewardRuntime);
    },

    showSkipConfirm() {
      rewardRuntime.setSkipConfirmVisible?.(deps, true);
    },

    hideSkipConfirm() {
      rewardRuntime.setSkipConfirmVisible?.(deps, false);
    },

    skipReward() {
      return skipRewardAction(deps, rewardRuntime);
    },
  };
}
