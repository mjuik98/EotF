import { buildRewardFlowContractBuilders } from './build_reward_flow_contracts.js';

export function createRewardContractCapabilities() {
  return {
    buildFlow: buildRewardFlowContractBuilders,
  };
}
