import {
  createRewardApplicationCapabilities,
} from './public_application_capabilities.js';
import { createRewardContractCapabilities } from './public_contract_capabilities.js';
import { createRewardModuleCapabilities } from './public_module_capabilities.js';
import {
  createRewardRuntimeCapabilities,
} from './runtime/public_reward_runtime_surface.js';

export const RewardPublicSurface = Object.freeze({
  application: createRewardApplicationCapabilities(),
  contracts: createRewardContractCapabilities(),
  moduleCapabilities: createRewardModuleCapabilities(),
  runtime: createRewardRuntimeCapabilities(),
});

export {
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardModuleCapabilities,
  createRewardRuntimeCapabilities,
};
