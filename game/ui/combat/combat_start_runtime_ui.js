import { setActionButtonLabel } from '../hud/hud_render_helpers.js';
import { resolveDrawAvailability } from './draw_availability.js';

const DEFAULT_PLAYER_TURN_BANNER_DELAY_MS = 300;
const BOSS_NAME_BANNER_DURATION_MS = 2200;
const PLAYER_TURN_AFTER_BOSS_GAP_MS = 150;
const REGION_FLASH_COLORS = ['#00cc88', '#4488ff', '#cc44ff', '#ffaa00', '#ff3366'];

function getDoc(deps) {
  return deps?.doc || document;
}

function getOverlay(deps) {
  return deps?.combatOverlay || globalThis.combatOverlay || null;
}

export function resetCombatStartSurface(gs, deps = {}) {
  const doc = getDoc(deps);
  const logContainer = doc.getElementById('combatLog');
  if (logContainer) logContainer.textContent = '';

  const zone = doc.getElementById('enemyZone');
  if (zone) zone.innerHTML = '';

  const nodeCardOverlay = doc.getElementById('nodeCardOverlay');
  if (nodeCardOverlay) nodeCardOverlay.style.display = 'none';

  const eventModal = doc.getElementById('eventModal');
  if (eventModal) {
    eventModal.classList.remove('active');
    eventModal.style.display = '';
  }

  const handZone = doc.getElementById('combatHandCards');
  if (handZone) {
    handZone.dataset.locked = 'false';
    handZone.style.pointerEvents = '';
  }

  if (typeof deps.updateChainUI === 'function') deps.updateChainUI(gs.player.echoChain);
  deps.renderCombatEnemies?.();
  deps.renderCombatCards?.();
  deps.updateCombatLog?.();
  deps.updateNoiseWidget?.();
}

export function applyCombatEntryOverlay(gs, deps = {}) {
  const overlay = getOverlay(deps);
  const getBaseRegionIndex = deps.getBaseRegionIndex || globalThis.getBaseRegionIndex;
  const baseRegionIdx = typeof getBaseRegionIndex === 'function'
    ? getBaseRegionIndex(gs.currentRegion)
    : 0;
  const flashColor = REGION_FLASH_COLORS[baseRegionIdx] ?? '#7b2fff';

  if (overlay) {
    overlay.style.setProperty('--entry-flash-color', flashColor);
    overlay.classList.add('active');
  }
}

export function showCombatBossBanner(gs, isMiniBoss, deps = {}) {
  const doc = getDoc(deps);
  const bossName = gs.combat.enemies[0]?.name ?? '보스';
  deps.screenShake?.shake?.(20, 1.2);

  const bossBanner = doc.createElement('div');
  bossBanner.className = 'boss-encounter-banner';

  const sub = doc.createElement('div');
  sub.className = 'boss-encounter-sub';
  sub.textContent = isMiniBoss ? '⚠️ 중간 보스 출현' : '⚠️ 보스 출현';

  const name = doc.createElement('div');
  name.className = 'boss-encounter-name';
  name.textContent = bossName;

  const line = doc.createElement('div');
  line.className = 'boss-encounter-line';

  bossBanner.append(sub, name, line);
  doc.body.appendChild(bossBanner);
  setTimeout(() => bossBanner.remove(), BOSS_NAME_BANNER_DURATION_MS);
}

export function scheduleCombatEntryAnimations(deps = {}) {
  const doc = getDoc(deps);

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
}

export function syncCombatStartButtons(gs, deps = {}) {
  const doc = getDoc(deps);

  if (typeof globalThis.HudUpdateUI !== 'undefined' && typeof globalThis.HudUpdateUI.enableActionButtons === 'function') {
    globalThis.HudUpdateUI.enableActionButtons();
  }
  doc.querySelectorAll('.combat-actions .action-btn').forEach((btn) => {
    btn.disabled = false;
    btn.style.pointerEvents = '';
  });

  const drawBtn = doc.getElementById('combatDrawCardBtn');
  if (drawBtn) {
    const drawState = resolveDrawAvailability(gs);
    drawBtn.disabled = !drawState.canDraw;
    drawBtn.style.opacity = drawState.canDraw ? '1' : '0.4';

    if (!drawState.inCombat) {
      setActionButtonLabel(drawBtn, '🃏 카드 드로우 (1 에너지)', 'Q');
      drawBtn.title = '전투 중에만 사용할 수 있습니다.';
    } else if (!drawState.playerTurn) {
      setActionButtonLabel(drawBtn, '적 턴', 'Q');
      drawBtn.title = '적 턴에는 카드를 뽑을 수 없습니다.';
    } else if (drawState.handFull) {
      setActionButtonLabel(drawBtn, '손패 가득 참', 'Q');
      drawBtn.title = `손패가 가득 찼습니다 (최대 ${drawState.maxHand}장)`;
    } else if (!drawState.hasEnergy) {
      setActionButtonLabel(drawBtn, '에너지 부족', 'Q');
      drawBtn.title = '카드를 드로우하려면 에너지 1이 필요합니다.';
    } else {
      setActionButtonLabel(drawBtn, '🃏 카드 드로우 (1 에너지)', 'Q');
      drawBtn.title = '카드 1장을 드로우합니다 (에너지 1).';
    }
  }

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
}

export function scheduleCombatStartBanner(isBoss, isMiniBoss, deps = {}) {
  if (typeof deps.showTurnBanner !== 'function') return;
  const playerTurnBannerDelay = (isBoss || isMiniBoss)
    ? BOSS_NAME_BANNER_DURATION_MS + PLAYER_TURN_AFTER_BOSS_GAP_MS
    : DEFAULT_PLAYER_TURN_BANNER_DELAY_MS;
  setTimeout(() => deps.showTurnBanner('player'), playerTurnBannerDelay);
}

export function finalizeCombatStartUi(gs, deps = {}) {
  deps.resetCombatInfoPanel?.();
  deps.refreshCombatInfoPanel?.();

  if (typeof globalThis.HudUpdateUI !== 'undefined' && typeof globalThis.HudUpdateUI.doUpdateUI === 'function') {
    globalThis.HudUpdateUI.doUpdateUI(deps);
  } else {
    deps.updateUI?.();
  }
  gs.markDirty?.('hud');
  deps.updateClassSpecialUI?.();
}

export {
  BOSS_NAME_BANNER_DURATION_MS,
  DEFAULT_PLAYER_TURN_BANNER_DELAY_MS,
  PLAYER_TURN_AFTER_BOSS_GAP_MS,
};
