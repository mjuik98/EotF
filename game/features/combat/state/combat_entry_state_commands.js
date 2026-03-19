import { CombatStateActionIds } from './combat_state_action_ids.js';

export function applyCombatStartReducerState(state) {
  const combat = state?.combat;
  if (!combat) return null;

  combat.active = true;
  combat.turn = 0;
  combat.playerTurn = true;
  combat.log = [];
  state.currentScreen = 'game';

  return {
    active: combat.active,
    turn: combat.turn,
    playerTurn: combat.playerTurn,
    currentScreen: state.currentScreen,
  };
}

export function applyCombatRegionSetReducerState(state, regionId) {
  state._activeRegionId = Number.isFinite(regionId) ? regionId : null;
  return state._activeRegionId;
}

export function enterCombatState(state) {
  if (typeof state?.dispatch === 'function') {
    const result = state.dispatch(CombatStateActionIds.combatStart, {
      enemies: state?.combat?.enemies || [],
    });
    if (result !== undefined && result !== null) return result;
  }

  const combat = state?.combat;
  if (!combat) return null;

  combat.active = true;
  state.currentScreen = 'game';

  return {
    active: combat.active,
    currentScreen: state.currentScreen,
  };
}

export function setActiveCombatRegionState(state, region) {
  const regionId = Number(region?.id);
  if (typeof state?.dispatch === 'function') {
    const result = state.dispatch(CombatStateActionIds.combatRegionSet, { regionId });
    if (result !== undefined && result !== null) return result;
  }
  return applyCombatRegionSetReducerState(state, regionId);
}
