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

export function createCombatStateCapabilities() {
  return {
    addCombatEnemyState,
    applyCombatEndCleanupState,
    beginPlayerTurnState,
    consumePlayerBuffStackState,
    finalizePlayerTurnEndState,
    prepareCombatDeckState,
    resetCombatSetupState,
    syncCombatSelectedTargetState,
  };
}

export {
  addCombatEnemyState,
  applyCombatEndCleanupState,
  beginPlayerTurnState,
  consumePlayerBuffStackState,
  finalizePlayerTurnEndState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncCombatSelectedTargetState,
};
