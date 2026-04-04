export function buildPlayStyleMarkup(lines = []) {
  const resolvedLines = Array.isArray(lines) ? lines.filter(Boolean) : [];
  if (resolvedLines.length === 0) {
    return '<div class="char-info-text">운영 감각 정보 없음</div>';
  }

  return `<div class="char-playstyle-list">${resolvedLines
    .slice(0, 3)
    .map((line) => `<div class="char-playstyle-item">${line}</div>`)
    .join('')}</div>`;
}

export function inferFeaturedCardTag(card = {}) {
  const desc = String(card?.desc || '');
  if (card?.type === 'POWER') return '지속';
  if (desc.includes('드로우')) return '순환';
  if (desc.includes('회복')) return '회복';
  if (desc.includes('방어막')) return '방벽';
  if (desc.includes('독')) return '누적';
  if (desc.includes('기절')) return '마무리';
  if (desc.includes('에너지')) return '엔진';
  if (desc.includes('잔향')) return '연계';
  if (card?.type === 'ATTACK') return '압박';
  if (card?.type === 'SKILL') return '유틸';
  return '핵심';
}

export function buildFeaturedCardMarkup(cardIds, cards, _accent, tagMap = {}) {
  const resolvedCards = Array.isArray(cardIds) ? cardIds.filter(Boolean) : [];
  if (resolvedCards.length === 0) {
    return '<div class="char-info-text">대표 카드 정보 없음</div>';
  }

  return `<div class="char-start-deck char-featured-cards">${resolvedCards.slice(0, 3).map((cardId) => {
    const card = cards?.[cardId] || { name: cardId };
    const tag = tagMap?.[cardId] || inferFeaturedCardTag(card);
    return `
      <span class="deck-card deck-card-basic deck-card-featured" data-cid="${cardId}">
        <span class="deck-card-name">${card.name}</span>
        <span class="deck-card-role">${tag}</span>
      </span>
    `;
  }).join('')}</div>`;
}

export function resolvePlayStyle(selectedChar) {
  const explicitLines = Array.isArray(selectedChar?.playStyle)
    ? selectedChar.playStyle.filter(Boolean)
    : [];
  if (explicitLines.length > 0) return explicitLines;

  return [
    selectedChar?.summaryText,
    selectedChar?.selectionSummary,
    selectedChar?.desc,
    selectedChar?.traitDesc,
  ].filter(Boolean).slice(0, 2);
}

export function resolveFeaturedCardIds(selectedChar) {
  const explicitCards = Array.isArray(selectedChar?.featuredCardIds)
    ? selectedChar.featuredCardIds.filter(Boolean)
    : [];
  if (explicitCards.length > 0) return explicitCards;

  const starterDeck = Array.isArray(selectedChar?.startDeck) ? selectedChar.startDeck : [];
  const uniqueStarterCards = [...new Set(starterDeck)];
  const signatureCards = uniqueStarterCards.filter((cardId) => cardId !== 'strike' && cardId !== 'defend');
  return (signatureCards.length > 0 ? signatureCards : uniqueStarterCards).slice(0, 3);
}

export function resolveFeaturedCardTags(selectedChar) {
  return selectedChar?.featuredCardTags && typeof selectedChar.featuredCardTags === 'object'
    ? selectedChar.featuredCardTags
    : {};
}

export function normalizeRelicIds(relics, fallbackId = '') {
  return (relics || []).map((relic, index) => String(
    relic?.id
      || relic?.itemId
      || relic?.name
      || (index === 0 ? fallbackId : `${fallbackId}_${index}`)
      || '',
  ));
}

export function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}
