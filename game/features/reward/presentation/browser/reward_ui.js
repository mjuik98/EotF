import { showRewardScreenRuntime } from '../../application/workflows/show_reward_screen_workflow.js';
import { createRewardScreenWorkflowUi } from './create_reward_screen_workflow_ui.js';
import { createLoadedRewardRuntime } from './reward_runtime_loader.js';

async function withRewardRuntime(deps = {}, callback) {
  const runtime = await createLoadedRewardRuntime(deps);
  return callback(runtime);
}

export const RewardUI = {
  showRewardScreen(mode = false, deps = {}) {
    return showRewardScreenRuntime(this, mode, {
      ...deps,
      rewardScreenUi: createRewardScreenWorkflowUi(this, deps),
    });
  },

  takeRewardBlessing(blessing, deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.takeRewardBlessing(blessing));
  },

  takeRewardCard(cardId, deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.takeRewardCard(cardId));
  },

  takeRewardItem(itemKey, deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.takeRewardItem(itemKey));
  },

  takeRewardUpgrade(deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.takeRewardUpgrade());
  },

  takeRewardRemove(deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.takeRewardRemove());
  },

  showSkipConfirm(deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.showSkipConfirm());
  },

  hideSkipConfirm(deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.hideSkipConfirm());
  },

  skipReward(deps = {}) {
    return withRewardRuntime(deps, (runtime) => runtime.skipReward());
  },
};
