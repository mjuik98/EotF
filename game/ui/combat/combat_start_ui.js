/**
 * combat_start_ui.js ???꾪닾 ?쒖옉 UI (?쒖닔 View)
 *
 * CombatInitializer?먯꽌 濡쒖쭅??泥섎━?섍퀬, ???뚯씪? DOM ?낅뜲?댄듃留??대떦?⑸땲??
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
    const getRegionData = deps.getRegionData || globalThis.getRegionData;
    const getBaseRegionIndex = deps.getBaseRegionIndex || globalThis.getBaseRegionIndex;
    const getRegionCount = deps.getRegionCount || globalThis.getRegionCount;
    const difficultyScaler = deps.difficultyScaler || globalThis.DifficultyScaler;
    const audioEngine = deps.audioEngine;
    const runRules = deps.runRules;
    const classMechanics = deps.classMechanics || globalThis.ClassMechanics;

    if (!gs || !data?.enemies || typeof getRegionData !== 'function') {
      console.error('[CombatStart] Missing dependencies:', { gs: !!gs, data: !!data, getRegionData: typeof getRegionData });
      return;
    }

    const doc = _getDoc(deps);

    // ?? 濡쒖쭅: ?곹깭 由ъ뀑 ??
    CombatInitializer.resetCombatState(gs);
    const logContainer = doc.getElementById('combatLog');
    if (logContainer) logContainer.textContent = '';

    // UI: 전투 시작 로그
    gs.addLog?.('⚔️ 전투 시작!', 'system');
    gs.addLog?.(`── 턴 ${gs.combat.turn} ──`, 'turn-divider');

    // ?? 濡쒖쭅: ???ㅽ룿 ??
    const spawnResult = CombatInitializer.spawnEnemies(gs, data, isBoss, {
      getRegionData,
      getBaseRegionIndex,
      getRegionCount,
      difficultyScaler,
    });

    // UI: boss entry effects
    if (isBoss) {
      audioEngine?.playBossPhase?.();
      if (spawnResult.isHiddenBoss && typeof deps.showWorldMemoryNotice === 'function') {
        setTimeout(() => deps.showWorldMemoryNotice('⚠️ 봉인된 심연이 깨어난다! 근원의 잔향이 모습을 드러낸다!'), 600);
      }
    }

    // ?? 濡쒖쭅: 吏???붾쾭????
    CombatInitializer.applyRegionDebuffs(gs, getBaseRegionIndex);

    // ?? 濡쒖쭅: ?대옒????猷?珥덇린????
    const playerClass = gs.player.class;
    const classMech = globalThis.ClassMechanics?.[playerClass];
    if (classMech && typeof classMech.onCombatStart === 'function') {
      classMech.onCombatStart(gs);
    }
    // gs.triggerItems?.('combat_start'); // 以묐났 ?쒓굅
    gs.triggerItems?.(Trigger.COMBAT_START);

    // ?? 濡쒖쭅: ??珥덇린????
    CombatInitializer.initDeck(gs, {
      shuffleArrayFn: deps.shuffleArray,
      drawCardsFn: deps.api?.drawCards,
    });

    // UI updates
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
    deps.updateNoiseWidget?.();

    const combatOverlay = doc.getElementById('combatOverlay');
    console.log('[CombatStart] combatOverlay element:', combatOverlay);
    if (combatOverlay) {
      combatOverlay.classList.add('active');
      console.log('[CombatStart] combatOverlay classList:', combatOverlay.classList);
    }

    // 손패 클릭 잠금 상태가 남아있는 경우 초기화
    const handZone = doc.getElementById('combatHandCards');
    if (handZone) {
      handZone.dataset.locked = 'false';
      handZone.style.pointerEvents = '';
    }

    // Enable action buttons
    if (typeof globalThis.HudUpdateUI !== 'undefined' && typeof globalThis.HudUpdateUI.enableActionButtons === 'function') {
      globalThis.HudUpdateUI.enableActionButtons();
    }
    doc.querySelectorAll('.combat-actions .action-btn').forEach((btn) => {
      btn.disabled = false;
      btn.style.pointerEvents = '';
    });

    // ?쒕줈??踰꾪듉 ?곹깭 媛깆떊
    const drawBtn = doc.getElementById('combatDrawCardBtn');
    if (drawBtn) {
      const handFull = gs.player.hand.length >= 8;
      const canDraw = gs.combat.active && gs.combat.playerTurn && gs.player.energy >= 1 && !handFull;
      drawBtn.disabled = !canDraw;
      drawBtn.style.opacity = canDraw ? '1' : '0.4';
      if (handFull) {
        drawBtn.textContent = '손패 가득 참';
        drawBtn.title = '손패가 가득 찼습니다 (최대 8장)';
      } else if (gs.player.energy < 1) {
        drawBtn.textContent = '에너지 부족';
        drawBtn.title = '카드 드로우에는 에너지 1이 필요합니다.';
      } else {
        drawBtn.textContent = '🃏 카드 드로우';
        drawBtn.title = '카드 1장을 뽑습니다 (에너지 1).';
      }
    }

    // Echo 踰꾪듉 ?곹깭 媛깆떊
    const echoBtn = doc.getElementById('useEchoSkillBtn');
    if (echoBtn) {
      const echoVal = gs.player.echo || 0;
      const tier = echoVal >= 100 ? 3 : echoVal >= 60 ? 2 : echoVal >= 30 ? 1 : 0;

      echoBtn.disabled = tier === 0;
      echoBtn.style.opacity = tier > 0 ? '1' : '0.45';
      if (echoVal >= 30) {
        if (typeof deps.updateEchoSkillBtn === 'function') {
          deps.updateEchoSkillBtn({ ...deps, gs });
        } else if (typeof globalThis.updateEchoSkillBtn === 'function') {
          globalThis.updateEchoSkillBtn();
        }
      } else {
        echoBtn.textContent = `⚡ 잔향 스킬 (${echoVal}/30)`;
      }
      console.log('[CombatStart] Echo button initialized - echo:', echoVal, 'disabled:', echoBtn.disabled, 'text:', echoBtn.textContent);
    }

    if (typeof deps.showTurnBanner === 'function') {
      setTimeout(() => deps.showTurnBanner('player'), 300);
    }
    deps.resetCombatInfoPanel?.();
    deps.refreshCombatInfoPanel?.();

    if (typeof globalThis.HudUpdateUI !== 'undefined' && typeof globalThis.HudUpdateUI.doUpdateUI === 'function') {
      globalThis.HudUpdateUI.doUpdateUI(deps);
    } else {
      deps.updateUI?.();
    }
    gs.markDirty?.('hud');
    deps.updateClassSpecialUI?.();

    console.log('[CombatStart] Combat start complete, enemies:', gs.combat.enemies.length);
  },
};
