import { buildRewardOptionsUseCase, getRewardMaxEnergyCap } from './application/build_reward_options_use_case.js';
import {
  buildRewardDiscardDeps,
  claimReward,
  createRewardReturnActions,
  ensureMiniBossBonus,
  playRewardClaimFeedback,
  scheduleRewardReturnUseCase,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
} from './application/claim_reward_use_case.js';
import { createRewardRuntime } from './application/create_reward_runtime.js';
import { showRewardScreenRuntime } from './application/show_reward_screen_runtime.js';
import { createRewardContractCapabilities } from './ports/public_contract_capabilities.js';
import { createRewardModuleCapabilities } from './ports/public_module_capabilities.js';
import { buildRewardFlowContractBuilders } from './ports/contracts/build_reward_flow_contracts.js';
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

export function createRewardApplicationCapabilities() {
  return {
    buildOptions: buildRewardOptionsUseCase,
    buildDiscardDeps: buildRewardDiscardDeps,
    claimReward,
    createReturnActions: createRewardReturnActions,
    ensureMiniBossBonus,
    getMaxEnergyCap: getRewardMaxEnergyCap,
    playClaimFeedback: playRewardClaimFeedback,
    scheduleReturn: scheduleRewardReturnUseCase,
    startRemove: startRewardRemoveUseCase,
    takeClaim: takeRewardClaimUseCase,
  };
}

export function createRewardRuntimeCapabilities() {
  return {
    createRuntime: createRewardRuntime,
    showScreen: showRewardScreenRuntime,
  };
}

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
  buildRewardFlowContractPublicBuilders,
  moduleCapabilities: createRewardModuleCapabilities(),
  runtime: createRewardRuntimeCapabilities(),
});

export function buildRewardFlowContractPublicBuilders(ctx) {
  return buildRewardFlowContractBuilders(ctx);
}

export {
  buildRewardDiscardDeps,
  createRewardContractCapabilities,
  buildRewardFlowContractBuilders,
  buildRewardOptionsUseCase,
  claimReward,
  createRewardReturnActions,
  createRewardRuntime,
  ensureMiniBossBonus,
  getRewardMaxEnergyCap,
  playRewardClaimFeedback,
  scheduleRewardReturnUseCase,
  showRewardScreenRuntime,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
};
