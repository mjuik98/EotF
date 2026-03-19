import {
  applyCombatEndCleanupReducerState,
  applyCombatRegionSetReducerState,
  applyCombatStartReducerState,
  applyCombatDeckPrepareReducerState,
  applyCombatEnemyAddReducerState,
  applyCombatSelectedTargetSyncReducerState,
  applyCombatSetupResetReducerState,
} from '../../features/combat/state/public_combat_reducer_helpers.js';
import { Actions } from '../state_action_types.js';

export const CombatReducers = {
  [Actions.COMBAT_START](gs, { enemies = [] }) {
    applyCombatStartReducerState(gs);
    gs.markDirty('hud');
    gs.markDirty('hand');
    return { enemyCount: enemies.length };
  },

  [Actions.COMBAT_END](gs, { victory = true }) {
    applyCombatEndCleanupReducerState(gs);
    gs.markDirty('hud');
    return { victory };
  },

  [Actions.COMBAT_REGION_SET](gs, { regionId }) {
    return applyCombatRegionSetReducerState(gs, regionId);
  },

  [Actions.COMBAT_SETUP_RESET](gs) {
    const result = applyCombatSetupResetReducerState(gs);
    gs.markDirty('hud');
    gs.markDirty('hand');
    return result;
  },

  [Actions.COMBAT_ENEMY_ADD](gs, { enemy }) {
    const result = applyCombatEnemyAddReducerState(gs, enemy);
    gs.markDirty('hud');
    return result;
  },

  [Actions.COMBAT_DECK_PREPARE](gs) {
    const result = applyCombatDeckPrepareReducerState(gs);
    gs.markDirty('hand');
    return result;
  },

  [Actions.COMBAT_SELECTED_TARGET_SYNC](gs) {
    return applyCombatSelectedTargetSyncReducerState(gs);
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
