import { createCombatContractCapabilities } from '../../../features/combat/ports/public_contract_capabilities.js';
import { createEventContractCapabilities } from '../../../features/event/ports/public_contract_capabilities.js';
import { createRewardContractCapabilities } from '../../../features/reward/ports/public_contract_capabilities.js';
import { createRunContractCapabilities } from '../../../features/run/ports/public_contract_capabilities.js';
import { createTitleContractCapabilities } from '../../../features/title/ports/public_contract_capabilities.js';
import { createUiContractCapabilities } from '../../../features/ui/ports/public_contract_capabilities.js';

export function createFeatureContractCapabilities() {
  return {
    combat: createCombatContractCapabilities(),
    event: createEventContractCapabilities(),
    reward: createRewardContractCapabilities(),
    run: createRunContractCapabilities(),
    title: createTitleContractCapabilities(),
    ui: createUiContractCapabilities(),
  };
}
