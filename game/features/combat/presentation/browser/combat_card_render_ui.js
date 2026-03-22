import { HAND_CARD_RARITY_BORDER_COLORS } from '../../../../../data/ui_rarity_styles.js';
import { getCardTypeClass } from './card_render_helpers_ui.js';
import { populateCombatCardFrame } from './combat_card_frame_ui.js';

export function createCombatCardElement(doc, model = {}) {
  const {
    cardId,
    handIndex = 0,
    card = {},
    canPlay = false,
    displayCost = 0,
    anyFree = false,
    totalDisc = 0,
    energy = 0,
    cardW = 100,
    cardH = 146,
    cardFontScale = '',
  } = model;

  const rarity = card.rarity || 'common';
  const rarityBorderColor = HAND_CARD_RARITY_BORDER_COLORS[rarity] || '';
  const typeClass = getCardTypeClass(card.type);

  const el = doc.createElement('div');
  el.className = [
    'card',
    canPlay ? 'playable' : '',
    typeClass,
    `rarity-${rarity}`,
    card.upgraded ? 'card-upgraded' : '',
  ].filter(Boolean).join(' ');

  let inlineStyle = `width:${cardW}px;height:${cardH}px;${cardFontScale}animation-delay:${handIndex * 0.05}s;`;
  if (rarityBorderColor) inlineStyle += `border-color:${rarityBorderColor};`;
  el.style.cssText = inlineStyle;
  el.draggable = true;
  el.dataset.cardId = cardId;
  el.dataset.handIdx = String(handIndex);

  populateCombatCardFrame(el, doc, {
    cardId,
    handIndex,
    card,
    canPlay,
    displayCost,
    anyFree,
    totalDisc,
    energy,
    cardW,
    cardFontScale,
    descriptionUtils: model.descriptionUtils || null,
  }, {
    variant: 'hand',
    showHotkey: true,
  });

  return el;
}

export function applyHandFanStyles(cards = []) {
  const n = cards.length;
  if (n === 0) return;

  const mid = (n - 1) / 2;
  const spread = Math.min(16, Math.max(6, n * 2));
  cards.forEach((card, i) => {
    const ratio = mid === 0 ? 0 : (i - mid) / mid;
    const rot = ratio * spread;
    const lift = -Math.abs(ratio) * 5;
    card.style.setProperty('--fan-rot', `${rot}deg`);
    card.style.setProperty('--fan-lift', `${lift}px`);
  });
}
