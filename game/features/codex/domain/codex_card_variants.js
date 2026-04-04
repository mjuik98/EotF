import { UPGRADE_MAP } from '../../../shared/cards/card_data.js';

const CARD_BASE_BY_VARIANT = Object.freeze(Object.entries(UPGRADE_MAP).reduce((acc, [baseId, upgradedId]) => {
  acc[String(upgradedId)] = String(baseId);
  return acc;
}, {}));

export function resolveCodexCardId(cardId) {
  const key = String(cardId || '');
  if (!key) return '';
  return CARD_BASE_BY_VARIANT[key] || key;
}

export function getCardUpgradeId(cardId) {
  const baseId = resolveCodexCardId(cardId);
  return UPGRADE_MAP[baseId] || '';
}

export function isCardUpgradeVariant(cardId) {
  return Object.prototype.hasOwnProperty.call(CARD_BASE_BY_VARIANT, String(cardId || ''));
}
