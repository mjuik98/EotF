import { buildFeatureContractBuilderGroup } from './build_feature_contract_builder_group.js';

const UI_FEATURE_CONTRACT_BUILDERS = Object.freeze([
  { feature: 'combat', capability: 'buildUi' },
  { feature: 'ui', capability: 'buildShell' },
  { feature: 'run', capability: 'buildUi' },
]);

export function buildUiContractBuilders(ctx) {
  return buildFeatureContractBuilderGroup({
    featureContracts: ctx.featureContracts,
    ctx,
    definitions: UI_FEATURE_CONTRACT_BUILDERS,
  });
}
