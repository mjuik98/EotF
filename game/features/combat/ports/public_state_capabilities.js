import {
  addCombatEnemyState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncCombatSelectedTargetState,
} from '../state/combat_setup_state_commands.js';
import { applyCombatEndCleanupState } from '../state/combat_cleanup_state_commands.js';
import {
  beginPlayerTurnState,
  consumePlayerBuffStackState,
  finalizePlayerTurnEndState,
} from '../state/player_turn_state_commands.js';
import {
  activateCombat,
  deactivateCombat,
} from '../../../shared/state/runtime_flow_controls.js';
import { syncGuardianPreservedShield } from '../../../shared/state/runtime_session_commands.js';

export function createCombatStateCapabilities() {
  return {
    activateCombat,
    addCombatEnemyState,
    deactivateCombat,
    applyCombatEndCleanupState,
    beginPlayerTurnState,
    consumePlayerBuffStackState,
    finalizePlayerTurnEndState,
    prepareCombatDeckState,
    resetCombatSetupState,
    syncGuardianPreservedShield,
    syncCombatSelectedTargetState,
  };
}

export {
  activateCombat,
  addCombatEnemyState,
  deactivateCombat,
  applyCombatEndCleanupState,
  beginPlayerTurnState,
  consumePlayerBuffStackState,
  finalizePlayerTurnEndState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncGuardianPreservedShield,
  syncCombatSelectedTargetState,
};
