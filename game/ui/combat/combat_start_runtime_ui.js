import { resolveDrawAvailability } from './draw_availability.js';
import {
  applyCombatEntryOverlayElement,
  createCombatBossBanner,
  enableCombatActionButtons,
  getCombatStartBannerDelay,
  refreshCombatStartHud,
  resetCombatStartDom,
  scheduleBossBannerRemoval,
  scheduleEnemyEntryAnimations,
  scheduleHandDealAnimations,
  syncCombatDrawButton,
  syncCombatEchoButton,
} from './combat_start_render_ui.js';

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
  resetCombatStartDom(doc);

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
  applyCombatEntryOverlayElement(overlay, flashColor);
}

export function showCombatBossBanner(gs, isMiniBoss, deps = {}) {
  const doc = getDoc(deps);
  const bossName = gs.combat.enemies[0]?.name ?? '보스';
  deps.screenShake?.shake?.(20, 1.2);
  const bossBanner = createCombatBossBanner(doc, bossName, isMiniBoss);
  doc.body.appendChild(bossBanner);
  scheduleBossBannerRemoval(bossBanner, BOSS_NAME_BANNER_DURATION_MS);
}

export function scheduleCombatEntryAnimations(deps = {}) {
  const doc = getDoc(deps);
  scheduleEnemyEntryAnimations(doc);
  scheduleHandDealAnimations(doc);
}

export function syncCombatStartButtons(gs, deps = {}) {
  const doc = getDoc(deps);

  if (typeof globalThis.HudUpdateUI !== 'undefined' && typeof globalThis.HudUpdateUI.enableActionButtons === 'function') {
    globalThis.HudUpdateUI.enableActionButtons();
  }
  enableCombatActionButtons(doc);

  const drawBtn = doc.getElementById('combatDrawCardBtn');
  if (drawBtn) {
    const drawState = resolveDrawAvailability(gs);
    syncCombatDrawButton(drawBtn, drawState);
  }

  const echoBtn = doc.getElementById('useEchoSkillBtn');
  if (echoBtn) {
    const echoVal = gs.player.echo || 0;
    syncCombatEchoButton(echoBtn, echoVal, deps, gs);
  }
}

export function scheduleCombatStartBanner(isBoss, isMiniBoss, deps = {}) {
  if (typeof deps.showTurnBanner !== 'function') return;
  const playerTurnBannerDelay = getCombatStartBannerDelay(
    isBoss,
    isMiniBoss,
    DEFAULT_PLAYER_TURN_BANNER_DELAY_MS,
    BOSS_NAME_BANNER_DURATION_MS,
    PLAYER_TURN_AFTER_BOSS_GAP_MS,
  );
  setTimeout(() => deps.showTurnBanner('player'), playerTurnBannerDelay);
}

export function finalizeCombatStartUi(gs, deps = {}) {
  refreshCombatStartHud(gs, deps);
}

export {
  BOSS_NAME_BANNER_DURATION_MS,
  DEFAULT_PLAYER_TURN_BANNER_DELAY_MS,
  PLAYER_TURN_AFTER_BOSS_GAP_MS,
};
