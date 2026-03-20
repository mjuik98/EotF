import { CombatStateActionIds } from './combat_state_action_ids.js';
import { applyCombatSetupResetReducerState } from './combat_setup_state_commands.js';
import { applyCombatPlayerCleanupReducerState } from './commands/combat_player_cleanup_state_commands.js';
import { applyCombatSessionCleanupReducerState } from './commands/combat_session_cleanup_state_commands.js';

export function applyCombatEndCleanupReducerState(state) {
  const combat = state?.combat;
  const player = state?.player;
  if (!combat || !player) return null;

  applyCombatSetupResetReducerState(state);
  applyCombatPlayerCleanupReducerState(state);
  return applyCombatSessionCleanupReducerState(state);
}

export function applyCombatEndCleanupState(state) {
  if (typeof state?.dispatch === 'function' && !state.isDispatching?.()) {
    const result = state.dispatch(CombatStateActionIds.combatEnd, { victory: true });
    if (result !== undefined && result !== null) return result;
  }
  return applyCombatEndCleanupReducerState(state);
}
