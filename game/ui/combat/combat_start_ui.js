/**
 * combat_start_ui.js — 전투 시작 UI (순수 View)
 *
 * CombatInitializer에서 로직을 처리하고, 이 파일은 DOM 업데이트만 담당합니다.
 */
import { AudioEngine } from '../../../engine/audio.js';
import { GS } from '../../core/game_state.js';
import { DATA } from '../../../data/game_data.js';
import { Trigger } from '../../data/triggers.js';
import { CombatInitializer } from '../../combat/combat_initializer.js';


function _getDoc(deps) {
  return deps?.doc || document;
}

export const CombatStartUI = {
  startCombat(isBoss = false, deps = {}) {
    console.log('[CombatStart] Starting combat, isBoss:', isBoss);

    const gs = deps.gs;
    const data = deps.data;
    const getRegionData = deps.getRegionData || window.getRegionData;
    const getBaseRegionIndex = deps.getBaseRegionIndex || window.getBaseRegionIndex;
    const getRegionCount = deps.getRegionCount || window.getRegionCount;
    const difficultyScaler = deps.difficultyScaler || window.DifficultyScaler;
    const audioEngine = deps.audioEngine;
    const runRules = deps.runRules;
    const classMechanics = deps.classMechanics || window.ClassMechanics;

    if (!gs || !data?.enemies || typeof getRegionData !== 'function') {
      console.error('[CombatStart] Missing dependencies:', { gs: !!gs, data: !!data, getRegionData: typeof getRegionData });
      return;
    }

    // ── 로직: 상태 리셋 ──
    CombatInitializer.resetCombatState(gs);

    // ── 로직: 적 스폰 ──
    const spawnResult = CombatInitializer.spawnEnemies(gs, data, isBoss, {
      getRegionData,
      getBaseRegionIndex,
      getRegionCount,
      difficultyScaler,
    });

    // UI: 보스 효과음
    if (isBoss) {
      audioEngine?.playBossPhase?.();
      if (spawnResult.isHiddenBoss && typeof deps.showWorldMemoryNotice === 'function') {
        setTimeout(() => deps.showWorldMemoryNotice('🌟 세계가 기억한다 — 숨겨진 근원이 깨어났다!'), 600);
      }
    }

    // ── 로직: 지역 디버프 ──
    CombatInitializer.applyRegionDebuffs(gs, getBaseRegionIndex);

    // ── 로직: 클래스/런 룰 트리거 ──
    const playerClass = gs.player.class;
    const classMech = classMechanics?.[playerClass];
    if (classMech && typeof classMech.onCombatStart === 'function') {
      classMech.onCombatStart(gs);
    }
    runRules?.onCombatStart?.(gs);
    gs.triggerItems?.(Trigger.COMBAT_START);

    // ── 로직: 덱 초기화 ──
    CombatInitializer.initDeck(gs, {
      shuffleArrayFn: deps.shuffleArray,
      drawCardsFn: deps.api?.drawCards,
    });

    // ═══════════════════════════════════════
    //  UI 업데이트 (아래부터 순수 DOM 조작)
    // ═══════════════════════════════════════
    const doc = _getDoc(deps);

    const zone = doc.getElementById('enemyZone');
    if (zone) zone.innerHTML = '';

    const nodeCardOverlay = doc.getElementById('nodeCardOverlay');
    if (nodeCardOverlay) nodeCardOverlay.style.display = 'none';
    const eventModal = doc.getElementById('eventModal');
    if (eventModal) {
      eventModal.classList.remove('active');
      eventModal.style.display = '';
    }

    if (typeof deps.updateChainUI === 'function') deps.updateChainUI(gs.player.echoChain);

    deps.renderCombatEnemies?.();
    deps.renderCombatCards?.();
    deps.updateCombatLog?.();
    gs.addLog?.('⚔️ 전투 시작!', 'system');
    deps.updateNoiseWidget?.();

    const combatOverlay = doc.getElementById('combatOverlay');
    console.log('[CombatStart] combatOverlay element:', combatOverlay);
    if (combatOverlay) {
      combatOverlay.classList.add('active');
      console.log('[CombatStart] combatOverlay classList:', combatOverlay.classList);
    }

    // 액션 버튼 활성화
    if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.enableActionButtons === 'function') {
      window.HudUpdateUI.enableActionButtons();
    }

    // 드로우 버튼 상태 갱신
    const drawBtn = doc.getElementById('combatDrawCardBtn');
    if (drawBtn) {
      const handFull = gs.player.hand.length >= 8;
      const canDraw = gs.combat.active && gs.combat.playerTurn && gs.player.energy >= 1 && !handFull;
      drawBtn.disabled = !canDraw;
      drawBtn.style.opacity = canDraw ? '1' : '0.4';
      if (handFull) {
        drawBtn.textContent = '🃏 손패 가득 참';
        drawBtn.title = '손패가 가득 찼습니다 (최대 8 장)';
      } else if (gs.player.energy < 1) {
        drawBtn.textContent = '🃏 에너지 부족';
        drawBtn.title = '카드 뽑기에는 에너지 1 이 필요합니다.';
      } else {
        drawBtn.textContent = `🃏 카드 뽑기 (1 에너지)`;
        drawBtn.title = '카드를 한 장 뽑습니다.';
      }
    }

    // Echo 버튼 상태 갱신
    const echoBtn = doc.getElementById('useEchoSkillBtn');
    if (echoBtn) {
      const echoVal = gs.player.echo || 0;
      const tier = echoVal >= 100 ? 3 : echoVal >= 60 ? 2 : echoVal >= 30 ? 1 : 0;

      echoBtn.disabled = tier === 0;
      echoBtn.style.opacity = tier > 0 ? '1' : '0.45';
      if (echoVal >= 30) {
        if (typeof deps.updateEchoSkillBtn === 'function') {
          deps.updateEchoSkillBtn({ ...deps, gs });
        } else if (typeof window.updateEchoSkillBtn === 'function') {
          window.updateEchoSkillBtn();
        }
      } else {
        echoBtn.textContent = `⚡ Echo 스킬 (${echoVal}/30)`;
      }
      console.log('[CombatStart] Echo button initialized - echo:', echoVal, 'disabled:', echoBtn.disabled, 'text:', echoBtn.textContent);
    }

    if (typeof deps.showTurnBanner === 'function') {
      setTimeout(() => deps.showTurnBanner('player'), 300);
    }
    deps.resetCombatInfoPanel?.();
    deps.refreshCombatInfoPanel?.();

    if (typeof window.HudUpdateUI !== 'undefined' && typeof window.HudUpdateUI.doUpdateUI === 'function') {
      window.HudUpdateUI.doUpdateUI(deps);
    } else {
      deps.updateUI?.();
    }
    gs.markDirty?.('hud');
    deps.updateClassSpecialUI?.();

    console.log('[CombatStart] Combat start complete, enemies:', gs.combat.enemies.length);
  },
};
