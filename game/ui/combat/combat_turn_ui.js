/**
 * combat_turn_ui.js — 전투 턴 UI (순수 View)
 *
 * TurnManager에서 로직 결과를 받아 DOM만 업데이트합니다.
 */
import { endPlayerTurnService } from '../../app/combat/end_turn_service.js';
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
    const outcome = endPlayerTurnService({
      gs: deps.gs,
      data: deps.data,
      canPlay: deps.cardCostUtils?.canPlay,
      classMechanics: deps.classMechanics,
    });
    if (!outcome) return;

    // ── UI 업데이트 ──
    if (outcome.ui.resetChain) deps.updateChainUI?.(0);
    if (outcome.ui.cleanupTooltips) cleanupCombatTurnTooltips(deps);
    if (outcome.ui.setEnemyTurn) setEnemyTurnUiState(deps);

    setTimeout(async () => {
      try {
        await deps.enemyTurn?.();
      } catch (e) {
        console.error('[CombatTurn] 적 턴 오류:', e);
      }
    }, outcome.ui.enemyTurnDelayMs);
  },

  async enemyTurn(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const win = _getWin(deps);
    const doc = _getDoc(deps);
    cleanupCombatTurnTooltips(deps);

    if (!gs?.combat?.active) return;
    if (gs._endCombatScheduled || gs._endCombatRunning) return;

    // ── 적 상태효과 틱: 로직 위임 → UI 반영 ──
    const tickEvents = TurnManager.processEnemyStatusTicks(gs);
    playEnemyStatusTickEffects(tickEvents, deps, win);
    deps.renderCombatEnemies?.();

    // ── 개별 적 행동 ──
    for (let index = 0; index < gs.combat.enemies.length; index++) {
      if (gs._endCombatScheduled || gs._endCombatRunning) return;
      const enemy = gs.combat.enemies[index];
      if (enemy.hp <= 0) continue;

      if (!(await waitWhileCombatActive(gs, 800))) return;

      // 기절 처리 (로직)
      if (TurnManager.processEnemyStun(enemy)) {
        gs.addLog?.(`🌀 ${enemy.name}: 기절 상태!`, 'echo');
        deps.renderCombatEnemies?.();
        continue;
      }

      // AI 행동 결정 (로직)
      const action = TurnManager.getEnemyAction(enemy, gs.combat.turn);

      if (action.type === 'phase_shift' || action.effect === 'phase_shift') {
        // 보스 페이즈 전환: 로직 → UI
        TurnManager.handleBossPhaseShiftLogic(gs, enemy);
        // UI 이펙트
        showBossPhaseShiftUi(gs, index, deps);
      } else if (action.dmg > 0) {
        // 공격 처리: 로직 → UI
        const hitResults = TurnManager.processEnemyAttack(gs, enemy, index, action);
        for (const hit of hitResults) {
          if (await playEnemyAttackHitUi(index, hit, action, deps, doc)) break;
        }
      }

      // 이펙트 처리: 로직 → UI
      const effectResult = TurnManager.handleEnemyEffect(action.effect, gs, enemy, {
        regionId: _getCombatRegionId(gs),
        data,
      });
      if (effectResult?.uiAction) dispatchCombatTurnUiAction(effectResult, deps);

      // 약화 감소 (로직)
      TurnManager.decayEnemyWeaken(enemy);

      deps.renderCombatEnemies?.();
    }

    // ── 플레이어 턴 시작: 로직 → UI ──
    if (!(await waitWhileCombatActive(gs, 600))) return;
    if (gs._endCombatScheduled || gs._endCombatRunning) return;

    const statusResult = TurnManager.processPlayerStatusTicks(gs, {
      shuffleArrayFn: deps.shuffleArray,
    });
    if (!statusResult.alive) return;
    statusResult.actions.forEach(a => dispatchCombatTurnUiAction({ uiAction: a }, deps));
    if (gs._endCombatScheduled || gs._endCombatRunning) return;

    // 잔영 갑주: 적 공격 후 실제 남은 방어막 기준으로 _preservedShield 재계산
    // (onTurnEnd에서 적 공격 전에 저장한 값이 적 공격 후 변경된 방어막을 반영하지 않는 버그 수정)
    if (gs.player.class === 'guardian') {
      gs.player._preservedShield = gs.player.shield > 0 ? Math.floor(gs.player.shield / 2) : 0;
    }

    TurnManager.startPlayerTurnLogic(gs);

    // 에너지 상태 변경(드로우 버튼 활성화 등) 즉시 반영
    syncCombatTurnEnergy(gs, deps);

    deps.runRules?.onTurnStart?.(gs);

    // 클래스 특성 턴 시작 훅 (찬송기사 회복, 무음수호자 방어막 유지 등)
    const classMechanics = deps.classMechanics;
    const classMech = classMechanics?.[gs.player.class];
    if (classMech && typeof classMech.onTurnStart === 'function') {
      classMech.onTurnStart(gs);
    }

    // UI 반영
    setPlayerTurnUiState(gs, deps);
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

    if (globalThis.HudUpdateUI?.updateCombatEnergy) {
      globalThis.HudUpdateUI.updateCombatEnergy(gs);
    } else if (globalThis.GAME?.Modules?.['HudUpdateUI']?.updateCombatEnergy) {
      globalThis.GAME.Modules['HudUpdateUI'].updateCombatEnergy(gs);
    }

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
