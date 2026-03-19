import {
  createRewardApplicationCapabilities,
} from './public_application_capabilities.js';
import { createRewardContractCapabilities } from './public_contract_capabilities.js';
import { createRewardModuleCapabilities } from './public_module_capabilities.js';
import {
  createRewardRuntime,
  createRewardRuntimeCapabilities,
  showRewardScreenRuntime,
} from './runtime/public_reward_runtime_surface.js';

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
} from '../application/reward_runtime_actions.js';

export const RewardPublicSurface = Object.freeze({
  application: createRewardApplicationCapabilities(),
  contracts: createRewardContractCapabilities(),
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardModuleCapabilities,
  createRewardRuntimeCapabilities,
  moduleCapabilities: createRewardModuleCapabilities(),
  runtime: createRewardRuntimeCapabilities(),
});

export {
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardModuleCapabilities,
  createRewardRuntime,
  createRewardRuntimeCapabilities,
  showRewardScreenRuntime,
};
