import { createRewardRuntime } from '../../application/create_reward_runtime.js';
import { createRewardActions } from '../../application/create_reward_runtime_actions.js';
import { createRewardNavigationActions } from '../../application/reward_navigation_actions.js';
import { showRewardScreenRuntime } from '../../application/workflows/show_reward_screen_workflow.js';

export function createRewardRuntimeCapabilities() {
  return {
    createActions: createRewardActions,
    createNavigation: createRewardNavigationActions,
    createRuntime: createRewardRuntime,
    showScreen: showRewardScreenRuntime,
  };
}

export {
  createRewardActions,
  createRewardNavigationActions,
  createRewardRuntime,
  showRewardScreenRuntime,
};
