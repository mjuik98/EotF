/**
 * combat_start_ui.js ???꾪닾 ?쒖옉 UI (?쒖닔 View)
 *
 * CombatInitializer?먯꽌 濡쒖쭅??泥섎━?섍퀬, ???뚯씪? DOM ?낅뜲?댄듃留??대떦?⑸땲??
 */
import { Trigger } from '../../data/triggers.js';
import { CombatInitializer } from '../../combat/combat_initializer.js';
import { setActionButtonLabel } from '../hud/hud_render_helpers.js';


function _getDoc(deps) {
  return deps?.doc || document;
}

export const CombatStartUI = {
  startCombat(mode = 'normal', deps = {}) {
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
      console.error('[CombatStart] Missing dependencies');
      return;
    }

    const combatMode = mode === true
      ? 'boss'
      : (mode === false ? 'normal' : (typeof mode === 'string' ? mode : 'normal'));
    const isBoss = combatMode === 'boss';
    const isMiniBoss = combatMode === 'mini_boss';

    const doc = _getDoc(deps);
    const region = getRegionData(gs.currentRegion, gs);
    gs._activeRegionId = Number.isFinite(Number(region?.id)) ? Number(region.id) : null;

    // ?? 濡쒖쭅: ?곹깭 由ъ뀑 ??
    CombatInitializer.resetCombatState(gs);
    gs.combat.active = true;
    const logContainer = doc.getElementById('combatLog');
    if (logContainer) logContainer.textContent = '';

    // UI: 전투 시작 로그
    gs.addLog?.('⚔️ 전투 시작!', 'system');
    gs.addLog?.(`── 턴 ${gs.combat.turn} ──`, 'turn-divider');

    // ?? 濡쒖쭅: ???ㅽ룿 ??
    const spawnResult = CombatInitializer.spawnEnemies(gs, data, combatMode, {
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
    } else if (isMiniBoss) {
      audioEngine?.playBossPhase?.();
    }

    // ?? 濡쒖쭅: 吏???붾쾭????
    CombatInitializer.applyRegionDebuffs(gs, getBaseRegionIndex);

    // ?? 濡쒖쭅: ?대옒????猷?珥덇린????
    const playerClass = gs.player.class;
    const classMech = classMechanics?.[playerClass];
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

    const bladeOverlay = doc.getElementById('bladeSplitOverlay');
    const combatOverlay = doc.getElementById('combatOverlay');

    // 지역별 진입 플래시 색상 매핑
    const REGION_FLASH_COLORS = ['#00cc88', '#4488ff', '#cc44ff', '#ffaa00', '#ff3366'];
    const baseRegionIdx = typeof getBaseRegionIndex === 'function'
      ? getBaseRegionIndex(gs.currentRegion)
      : 0;
    const flashColor = REGION_FLASH_COLORS[baseRegionIdx] ?? '#7b2fff';

    if (combatOverlay) {
      combatOverlay.style.setProperty('--entry-flash-color', flashColor);
    }
    if (bladeOverlay) {
      const bladeSlash = bladeOverlay.querySelector('.blade-slash');
      if (bladeSlash) bladeSlash.style.background = flashColor;
      const bladeParts = bladeOverlay.querySelectorAll('.blade-part');
      bladeParts.forEach((part) => {
        part.style.boxShadow = `0 0 50px ${flashColor}55`;
      });
    }

    if (isBoss || isMiniBoss) {
      const bossName = gs.combat.enemies[0]?.name ?? 'BOSS';
      deps.screenShake?.shake?.(20, 1.2);

      const bossBanner = doc.createElement('div');
      bossBanner.className = 'boss-encounter-banner';

      const sub = doc.createElement('div');
      sub.className = 'boss-encounter-sub';
      sub.textContent = isMiniBoss ? 'MINI BOSS' : 'BOSS ENCOUNTER';

      const name = doc.createElement('div');
      name.className = 'boss-encounter-name';
      name.textContent = bossName;

      const line = doc.createElement('div');
      line.className = 'boss-encounter-line';

      bossBanner.append(sub, name, line);
      doc.body.appendChild(bossBanner);
      setTimeout(() => bossBanner.remove(), 2200);
    }

    if (bladeOverlay && combatOverlay) {
      bladeOverlay.classList.add('active');
      setTimeout(() => {
        combatOverlay.classList.add('active');
      }, 350);
      setTimeout(() => {
        bladeOverlay.classList.remove('active');
      }, 1200);
    } else if (combatOverlay) {
      combatOverlay.classList.add('active');
    }

    setTimeout(() => {
      doc.querySelectorAll('#enemyZone > *').forEach((card, i) => {
        card.style.setProperty('--enter-delay', `${i * 120}ms`);
        card.classList.add('enemy-enter');
        setTimeout(() => {
          card.classList.remove('enemy-enter');
          card.style.removeProperty('--enter-delay');
        }, 800 + i * 120);
      });
    }, 420);

    setTimeout(() => {
      doc.querySelectorAll('#combatHandCards .card').forEach((card, i) => {
        card.style.setProperty('--deal-delay', `${i * 65}ms`);
        card.classList.add('card-deal-in');
        setTimeout(() => {
          card.classList.remove('card-deal-in');
          card.style.removeProperty('--deal-delay');
        }, 600 + i * 65);
      });
    }, 480);

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
      const playerState = gs.player;
      const combatState = gs.combat;
      const hand = Array.isArray(playerState.hand) ? playerState.hand : [];
      const handFull = hand.length >= 8;
      const canDraw = combatState.active && combatState.playerTurn && playerState.energy >= 1 && !handFull;
      drawBtn.disabled = !canDraw;
      drawBtn.style.opacity = canDraw ? '1' : '0.4';
      if (handFull) {
        setActionButtonLabel(drawBtn, '손패 가득 참', 'Q');
        drawBtn.title = '손패가 가득 찼습니다 (최대 8장)';
      } else if (playerState.energy < 1) {
        setActionButtonLabel(drawBtn, '에너지 부족', 'Q');
        drawBtn.title = '카드를 뽑으려면 에너지 1이 필요합니다.';
      } else {
        setActionButtonLabel(drawBtn, '🃏 카드 뽑기 (1 에너지)', 'Q');
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
        setActionButtonLabel(echoBtn, `⚡ 잔향 스킬 (${echoVal}/30)`, 'E');
      }
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

  },
};
