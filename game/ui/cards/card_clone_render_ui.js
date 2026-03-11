import {
  createUnifiedParticles,
  detectCardTags,
  getCardTypeClass,
  getCardTypeLabelClass,
} from './card_render_helpers_ui.js';

function createCloneParticles(doc, color) {
  return createUnifiedParticles(doc, color, { isClone: true });
}

export function createHandCardCloneElement(doc, cardId, card, costDisplay) {
  const rarity = card.rarity || 'common';
  const isLegendary = rarity === 'legendary';
  const isRare = rarity === 'rare';
  const typeClass = getCardTypeClass(card.type);
  const typeLabelClass = getCardTypeLabelClass(card.type);
  const tags = detectCardTags(card);
  const { displayCost, anyFree, totalDisc } = costDisplay;

  const clone = doc.createElement('div');
  clone.className = [
    'card-clone',
    `clone-rarity-${rarity}`,
    card.upgraded ? 'clone-upgraded' : '',
  ].filter(Boolean).join(' ');

  if (isLegendary) {
    const border = doc.createElement('div');
    border.className = 'card-clone-legendary-border';
    clone.appendChild(border);
  }

  if (rarity !== 'common') {
    const strip = doc.createElement('div');
    strip.className = `card-clone-rarity-strip card-clone-rarity-strip-${rarity}`;
    clone.appendChild(strip);
  }

  const facet = doc.createElement('div');
  facet.className = `card-clone-crystal-facet card-clone-crystal-facet-${typeClass || 'type-skill'}`;
  clone.appendChild(facet);

  const costEl = doc.createElement('div');
  costEl.className = 'card-clone-cost';
  if (anyFree && card.cost > 0) {
    costEl.classList.add('card-clone-cost-free');
  } else if (totalDisc > 0 && card.cost > 0) {
    costEl.classList.add('card-clone-cost-discounted');
  }
  costEl.textContent = displayCost;
  if (card.cost > 0) {
    if (anyFree) {
      const freeBadge = doc.createElement('span');
      freeBadge.className = 'card-clone-cost-sub';
      freeBadge.textContent = 'FREE';
      costEl.appendChild(freeBadge);
    } else if (totalDisc > 0) {
      const discountBadge = doc.createElement('span');
      discountBadge.className = 'card-clone-cost-sub';
      discountBadge.textContent = `-${Math.min(totalDisc, card.cost)}`;
      costEl.appendChild(discountBadge);
    }
  }
  clone.appendChild(costEl);

  if (card.upgraded) {
    const upgradeBadge = doc.createElement('div');
    upgradeBadge.className = 'card-clone-upgraded-badge';
    upgradeBadge.textContent = '✦';
    clone.appendChild(upgradeBadge);
  }

  const icon = doc.createElement('div');
  icon.className = 'card-clone-icon';
  icon.textContent = card.icon || '';
  clone.appendChild(icon);

  const name = doc.createElement('div');
  name.className = 'card-clone-name';
  name.textContent = card.name || cardId || '';
  clone.appendChild(name);

  const divider = doc.createElement('div');
  divider.className = 'card-clone-divider';
  clone.appendChild(divider);

  const desc = doc.createElement('div');
  desc.className = 'card-clone-desc';
  const descriptionUtils = doc?.descriptionUtils || null;
  if (typeof descriptionUtils?.highlight === 'function') {
    desc.innerHTML = descriptionUtils.highlight(card.desc);
  } else {
    desc.textContent = card.desc || '';
  }
  clone.appendChild(desc);

  if (tags.exhaust || tags.persistent || tags.instant) {
    const tagsEl = doc.createElement('div');
    tagsEl.className = 'card-clone-tags';
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
    clone.appendChild(tagsEl);
  }

  const type = doc.createElement('div');
  type.className = `card-clone-type ${typeLabelClass}`.trim();
  type.textContent = card.type || '';
  clone.appendChild(type);

  if (isLegendary || isRare) {
    const particleColor = isLegendary ? '#c084fc' : '#f0b429';
    clone.appendChild(createCloneParticles(doc, particleColor));
  }

  const arrow = doc.createElement('div');
  arrow.className = 'card-clone-arrow';
  clone.appendChild(arrow);

  return clone;
}
