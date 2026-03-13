import { createCombatContractCapabilities } from '../../../features/combat/ports/contracts/public_combat_contract_capabilities.js';
import { createEventContractCapabilities } from '../../../features/event/ports/contracts/public_event_contract_capabilities.js';
import { createRewardContractCapabilities } from '../../../features/reward/ports/contracts/public_reward_contract_capabilities.js';
import { createRunContractCapabilities } from '../../../features/run/ports/contracts/public_run_contract_capabilities.js';
import { createTitleContractCapabilities } from '../../../features/title/ports/contracts/public_title_contract_capabilities.js';
import { createUiContractCapabilities } from '../../../features/ui/ports/contracts/public_ui_contract_capabilities.js';

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
