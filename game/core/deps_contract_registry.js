import {
  buildContractBuilderGroups,
  mergeContractBuilderGroups,
} from './deps/contracts/build_contract_builder_groups.js';

export function buildDepContractBuilders(ctx) {
  return mergeContractBuilderGroups(buildContractBuilderGroups(ctx));
}
