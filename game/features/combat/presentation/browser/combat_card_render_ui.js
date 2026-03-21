import { HAND_CARD_RARITY_BORDER_COLORS } from '../../../../../data/ui_rarity_styles.js';
import {
  createUnifiedParticles,
  detectCardTags,
  getCardTypeClass,
  getCardTypeDisplayLabel,
  getCardTypeLabelClass,
} from './card_render_helpers_ui.js';

export function createCombatCardElement(doc, model = {}) {
  const {
    cardId,
    handIndex = 0,
    card = {},
    canPlay = false,
    displayCost = 0,
    anyFree = false,
    totalDisc = 0,
    cardW = 100,
    cardH = 146,
    cardFontScale = '',
  } = model;

  const rarity = card.rarity || 'common';
  const isLegendary = rarity === 'legendary';
  const isRare = rarity === 'rare';
  const rarityBorderColor = HAND_CARD_RARITY_BORDER_COLORS[rarity] || '';
  const typeClass = getCardTypeClass(card.type);
  const typeLabelClass = getCardTypeLabelClass(card.type);
  const tags = detectCardTags(card);

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

  if (isLegendary) {
    const border = doc.createElement('div');
    border.className = 'card-legendary-border';
    el.appendChild(border);
  }

  if (rarity !== 'common') {
    const strip = doc.createElement('div');
    strip.className = `card-rarity-strip card-rarity-strip-${rarity}`;
    el.appendChild(strip);
  }

  const facet = doc.createElement('div');
  facet.className = `card-crystal-facet card-crystal-facet-${typeClass || 'type-skill'}`;
  el.appendChild(facet);

  if (handIndex < 5) {
    const hotkey = doc.createElement('div');
    hotkey.className = `card-hotkey ${canPlay ? '' : 'disabled'}`.trim();
    hotkey.textContent = String(handIndex + 1);
    el.appendChild(hotkey);
  }

  const costEl = doc.createElement('div');
  costEl.className = 'card-cost';
  if (!canPlay) {
    costEl.style.cssText = 'background:rgba(60,60,60,0.4);border-color:rgba(120,120,120,0.3);color:rgba(180,180,180,0.5);';
  } else if (anyFree && card.cost > 0) {
    costEl.className += ' card-cost-free';
  } else if (totalDisc > 0 && card.cost > 0) {
    costEl.className += ' card-cost-discounted';
  }
  costEl.textContent = displayCost;
  if (card.cost > 0) {
    if (anyFree) {
      const freeBadge = doc.createElement('span');
      freeBadge.className = 'card-cost-sub';
      freeBadge.textContent = '무료';
      costEl.appendChild(freeBadge);
    } else if (totalDisc > 0) {
      const discountBadge = doc.createElement('span');
      discountBadge.className = 'card-cost-sub';
      discountBadge.textContent = `-${Math.min(totalDisc, card.cost)}`;
      costEl.appendChild(discountBadge);
    }
  }
  el.appendChild(costEl);

  if (card.upgraded) {
    const upgradeBadge = doc.createElement('div');
    upgradeBadge.className = 'card-upgraded-badge';
    upgradeBadge.textContent = '✦';
    el.appendChild(upgradeBadge);
  }

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = cardFontScale ? `${Math.round((cardW / 100) * 40)}px` : '40px';
  icon.textContent = card.icon || '';
  el.appendChild(icon);

  const name = doc.createElement('div');
  name.className = 'card-name';
  name.style.fontSize = cardFontScale ? `${Math.round((cardW / 100) * 12)}px` : '14px';
  name.textContent = card.name || cardId || '';
  el.appendChild(name);

  if (tags.exhaust || tags.persistent || tags.instant) {
    const tagsEl = doc.createElement('div');
    tagsEl.className = 'card-tags';
    if (tags.exhaust) {
      const tag = doc.createElement('span');
      tag.className = 'card-tag card-tag-exhaust';
      tag.textContent = '소진';
      tagsEl.appendChild(tag);
    }
    if (tags.persistent) {
      const tag = doc.createElement('span');
      tag.className = 'card-tag card-tag-persistent';
      tag.textContent = '지속';
      tagsEl.appendChild(tag);
    }
    if (tags.instant) {
      const tag = doc.createElement('span');
      tag.className = 'card-tag card-tag-instant';
      tag.textContent = '즉시';
      tagsEl.appendChild(tag);
    }
    el.appendChild(tagsEl);
  }

  const type = doc.createElement('div');
  type.className = `card-type ${typeLabelClass}`.trim();
  type.textContent = getCardTypeDisplayLabel(card.type);
  el.appendChild(type);

  if (!canPlay) {
    const overlay = doc.createElement('div');
    overlay.className = 'card-no-energy';
    const label = doc.createElement('span');
    label.className = 'card-no-energy-label';
    label.textContent = '에너지 부족';
    overlay.appendChild(label);
    el.appendChild(overlay);
  }

  if (isLegendary || isRare) {
    const particleColor = isLegendary ? '#c084fc' : '#f0b429';
    el.appendChild(createUnifiedParticles(doc, particleColor));
  }

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
