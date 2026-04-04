function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildDeckCardMarkup(deck, cards, _accent) {
  return `<div class="char-start-deck">${(deck || []).map((cardId) => {
    const card = cards?.[cardId] || { name: cardId };
    const cardLabel = [card.name, card.desc].filter(Boolean).join('. ');
    return `<span class="deck-card deck-card-basic" data-cid="${escapeAttr(cardId)}" data-card-label="${escapeAttr(cardLabel)}">${card.name}</span>`;
  }).join('')}</div>`;
}

export function buildInteractiveDeckCardMarkup(deck, cards, _accent, options = {}) {
  const upgradeIndices = new Set((options.upgradeIndices || []).map((entry) => Number(entry)));
  const swapIndices = new Set((options.swapIndices || []).map((entry) => Number(entry)));
  const mode = options.mode === 'swap' ? 'swap' : 'upgrade';
  const selectedIndex = mode === 'swap' ? options.selectedSwapIndex : options.selectedUpgradeIndex;

  return `<div class="char-start-deck">${(deck || []).map((cardId, index) => {
    const card = cards?.[cardId] || { name: cardId };
    const selectable = mode === 'swap' ? swapIndices.has(index) : upgradeIndices.has(index);
    const selected = selectedIndex !== null && selectedIndex !== undefined && Number(selectedIndex) === index;
    const stateLabel = selected ? (mode === 'swap' ? '교체 대상' : '강화 예정') : '';
    const cardLabel = [card.name, card.desc].filter(Boolean).join('. ');
    return `
      <span
        class="deck-card deck-card-basic level11-edit-card${selectable ? ' is-selectable' : ' is-inactive'}${selected ? ' is-selected' : ''}"
        data-cid="${escapeAttr(cardId)}"
        data-card-label="${escapeAttr(cardLabel)}"
        data-level11-index="${index}"
        data-level11-selectable="${selectable ? 'true' : 'false'}"
        aria-pressed="${selected ? 'true' : 'false'}"
      >
        <span class="deck-card-name">${card.name}</span>
        <span class="level11-card-state${stateLabel ? ' is-visible' : ''}">${stateLabel}</span>
      </span>
    `;
  }).join('')}</div>`;
}

export function buildRelicMarkup(relics, _accent, options = {}) {
  const slotOffset = Number(options.slotOffset) || 0;
  return `
    <div class="relic-wrap">
      ${(relics || []).map((relic, index) => `
        <div
          class="relic-inner"
          data-relic-index="${index}"
          data-relic-title="${relic.icon} ${relic.name}"
          data-relic-desc="${relic.desc || ''}"
        >
          <span class="relic-inner-icon">${relic.icon}</span>
          <div class="relic-inner-copy">
            <div class="relic-inner-title">${relic.name}</div>
            <div class="relic-inner-meta">${index + slotOffset === 0 ? '기본 유물' : '추가 유물'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
