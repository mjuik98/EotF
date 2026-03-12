/**
 * combat_turn_ui.js — legacy combat turn facade kept for compatibility.
 */
import { createCombatTurnRuntime } from '../../features/combat/application/create_combat_turn_runtime.js';
import {
  handleBossPhaseShiftAction,
  handleEnemyEffectAction,
  processEnemyStatusTicksAction,
  processPlayerStatusTicksAction,
} from '../../features/combat/app/combat_turn_compat_actions.js';
import {
  showBossPhaseShiftUi,
  syncCombatTurnEnergy,
} from './combat_turn_runtime_ui.js';
import {
  dispatchCombatTurnUiAction,
} from './combat_turn_flow_ui.js';

const combatTurnRuntime = createCombatTurnRuntime();

export const CombatTurnUI = {
  endPlayerTurn(deps = {}) {
    return combatTurnRuntime.endPlayerTurn(deps);
  },

  async enemyTurn(deps = {}) {
    return combatTurnRuntime.enemyTurn(deps);
  },

  // ── 유틸: UI 액션 디스패치 ──
  _dispatchUIAction(result, deps) {
    dispatchCombatTurnUiAction(result, deps);
  },

  // ── 하위 호환: 기존 API 유지 ──
  processEnemyStatusTicks(deps = {}) {
    return processEnemyStatusTicksAction({
      gs: deps.gs,
      renderCombatEnemies: deps.renderCombatEnemies,
    });
  },

  processPlayerStatusTicks(deps = {}) {
    return processPlayerStatusTicksAction({
      gs: deps.gs,
      shuffleArray: deps.shuffleArray,
      syncCombatEnergy: () => syncCombatTurnEnergy(deps.gs, deps),
      updateStatusDisplay: deps.updateStatusDisplay,
      updateUI: deps.updateUI,
    });
  },

  handleBossPhaseShift(enemy, idx, deps = {}) {
    return handleBossPhaseShiftAction({
      gs: deps.gs,
      enemy,
      index: idx,
      presentBossPhaseShift: () => showBossPhaseShiftUi(deps.gs, idx, deps),
    });
  },

  handleEnemyEffect(effect, enemy, idx, deps = {}) {
    return handleEnemyEffectAction({
      gs: deps.gs,
      data: deps.data,
      effect,
      enemy,
      dispatchUiAction: (result) => dispatchCombatTurnUiAction(result, deps),
    });
  },
};
