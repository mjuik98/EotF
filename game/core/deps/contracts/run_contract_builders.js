import { createFeatureContractCapabilities } from './create_feature_contract_capabilities.js';

export function buildRunContractBuilders(ctx) {
  const featureContracts = createFeatureContractCapabilities();
  return {
    ...featureContracts.title.buildRun(ctx),
    ...featureContracts.run.buildFlow(ctx),
  };
}
