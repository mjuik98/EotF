import { RARITY_LABELS } from '../ports/event_view_model_ports.js';

function isUpgradeChoice(choice) {
  const choiceText = String(choice?.text || '');
  const choiceClass = String(choice?.cssClass || '');
  return choiceClass.includes('shop-choice-upgrade')
    || /\uCE74\uB4DC\s*\uAC15\uD654|\uAC15\uD654/.test(choiceText);
}

function buildAcquiredCardToast(acquiredCard, sharedData) {
  if (!acquiredCard) return null;
  const cardData = sharedData.cards?.[acquiredCard];
  if (!cardData) return null;
  return {
    payload: cardData,
    options: {
      typeLabel: `${RARITY_LABELS[cardData.rarity] || cardData.rarity} card acquired`,
    },
  };
}

function buildAcquiredItemToast(acquiredItem, sharedData) {
  if (!acquiredItem) return null;
  const itemData = sharedData.items?.[acquiredItem];
  if (!itemData) return null;
  return {
    payload: itemData,
    options: undefined,
  };
}

function buildUpgradeToast(resultText, selectedChoice) {
  if (!resultText || !isUpgradeChoice(selectedChoice)) return null;
  const upgradedName = String(resultText).match(/(?:\u2728\s*)?(.+?)\s+\uAC15\uD654\s*\uC644\uB8CC/i)?.[1]?.trim()
    || 'Upgraded Card';
  return {
    payload: {
      name: `Upgrade: ${upgradedName}`,
      icon: '\u2728',
      desc: resultText,
    },
    options: undefined,
  };
}

export function buildEventViewModel({
  event,
  resolution,
  selectedChoice,
  sharedData = {},
} = {}) {
  const {
    resultText,
    isFail,
    shouldClose,
    isItemShop,
    acquiredCard,
    acquiredItem,
  } = resolution || {};

  return {
    acquiredCardToast: buildAcquiredCardToast(acquiredCard, sharedData),
    acquiredItemToast: buildAcquiredItemToast(acquiredItem, sharedData),
    continueChoice: !!resultText && !event?.persistent && !isFail && !!shouldClose,
    finishImmediately: !resultText,
    isItemShop: isItemShop === true,
    releaseLock: isItemShop === true || event?.persistent || isFail || !shouldClose,
    rerenderChoices: !!(event?.persistent || isFail),
    resultText: resultText || null,
    upgradeToast: !isFail ? buildUpgradeToast(resultText, selectedChoice) : null,
  };
}
