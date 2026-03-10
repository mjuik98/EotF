import { EventManager } from '../../systems/event_manager.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';
import { dismissEventModal } from './event_ui_helpers.js';
import { renderChoices } from './event_ui_dom.js';

export function finishEventFlow(doc, gs, deps = {}, clearCurrentEvent = () => {}) {
  dismissEventModal(doc.getElementById('eventModal'), () => {
    clearCurrentEvent();
    gs._eventLock = false;
    if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
    if (typeof deps.updateUI === 'function') deps.updateUI();
    if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
    if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
  });
}

function showAcquiredCardToast(acquiredCard, sharedData, showItemToast) {
  if (!acquiredCard || typeof showItemToast !== 'function') return;
  const cardData = sharedData.cards?.[acquiredCard];
  if (!cardData) return;
  showItemToast(cardData, {
    typeLabel: `${RARITY_LABELS[cardData.rarity] || cardData.rarity} card acquired`,
  });
}

function showAcquiredItemToast(acquiredItem, sharedData, showItemToast) {
  if (!acquiredItem || typeof showItemToast !== 'function') return;
  const itemData = sharedData.items?.[acquiredItem];
  if (itemData) showItemToast(itemData);
}

function isUpgradeChoice(choice) {
  const choiceText = String(choice?.text || '');
  const choiceClass = String(choice?.cssClass || '');
  return choiceClass.includes('shop-choice-upgrade')
    || /\uCE74\uB4DC\s*\uAC15\uD654|\uAC15\uD654/.test(choiceText);
}

function showUpgradeToast(resultText, showItemToast) {
  if (typeof showItemToast !== 'function') return;
  const upgradedName = String(resultText || '').match(/(?:\u2728\s*)?(.+?)\s+\uAC15\uD654\s*\uC644\uB8CC/i)?.[1]?.trim()
    || 'Upgraded Card';
  showItemToast({
    name: `Upgrade: ${upgradedName}`,
    icon: '\u2728',
    desc: resultText,
  });
}

export function renderEventContinueChoice(doc, onContinue) {
  const choicesEl = doc.getElementById('eventChoices');
  if (!choicesEl) return false;

  choicesEl.textContent = '';
  const continueBtn = doc.createElement('div');
  continueBtn.className = 'event-choice';
  continueBtn.id = 'eventChoiceContinue';
  continueBtn.textContent = '\uACC4\uC18D';
  continueBtn.addEventListener('click', onContinue, { once: true });
  choicesEl.appendChild(continueBtn);
  return true;
}

export function resolveEventChoiceFlow(choiceIdx, {
  gs,
  event,
  doc,
  audioEngine,
  deps = {},
  sharedData = globalThis.DATA || {},
  resolveChoice = EventManager.resolveEventChoice,
  onResolveChoice,
  onFinish,
  onRefreshGoldBar,
} = {}) {
  if (!gs || !event || !doc) return null;

  gs._eventLock = true;

  let resolution = null;
  try {
    resolution = resolveChoice(gs, event, choiceIdx);
  } catch (err) {
    console.error('[resolveEvent] choice effect error:', err);
    gs._eventLock = false;
    audioEngine?.playHit?.();
    return null;
  }

  const selectedChoice = event?.choices?.[choiceIdx];
  const { resultText, isFail, shouldClose, isItemShop, acquiredCard, acquiredItem } = resolution || {};

  if (typeof deps.updateUI === 'function') deps.updateUI();
  onRefreshGoldBar?.();

  showAcquiredCardToast(acquiredCard, sharedData, deps.showItemToast);
  showAcquiredItemToast(acquiredItem, sharedData, deps.showItemToast);

  if (isItemShop) {
    gs._eventLock = false;
    return resolution;
  }

  if (!resultText) {
    onFinish?.();
    return resolution;
  }

  const descEl = doc.getElementById('eventDesc');
  if (descEl) descEl.textContent = resultText;

  if (!isFail && isUpgradeChoice(selectedChoice)) {
    showUpgradeToast(resultText, deps.showItemToast);
  }

  if (event.persistent || isFail) {
    renderChoices(event, doc, gs, onResolveChoice);
    onRefreshGoldBar?.();
    gs._eventLock = false;
    return resolution;
  }

  if (!shouldClose) {
    gs._eventLock = false;
    return resolution;
  }

  renderEventContinueChoice(doc, () => onFinish?.());
  return resolution;
}
