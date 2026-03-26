import { createFeatureContractCapabilities } from './create_feature_contract_capabilities.js';
import { buildCoreContractBuilders } from './core_contract_builders.js';
import { buildRunContractBuilders } from './run_contract_builders.js';
import { buildUiContractBuilders } from './ui_contract_builders.js';

export function buildContractBuilderGroups(ctx) {
  const featureContracts = createFeatureContractCapabilities();
  const nextCtx = {
    ...ctx,
    featureContracts,
  };

  return Object.freeze({
    core: buildCoreContractBuilders(nextCtx),
    ui: buildUiContractBuilders(nextCtx),
    run: buildRunContractBuilders(nextCtx),
  });
}

export function mergeContractBuilderGroups(groups) {
  return Object.freeze({
    ...(groups?.core || {}),
    ...(groups?.ui || {}),
    ...(groups?.run || {}),
  });
}
