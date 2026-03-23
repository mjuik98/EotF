import { getDoc, getRaf } from '../../../../utils/runtime_deps.js';
import { setDatasetBooleanState } from '../../../../shared/ui/state/ui_state_dataset.js';

export function triggerDeckShufflePulseUI(deps = {}) {
  const doc = getDoc(deps);
  const deckEls = doc.querySelectorAll('#deckCount, #combatDeckCount');
  deckEls.forEach((el) => {
    el.style.transition = 'color 0.15s, text-shadow 0.15s';
    el.style.color = 'var(--cyan)';
    el.style.textShadow = '0 0 10px rgba(0,255,204,0.8)';
    setTimeout(() => {
      el.style.color = '';
      el.style.textShadow = '';
    }, 600);
  });
}

export function enableActionButtonsUI(deps = {}) {
  const doc = getDoc(deps);
  doc.querySelectorAll('.combat-actions .action-btn').forEach((button) => {
    button.disabled = false;
  });
}

export function triggerDrawCardAnimationUI(deps = {}) {
  const doc = getDoc(deps);
  doc.querySelectorAll('#handCards .card, #combatHandCards .card').forEach((el, i) => {
    el.style.animation = 'none';
    const raf = getRaf(deps);
    if (typeof raf === 'function') {
      raf(() => {
        el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`;
      });
    } else {
      el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`;
    }
  });
}

export function triggerCardShakeAnimationUI(deps = {}) {
  const doc = getDoc(deps);
  doc.querySelectorAll('#combatHandCards .card:not(.playable)').forEach((el) => {
    el.style.animation = 'none';
    const raf = getRaf(deps);
    if (typeof raf === 'function') {
      raf(() => {
        el.style.animation = 'shake 0.3s ease';
      });
    } else {
      el.style.animation = 'shake 0.3s ease';
    }
  });
}

export function resetCombatUIUI(deps = {}) {
  const doc = getDoc(deps);
  doc.getElementById('combatOverlay')?.classList.remove('active');

  const resetPanel = deps?.resetCombatInfoPanel || deps?._resetCombatInfoPanel;
  if (typeof resetPanel === 'function') {
    resetPanel();
  }

  doc.getElementById('noiseGaugeOverlay')?.remove();
  doc.getElementById('cardTooltip')?.classList.remove('visible');

  const combatHandCards = doc.getElementById('combatHandCards');
  if (combatHandCards) combatHandCards.textContent = '';

  const endZone = doc.getElementById('enemyZone');
  if (endZone) endZone.textContent = '';

  const logContainer = doc.getElementById('combatLog');
  if (logContainer) logContainer.innerHTML = '';
  const recentCombatFeed = doc.getElementById('recentCombatFeed');
  if (recentCombatFeed) recentCombatFeed.innerHTML = '';

  const combatRelicPanel = doc.getElementById('combatRelicPanel');
  setDatasetBooleanState(combatRelicPanel, 'open', false);

  const combatRelicRailSlots = doc.getElementById('combatRelicRailSlots');
  if (combatRelicRailSlots) combatRelicRailSlots.innerHTML = '';

  const combatRelicPanelList = doc.getElementById('combatRelicPanelList');
  if (combatRelicPanelList) combatRelicPanelList.innerHTML = '';
}

export function hideNodeOverlayUI(deps = {}) {
  const doc = getDoc(deps);
  const nodeOverlay = doc.getElementById('nodeCardOverlay');
  if (nodeOverlay) nodeOverlay.style.display = 'none';
}
