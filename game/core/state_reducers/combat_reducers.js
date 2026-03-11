import { applyCombatStartReducerState } from '../../features/combat/state/combat_entry_state_commands.js';
import { applyCombatEndCleanupState } from '../../features/combat/state/combat_cleanup_state_commands.js';
import { Actions } from '../state_action_types.js';

export const CombatReducers = {
  [Actions.COMBAT_START](gs, { enemies = [] }) {
    applyCombatStartReducerState(gs);
    gs.markDirty('hud');
    gs.markDirty('hand');
    return { enemyCount: enemies.length };
  },

  [Actions.COMBAT_END](gs, { victory = true }) {
    applyCombatEndCleanupState(gs);
    gs.markDirty('hud');
    return { victory };
  },

  [Actions.TURN_START](gs, { isPlayerTurn }) {
    const combat = gs.combat;
    combat.turn++;
    combat.playerTurn = isPlayerTurn;
    return { turn: combat.turn, isPlayerTurn };
  },

  [Actions.TURN_END](gs, { isPlayerTurn }) {
    return { turn: gs.combat.turn, isPlayerTurn };
  },
};
