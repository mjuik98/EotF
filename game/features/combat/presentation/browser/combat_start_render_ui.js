import {
  applyCombatDrawButtonCopy,
  formatEchoSkillButtonText,
  setActionButtonLabel,
} from './hud_render_helpers.js';

export function resetCombatStartDom(doc) {
  const logContainer = doc?.getElementById?.('combatLog');
  if (logContainer) logContainer.textContent = '';

  const zone = doc?.getElementById?.('enemyZone');
  if (zone) zone.innerHTML = '';

  const nodeCardOverlay = doc?.getElementById?.('nodeCardOverlay');
  if (nodeCardOverlay) nodeCardOverlay.style.display = 'none';

  const eventModal = doc?.getElementById?.('eventModal');
  if (eventModal) {
    eventModal.classList.remove('active');
    eventModal.style.display = '';
  }

  const handZone = doc?.getElementById?.('combatHandCards');
  if (handZone) {
    handZone.dataset.locked = 'false';
    handZone.style.pointerEvents = '';
  }
}

export function applyCombatEntryOverlayElement(overlay, flashColor) {
  if (!overlay) return null;
  overlay.style.setProperty('--entry-flash-color', flashColor);
  overlay.classList.add('active');
  return overlay;
}

export function createCombatBossBanner(doc, bossName, isMiniBoss) {
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
  return bossBanner;
}

export function scheduleBossBannerRemoval(banner, delayMs, setTimeoutFn = setTimeout) {
  return setTimeoutFn(() => banner?.remove?.(), delayMs);
}

export function scheduleEnemyEntryAnimations(doc, setTimeoutFn = setTimeout) {
  return setTimeoutFn(() => {
    doc?.querySelectorAll?.('#enemyZone > *').forEach((card, i) => {
      card.style.setProperty('--enter-delay', `${i * 120}ms`);
      card.classList.add('enemy-enter');
      setTimeoutFn(() => {
        card.classList.remove('enemy-enter');
        card.style.removeProperty('--enter-delay');
      }, 800 + i * 120);
    });
  }, 420);
}

export function scheduleHandDealAnimations(doc, setTimeoutFn = setTimeout) {
  return setTimeoutFn(() => {
    doc?.querySelectorAll?.('#combatHandCards .card').forEach((card, i) => {
      card.style.setProperty('--deal-delay', `${i * 65}ms`);
      card.classList.add('card-deal-in');
      setTimeoutFn(() => {
        card.classList.remove('card-deal-in');
        card.style.removeProperty('--deal-delay');
      }, 600 + i * 65);
    });
  }, 480);
}

export function enableCombatActionButtons(doc) {
  const buttons = doc?.querySelectorAll?.('.combat-actions .action-btn') || [];
  buttons.forEach((btn) => {
    btn.disabled = false;
    btn.style.pointerEvents = '';
  });
  return buttons;
}

export function syncCombatDrawButton(drawBtn, drawState) {
  if (!drawBtn) return null;

  drawBtn.disabled = !drawState.canDraw;
  drawBtn.style.opacity = drawState.canDraw ? '1' : '0.4';
  applyCombatDrawButtonCopy(drawBtn, drawState, 'Q');

  return drawBtn;
}

export function syncCombatEchoButton(echoBtn, echoVal, deps = {}, gs = null) {
  if (!echoBtn) return null;

  const tier = echoVal >= 100 ? 3 : echoVal >= 60 ? 2 : echoVal >= 30 ? 1 : 0;
  echoBtn.disabled = tier === 0;
  echoBtn.style.opacity = tier > 0 ? '1' : '0.45';

  if (echoVal >= 30) {
    if (typeof deps.updateEchoSkillBtn === 'function') {
      deps.updateEchoSkillBtn({ ...deps, gs });
    }
  } else {
    setActionButtonLabel(echoBtn, formatEchoSkillButtonText(echoVal), 'E');
  }

  return echoBtn;
}

export function getCombatStartBannerDelay(isBoss, isMiniBoss, defaultDelayMs, bossDurationMs, bossGapMs) {
  return (isBoss || isMiniBoss)
    ? bossDurationMs + bossGapMs
    : defaultDelayMs;
}

export function refreshCombatStartHud(gs, deps = {}, hudUpdateUI = deps.hudUpdateUI || deps.HudUpdateUI || null) {
  deps.resetCombatInfoPanel?.();
  deps.refreshCombatInfoPanel?.();

  if (typeof hudUpdateUI?.doUpdateUI === 'function') {
    hudUpdateUI.doUpdateUI(deps);
  } else {
    deps.updateUI?.();
  }

  gs.markDirty?.('hud');
  deps.updateClassSpecialUI?.();
}
