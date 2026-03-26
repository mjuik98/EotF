import { buildFeatureContractBuilderGroup } from './build_feature_contract_builder_group.js';

const RUN_FEATURE_CONTRACT_BUILDERS = Object.freeze([
  { feature: 'title', capability: 'buildRun' },
  { feature: 'run', capability: 'buildFlow' },
]);

export function buildRunContractBuilders(ctx) {
  return buildFeatureContractBuilderGroup({
    featureContracts: ctx.featureContracts,
    ctx,
    definitions: RUN_FEATURE_CONTRACT_BUILDERS,
  });
}
