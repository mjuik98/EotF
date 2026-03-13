import { createFeatureContractCapabilities } from './create_feature_contract_capabilities.js';

export function buildUiContractBuilders(ctx) {
  const featureContracts = createFeatureContractCapabilities();
  return {
    ...featureContracts.combat.buildUi(ctx),
    ...featureContracts.ui.buildShell(ctx),
    ...featureContracts.run.buildUi(ctx),
  };
}
