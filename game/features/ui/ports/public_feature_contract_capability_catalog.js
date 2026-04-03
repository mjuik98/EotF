import { createCombatContractCapabilities } from '../../combat/ports/public_contract_capabilities.js';
import { createEventContractCapabilities } from '../../event/ports/public_contract_capabilities.js';
import { createRewardContractCapabilities } from '../../reward/ports/public_contract_capabilities.js';
import { createRunContractCapabilities } from '../../run/ports/public_contract_capabilities.js';
import { createTitleContractCapabilities } from '../../title/ports/public_contract_capabilities.js';
import { createUiContractCapabilities } from './public_contract_capabilities.js';

export function createFeatureContractCapabilityCatalog() {
  return {
    combat: createCombatContractCapabilities(),
    event: createEventContractCapabilities(),
    reward: createRewardContractCapabilities(),
    run: createRunContractCapabilities(),
    title: createTitleContractCapabilities(),
    ui: createUiContractCapabilities(),
  };
}
