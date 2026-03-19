import { buildRewardOptionsUseCase, getRewardMaxEnergyCap } from '../application/build_reward_options_use_case.js';
import {
  buildRewardDiscardDeps,
  claimReward,
  createRewardReturnActions,
  ensureMiniBossBonus,
  playRewardClaimFeedback,
  scheduleRewardReturnUseCase,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
} from '../application/claim_reward_use_case.js';

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

export {
  buildRewardDiscardDeps,
  buildRewardOptionsUseCase,
  claimReward,
  createRewardReturnActions,
  ensureMiniBossBonus,
  getRewardMaxEnergyCap,
  playRewardClaimFeedback,
  scheduleRewardReturnUseCase,
  startRewardRemoveUseCase,
  takeRewardClaimUseCase,
};
