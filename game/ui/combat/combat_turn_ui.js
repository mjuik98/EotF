/**
 * combat_turn_ui.js — 전투 턴 UI (순수 View)
 *
 * TurnManager에서 로직 결과를 받아 DOM만 업데이트합니다.
 */
import { GS } from '../../core/game_state.js';
import { DATA } from '../../../data/game_data.js';
import { TurnManager } from '../../combat/turn_manager.js';


function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

export const CombatTurnUI = {
  endPlayerTurn(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;

    // ── 로직 위임 ──
    const result = TurnManager.endPlayerTurnLogic(gs, data, {
      canPlayFn: window.CardCostUtils?.canPlay,
    });
    if (!result) return;

    // ── UI 업데이트 ──
    deps.updateChainUI?.(0);

    const doc = _getDoc(deps);
    const turnIndicator = doc.getElementById('turnIndicator');
    if (turnIndicator) {
      turnIndicator.className = 'turn-indicator turn-enemy';
      turnIndicator.textContent = '적의 턴';
    }
    deps.showTurnBanner?.('enemy');
    doc.querySelectorAll('.action-btn').forEach(btn => { btn.disabled = true; });

    setTimeout(async () => {
      try {
        await deps.enemyTurn?.();
      } catch (e) {
        console.error('[CombatTurn] 적 턴 오류:', e);
      }
    }, 700);
  },

  async enemyTurn(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const win = _getWin(deps);
    const doc = _getDoc(deps);
    if (!gs?.combat?.active) return;

    const waitWhileActive = async (ms) => {
      const steps = Math.ceil(ms / 50);
      for (let i = 0; i < steps; i++) {
        if (!gs.combat.active) return false;
        await new Promise(r => setTimeout(r, 50));
      }
      return gs.combat.active;
    };

    // ── 적 상태효과 틱: 로직 위임 → UI 반영 ──
    const tickEvents = TurnManager.processEnemyStatusTicks(gs);
    for (const evt of tickEvents) {
      const ex = win.innerWidth / 2 + (evt.index - 0.5) * 200;
      deps.showDmgPopup?.(evt.dmg, ex, 200, evt.color);
      if (evt.type === 'poison') {
        deps.particleSystem?.emit?.(ex, 200, { count: 5, color: '#00ff44', size: 2, speed: 2, life: 0.5 });
      } else if (evt.type === 'burning') {
        deps.particleSystem?.emit?.(ex, 180, { count: 6, color: '#ff6600', size: 3, speed: 3, life: 0.4 });
      } else if (evt.type === 'marked_explode') {
        deps.screenShake?.shake?.(10, 0.5);
        deps.particleSystem?.burstEffect?.(ex, 200);
        deps.audioEngine?.playChain?.(4);
      } else if (evt.type === 'doom_explode') {
        deps.showDmgPopup?.(evt.dmg, win.innerWidth / 2, 300, evt.color);
        deps.screenShake?.shake?.(10, 0.5);
      }
    }
    deps.renderCombatEnemies?.();

    // ── 개별 적 행동 ──
    for (let index = 0; index < gs.combat.enemies.length; index++) {
      const enemy = gs.combat.enemies[index];
      if (enemy.hp <= 0) continue;

      if (!(await waitWhileActive(800))) return;

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
        const phaseResult = TurnManager.handleBossPhaseShiftLogic(gs, enemy);
        // UI 이펙트
        const sprite = doc.getElementById(`enemy_sprite_${index}`);
        if (sprite) {
          sprite.style.animation = 'none';
          setTimeout(() => { sprite.style.animation = 'enemyHit 0.8s ease 3'; }, 10);
        }
        deps.screenShake?.shake?.(15, 1.0);
        deps.audioEngine?.playBossPhase?.();
        deps.particleSystem?.burstEffect?.(
          win.innerWidth / 2 + (index - (gs.combat.enemies.length / 2 - 0.5)) * 200,
          220,
        );
        setTimeout(() => {
          deps.renderCombatEnemies?.();
          deps.updateStatusDisplay?.();
        }, 50);
        deps.showEchoBurstOverlay?.();
      } else if (action.dmg > 0) {
        // 공격 처리: 로직 → UI
        const hitResults = TurnManager.processEnemyAttack(gs, enemy, index, action);
        for (const hit of hitResults) {
          // 피격 애니메이션
          const card = doc.getElementById(`enemy_${index}`);
          if (card) {
            card.classList.add('hit');
            setTimeout(() => card.classList.remove('hit'), 400);
          }
          if (hit.hitIndex < (action.multi || 1) - 1) {
            await new Promise(r => setTimeout(r, 200));
          }
          if (hit.enemyDied) {
            deps.renderCombatEnemies?.();
            break;
          }
        }
      }

      // 이펙트 처리: 로직 → UI
      const effectResult = TurnManager.handleEnemyEffect(action.effect, gs, enemy, {
        baseRegion: deps.getBaseRegionIndex?.(gs.currentRegion),
        data,
      });
      if (effectResult?.uiAction) {
        this._dispatchUIAction(effectResult, deps);
      }

      // 약화 감소 (로직)
      TurnManager.decayEnemyWeaken(enemy);

      deps.renderCombatEnemies?.();
    }

    // ── 플레이어 턴 시작: 로직 → UI ──
    if (!(await waitWhileActive(600))) return;

    console.log('[CombatTurn] Player turn start - energy:', gs.player.energy, 'maxEnergy:', gs.player.maxEnergy);
    console.log('[CombatTurn] Region:', gs.currentRegion, 'baseRegion:', typeof window.getBaseRegionIndex === 'function' ? window.getBaseRegionIndex(gs.currentRegion) : 'N/A');

    const statusResult = TurnManager.processPlayerStatusTicks(gs, {
      shuffleArrayFn: deps.shuffleArray,
    });
    if (!statusResult.alive) return;
    statusResult.actions.forEach(a => this._dispatchUIAction({ uiAction: a }, deps));

    TurnManager.startPlayerTurnLogic(gs);

    // 에너지 상태 변경(드로우 버튼 활성화 등) 즉시 반영
    if (typeof deps.updateCombatEnergy === 'function') {
      deps.updateCombatEnergy(gs);
    } else if (typeof deps.hudUpdateUI?.updateCombatEnergy === 'function') {
      deps.hudUpdateUI.updateCombatEnergy(gs);
    }

    deps.runRules?.onTurnStart?.(gs);

    // UI 반영
    const turnIndicator = doc.getElementById('turnIndicator');
    if (turnIndicator) {
      turnIndicator.className = 'turn-indicator turn-player';
      turnIndicator.textContent = '플레이어 턴';
    }
    deps.showTurnBanner?.('player');
    doc.querySelectorAll('.action-btn').forEach(btn => {
      btn.disabled = false;
      btn.style.pointerEvents = '';
    });

    deps.renderCombatCards?.();
    deps.renderCombatEnemies?.();
    deps.updateUI?.();
  },

  // ── 유틸: UI 액션 디스패치 ──
  _dispatchUIAction(result, deps) {
    if (!result?.uiAction) return;
    switch (result.uiAction) {
      case 'updateStatusDisplay': deps.updateStatusDisplay?.(); break;
      case 'updateChainUI': deps.updateChainUI?.(result.value ?? 0); break;
      case 'renderCombatCards': deps.renderCombatCards?.(); break;
      case 'updateUI': deps.updateUI?.(); break;
      case 'shuffleAndRender':
        deps.shuffleArray?.(deps.gs?.player?.hand);
        deps.renderCombatCards?.();
        break;
    }
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
    deps.updateStatusDisplay?.();
    deps.updateUI?.();
    return result.alive;
  },

  handleBossPhaseShift(enemy, idx, deps = {}) {
    const gs = deps.gs;
    const doc = _getDoc(deps);
    const win = _getWin(deps);

    TurnManager.handleBossPhaseShiftLogic(gs, enemy);

    const sprite = doc.getElementById(`enemy_sprite_${idx}`);
    if (sprite) {
      sprite.style.animation = 'none';
      setTimeout(() => { sprite.style.animation = 'enemyHit 0.8s ease 3'; }, 10);
    }
    deps.screenShake?.shake?.(15, 1.0);
    deps.audioEngine?.playBossPhase?.();
    deps.particleSystem?.burstEffect?.(
      win.innerWidth / 2 + (idx - (gs.combat.enemies.length / 2 - 0.5)) * 200,
      220,
    );
    setTimeout(() => {
      deps.renderCombatEnemies?.();
      deps.updateStatusDisplay?.();
    }, 50);
    deps.showEchoBurstOverlay?.();
  },

  handleEnemyEffect(effect, enemy, idx, deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const baseRegion = deps.getBaseRegionIndex?.(gs.currentRegion);
    const result = TurnManager.handleEnemyEffect(effect, gs, enemy, { baseRegion, data });
    if (result?.uiAction) this._dispatchUIAction(result, deps);
  },
};
