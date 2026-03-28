import {
  cleanupCombatTurnTooltips,
  setEnemyTurnUiState,
  setPlayerTurnUiState,
  showBossPhaseShiftUi,
  syncCombatTurnEnergy,
} from '../presentation/browser/combat_turn_runtime_ui.js';
import {
  dispatchCombatTurnUiAction,
  playEnemyAttackHitUi,
  playEnemyStatusTickEffects,
  shouldAbortCombatTurn,
  waitWhileCombatActive,
} from '../presentation/browser/combat_turn_flow_ui.js';
import { getDoc, getWin } from '../../../utils/runtime_deps.js';

export function createCombatTurnRuntimePorts() {
  return {
    cleanupTurnUi(deps = {}) {
      return cleanupCombatTurnTooltips(deps);
    },
    dispatchUiAction(result, deps = {}) {
      return dispatchCombatTurnUiAction(result, deps);
    },
    playEnemyAttackHit(index, hit, action, deps = {}) {
      return playEnemyAttackHitUi(index, hit, action, deps, getDoc(deps));
    },
    playStatusTickEffects(events, deps = {}) {
      return playEnemyStatusTickEffects(events, deps, getWin(deps));
    },
    shouldAbortTurn: shouldAbortCombatTurn,
    showBossPhaseShift(gs, index, deps = {}) {
      return showBossPhaseShiftUi(gs, index, deps);
    },
    showEnemyTurnUi(deps = {}) {
      return setEnemyTurnUiState(deps);
    },
    showPlayerTurnUi(gs, deps = {}) {
      return setPlayerTurnUiState(gs, deps);
    },
    syncCombatEnergy(gs, deps = {}) {
      return syncCombatTurnEnergy(gs, deps);
    },
    waitForCombat: waitWhileCombatActive,
  };
}
