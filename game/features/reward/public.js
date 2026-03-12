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
import { buildRewardFlowContractBuilders } from './ports/contracts/build_reward_flow_contracts.js';
import { RewardUI } from './presentation/browser/reward_ui.js';
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

export function createRewardContractCapabilities() {
  return {
    buildFlow: buildRewardFlowContractPublicBuilders,
  };
}

export function createRewardRuntimeCapabilities() {
  return {
    createRuntime: createRewardRuntime,
    showScreen: showRewardScreenRuntime,
  };
}

export function createRewardModuleCapabilities() {
  return {
    primary: { RewardUI },
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

export function buildRewardFlowContractPublicBuilders(ctx) {
  return buildRewardFlowContractBuilders(ctx);
}

export {
  buildRewardDiscardDeps,
  buildRewardFlowContractBuilders,
  buildRewardOptionsUseCase,
  claimReward,
  createRewardReturnActions,
  createRewardRuntime,
  ensureMiniBossBonus,
  getRewardMaxEnergyCap,
  playRewardClaimFeedback,
  RewardUI,
  scheduleRewardReturnUseCase,
  showRewardScreenRuntime,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
};
