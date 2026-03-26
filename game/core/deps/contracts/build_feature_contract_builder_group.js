import { createFeatureContractCapabilities } from './create_feature_contract_capabilities.js';

let cachedFeatureContracts = null;

function resolveFeatureContracts(featureContracts) {
  if (featureContracts) return featureContracts;
  if (!cachedFeatureContracts) {
    cachedFeatureContracts = createFeatureContractCapabilities();
  }
  return cachedFeatureContracts;
}

export function buildFeatureContractBuilderGroup({ featureContracts, ctx, definitions }) {
  const resolvedFeatureContracts = resolveFeatureContracts(featureContracts);
  return Object.freeze(
    Object.assign(
      {},
      ...definitions.map(({ feature, capability }) => {
        const builderFactory = resolvedFeatureContracts?.[feature]?.[capability];
        if (typeof builderFactory !== 'function') return {};
        return builderFactory(ctx) || {};
      }),
    ),
  );
}
