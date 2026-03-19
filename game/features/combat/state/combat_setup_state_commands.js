import { CombatStateActionIds } from './combat_state_action_ids.js';
import {
  applyCombatDeckPrepareReducerState,
  applyCombatPlayerSetupReducerState,
} from './commands/combat_player_setup_state_commands.js';
import {
  applyCombatEnemyAddReducerState,
  applyCombatSelectedTargetSyncReducerState,
  applyCombatSessionSetupReducerState,
} from './commands/combat_session_setup_state_commands.js';

function dispatchCombatSetupState(state, action, payload = {}) {
  if (typeof state?.dispatch !== 'function') return null;
  const result = state.dispatch(action, payload);
  return result !== undefined && result !== null ? result : null;
}

export function applyCombatSetupResetReducerState(state) {
  const combat = state?.combat;
  const player = state?.player;
  if (!combat || !player) return null;

  applyCombatSessionSetupReducerState(state);
  applyCombatPlayerSetupReducerState(state);

  return { selectedTarget: state._selectedTarget, turn: combat.turn };
}

export function resetCombatSetupState(state) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatSetupReset, {})
    ?? applyCombatSetupResetReducerState(state);
}

export function addCombatEnemyState(state, enemy) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatEnemyAdd, { enemy })
    ?? applyCombatEnemyAddReducerState(state, enemy);
}

export function prepareCombatDeckState(state) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatDeckPrepare, {})
    ?? applyCombatDeckPrepareReducerState(state);
}

export function syncCombatSelectedTargetState(state) {
  return dispatchCombatSetupState(state, CombatStateActionIds.combatSelectedTargetSync, {})
    ?? applyCombatSelectedTargetSyncReducerState(state);
}
