import {
  createUnifiedParticles,
  detectCardTags,
  getCardRarityDisplayLabel,
  getCardTypeClass,
} from './card_render_helpers_ui.js';
import { DomSafe } from '../../ports/presentation/public_combat_browser_support_capabilities.js';

function addTagChip(doc, parent, className, text) {
  const tag = doc.createElement('span');
  tag.className = className;
  tag.textContent = text;
  parent.appendChild(tag);
}

function addCostBadge(doc, root, card, state, variant) {
  const { anyFree, canPlay, displayCost, totalDisc, energy = 0 } = state;
  const normalizedType = String(card.type || '').toLowerCase();
  const shortfall = Math.max(0, Number(displayCost || 0) - Math.max(0, Number(energy) || 0));
  const classNames = ['card-cost', variant === 'hover' ? 'card-cost-hover' : 'card-cost-hand'];
  if (normalizedType) classNames.push(`card-cost-type-${normalizedType}`);
  if (anyFree && card.cost > 0) classNames.push('card-cost-free');
  else if (totalDisc > 0 && card.cost > 0) classNames.push('card-cost-discounted');
  if (!canPlay) {
    classNames.push('card-cost-disabled');
    classNames.push(shortfall > 0 ? 'card-cost-insufficient-energy' : 'card-cost-unavailable');
  }

  const costEl = doc.createElement('div');
  costEl.className = classNames.join(' ');
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

  root.appendChild(costEl);
}

function addCardTags(doc, root, card, variant) {
  const tags = detectCardTags(card);
  if (!tags.exhaust && !tags.persistent && !tags.instant) return;

  const tagsEl = doc.createElement('div');
  tagsEl.className = variant === 'hover' ? 'card-tags card-tags-hover' : 'card-tags';
  if (tags.exhaust) addTagChip(doc, tagsEl, 'card-tag card-tag-exhaust', '소진');
  if (tags.persistent) addTagChip(doc, tagsEl, 'card-tag card-tag-persistent', '지속');
  if (tags.instant) addTagChip(doc, tagsEl, 'card-tag card-tag-instant', '즉시');
  root.appendChild(tagsEl);
}

export function populateCombatCardFrame(root, doc, model = {}, options = {}) {
  const {
    cardId,
    handIndex = 0,
    card = {},
    canPlay = false,
    displayCost = 0,
    anyFree = false,
    totalDisc = 0,
    energy = 0,
    descriptionUtils = null,
    cardW = 100,
    cardFontScale = '',
  } = model;
  const { variant = 'hand', showHotkey = false } = options;

  const rarity = card.rarity || 'common';
  const typeClass = getCardTypeClass(card.type);
  const rarityLabel = getCardRarityDisplayLabel(rarity);
  const isLegendary = rarity === 'legendary';
  const isRareLike = rarity === 'rare' || rarity === 'legendary';

  if (isLegendary) {
    const border = doc.createElement('div');
    border.className = variant === 'hover'
      ? 'card-legendary-border card-legendary-border-hover'
      : 'card-legendary-border';
    root.appendChild(border);
  }

  if (rarity !== 'common') {
    const strip = doc.createElement('div');
    strip.className = [
      'card-rarity-strip',
      `card-rarity-strip-${rarity}`,
      variant === 'hover' ? 'card-rarity-strip-hover' : '',
    ].filter(Boolean).join(' ');
    root.appendChild(strip);
  }

  const facet = doc.createElement('div');
  facet.className = [
    'card-crystal-facet',
    `card-crystal-facet-${typeClass || 'type-skill'}`,
    variant === 'hover' ? 'card-crystal-facet-hover' : '',
  ].filter(Boolean).join(' ');
  root.appendChild(facet);

  if (showHotkey && handIndex < 5) {
    const hotkey = doc.createElement('div');
    hotkey.className = `card-hotkey ${canPlay ? '' : 'disabled'}`.trim();
    hotkey.textContent = String(handIndex + 1);
    root.appendChild(hotkey);
  }

  const rarityTag = doc.createElement('div');
  rarityTag.className = variant === 'hover' ? 'card-rarity-tag card-rarity-tag-hover' : 'card-rarity-tag';
  rarityTag.textContent = rarityLabel;
  root.appendChild(rarityTag);

  addCostBadge(doc, root, card, {
    anyFree,
    canPlay,
    displayCost,
    totalDisc,
    energy,
  }, variant);

  if (card.upgraded) {
    const upgradeBadge = doc.createElement('div');
    upgradeBadge.className = variant === 'hover'
      ? 'card-upgraded-badge card-upgraded-badge-hover'
      : 'card-upgraded-badge';
    upgradeBadge.textContent = '✦';
    root.appendChild(upgradeBadge);
  }

  const icon = doc.createElement('div');
  icon.className = variant === 'hover' ? 'card-icon card-icon-hover' : 'card-icon';
  if (variant === 'hand') {
    icon.style.fontSize = cardFontScale ? `${Math.round((cardW / 100) * 40)}px` : '40px';
  }
  icon.textContent = card.icon || '';
  root.appendChild(icon);

  const name = doc.createElement('div');
  name.className = variant === 'hover' ? 'card-name card-name-hover' : 'card-name';
  if (variant === 'hand') {
    name.style.fontSize = cardFontScale ? `${Math.round((cardW / 100) * 12)}px` : '14px';
  }
  name.textContent = card.name || cardId || '';
  root.appendChild(name);

  const desc = doc.createElement('div');
  desc.className = variant === 'hover'
    ? 'card-desc card-desc-hover card-desc-hover-readable'
    : variant === 'reward'
      ? 'card-desc card-desc-reward reward-card-desc'
      : variant === 'deck'
        ? 'card-desc card-desc-deck deck-card-desc'
      : 'card-desc';
  if (typeof descriptionUtils?.highlight === 'function') {
    desc.innerHTML = descriptionUtils.highlight(card.desc || '');
  } else {
    DomSafe.setHighlightedText(desc, card.desc || '');
  }
  root.appendChild(desc);

  addCardTags(doc, root, card, variant);

  if (!canPlay && variant === 'hand') {
    const shortfall = Math.max(0, Number(displayCost || 0) - Math.max(0, Number(energy) || 0));
    const overlay = doc.createElement('div');
    overlay.className = 'card-no-energy';
    const label = doc.createElement('span');
    label.className = 'card-no-energy-label';
    label.textContent = shortfall > 0 ? `에너지 ${shortfall} 부족` : '사용 불가';
    overlay.appendChild(label);
    root.appendChild(overlay);
  }

  if (isRareLike) {
    const particleColor = rarity === 'legendary' ? '#c084fc' : '#f0b429';
    if (variant === 'hover') {
      root.appendChild(createUnifiedParticles(doc, particleColor));
      root.appendChild(createUnifiedParticles(doc, particleColor, { isClone: true }));
    } else {
      root.appendChild(createUnifiedParticles(doc, particleColor));
    }
  }

  return root;
}
