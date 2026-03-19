import {
  createRewardApplicationCapabilities,
} from './ports/public_application_capabilities.js';
import { createRewardContractCapabilities } from './ports/public_contract_capabilities.js';
import { createRewardModuleCapabilities } from './ports/public_module_capabilities.js';
import {
  createRewardRuntime,
  createRewardRuntimeCapabilities,
  showRewardScreenRuntime,
} from './ports/runtime/public_reward_runtime_surface.js';
export {
  finishRewardFlow,
  REWARD_CLAIM_KEY,
  REWARD_SKIP_KEY,
  skipRewardAction,
  takeRewardBlessingAction,
  takeRewardCardAction,
  takeRewardItemAction,
  takeRewardRemoveAction,
  takeRewardUpgradeAction,
} from './application/reward_runtime_actions.js';

export function createRewardFeatureFacade() {
  return {
    moduleCapabilities: createRewardModuleCapabilities(),
    application: createRewardApplicationCapabilities(),
    contracts: createRewardContractCapabilities(),
    runtime: createRewardRuntimeCapabilities(),
  };
}

export const RewardPublicSurface = Object.freeze({
  application: createRewardApplicationCapabilities(),
  contracts: createRewardContractCapabilities(),
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardFeatureFacade,
  createRewardModuleCapabilities,
  createRewardRuntimeCapabilities,
  moduleCapabilities: createRewardModuleCapabilities(),
  runtime: createRewardRuntimeCapabilities(),
});

export {
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardRuntime,
  createRewardRuntimeCapabilities,
  showRewardScreenRuntime,
};
