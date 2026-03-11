/**
 * combat_turn_ui.js — 전투 턴 UI (순수 View)
 *
 * TurnManager에서 로직 결과를 받아 DOM만 업데이트합니다.
 */
import { endPlayerTurnUseCase } from '../../app/combat/use_cases/end_player_turn_use_case.js';
import { runEnemyTurnUseCase } from '../../app/combat/use_cases/run_enemy_turn_use_case.js';
import { TurnManager } from '../../combat/turn_manager.js';
import { resolveActiveRegionId } from '../../domain/run/region_service.js';
import {
  cleanupCombatTurnTooltips,
  setEnemyTurnUiState,
  setPlayerTurnUiState,
  showBossPhaseShiftUi,
  syncCombatTurnEnergy,
} from './combat_turn_runtime_ui.js';
import {
  dispatchCombatTurnUiAction,
  playEnemyAttackHitUi,
  playEnemyStatusTickEffects,
  shouldAbortCombatTurn,
  waitWhileCombatActive,
} from './combat_turn_flow_ui.js';


function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _getCombatRegionId(gs) {
  return resolveActiveRegionId(gs);
}

export const CombatTurnUI = {
  endPlayerTurn(deps = {}) {
    endPlayerTurnUseCase({
      gs: deps.gs,
      data: deps.data,
      canPlay: deps.cardCostUtils?.canPlay,
      classMechanics: deps.classMechanics,
      resetChainUi: (value) => deps.updateChainUI?.(value),
      cleanupTurnUi: () => cleanupCombatTurnTooltips(deps),
      showEnemyTurnUi: () => setEnemyTurnUiState(deps),
      runEnemyTurn: () => deps.enemyTurn?.(),
    });
  },

  async enemyTurn(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const win = _getWin(deps);
    const doc = _getDoc(deps);
    await runEnemyTurnUseCase({
      gs,
      data,
      shuffleArray: deps.shuffleArray,
      classMechanics: deps.classMechanics,
      cleanupTooltips: () => cleanupCombatTurnTooltips(deps),
      shouldAbortTurn: shouldAbortCombatTurn,
      waitForCombat: waitWhileCombatActive,
      playStatusTickEffects: (events) => playEnemyStatusTickEffects(events, deps, win),
      renderCombatEnemies: () => deps.renderCombatEnemies?.(),
      onEnemyStunned: (enemy) => {
        gs.addLog?.(`🌀 ${enemy.name}: 기절 상태!`, 'echo');
      },
      showBossPhaseShift: (_enemy, index) => showBossPhaseShiftUi(gs, index, deps),
      playEnemyAttackHit: (index, hit, action) => playEnemyAttackHitUi(index, hit, action, deps, doc),
      dispatchUiAction: (result) => dispatchCombatTurnUiAction(result, deps),
      syncCombatEnergy: () => syncCombatTurnEnergy(gs, deps),
      onTurnStart: () => deps.runRules?.onTurnStart?.(gs),
      onPlayerTurnStarted: () => setPlayerTurnUiState(gs, deps),
    });
  },

  // ── 유틸: UI 액션 디스패치 ──
  _dispatchUIAction(result, deps) {
    dispatchCombatTurnUiAction(result, deps);
  },

  // ── 하위 호환: 기존 API 유지 ──
  processEnemyStatusTicks(deps = {}) {
    const gs = deps.gs;
    TurnManager.processEnemyStatusTicks(gs);
    deps.renderCombatEnemies?.();
  },

  processPlayerStatusTicks(deps = {}) {
    const gs = deps.gs;
    const result = TurnManager.processPlayerStatusTicks(gs, {
      shuffleArrayFn: deps.shuffleArray,
    });
    syncCombatTurnEnergy(gs, deps);
    deps.updateStatusDisplay?.();
    deps.updateUI?.();
    return result.alive;
  },

  handleBossPhaseShift(enemy, idx, deps = {}) {
    const gs = deps.gs;

    TurnManager.handleBossPhaseShiftLogic(gs, enemy);
    showBossPhaseShiftUi(gs, idx, deps);
  },

  handleEnemyEffect(effect, enemy, idx, deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const regionId = _getCombatRegionId(gs);
    const result = TurnManager.handleEnemyEffect(effect, gs, enemy, { regionId, data });
    if (result?.uiAction) dispatchCombatTurnUiAction(result, deps);
  },
};
