function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildDeckCardMarkup(deck, cards, accent) {
  return `<div class="char-start-deck">${(deck || []).map((cardId) => {
    const card = cards?.[cardId] || { name: cardId };
    const cardLabel = [card.name, card.desc].filter(Boolean).join('. ');
    return `<span class="deck-card" data-cid="${escapeAttr(cardId)}" data-card-label="${escapeAttr(cardLabel)}" style="border:1px solid ${accent}1a;padding:4px 10px;font-size:11px;background:${accent}05;cursor:help">${card.name}</span>`;
  }).join('')}</div>`;
}

export function buildInteractiveDeckCardMarkup(deck, cards, accent, options = {}) {
  const upgradeIndices = new Set((options.upgradeIndices || []).map((entry) => Number(entry)));
  const swapIndices = new Set((options.swapIndices || []).map((entry) => Number(entry)));
  const mode = options.mode === 'swap' ? 'swap' : 'upgrade';
  const selectedIndex = mode === 'swap' ? options.selectedSwapIndex : options.selectedUpgradeIndex;

  return `<div class="char-start-deck">${(deck || []).map((cardId, index) => {
    const card = cards?.[cardId] || { name: cardId };
    const selectable = mode === 'swap' ? swapIndices.has(index) : upgradeIndices.has(index);
    const selected = selectedIndex !== null && selectedIndex !== undefined && Number(selectedIndex) === index;
    const stateLabel = selected ? (mode === 'swap' ? '교체 대상' : '강화 예정') : '';
    const borderColor = selected ? `${accent}99` : (selectable ? `${accent}44` : `${accent}1a`);
    const background = selected ? `${accent}12` : (selectable ? `${accent}08` : `${accent}05`);
    const boxShadow = selected ? `0 0 0 1px ${accent}66 inset, 0 6px 14px rgba(0, 0, 0, 0.16)` : 'none';
    const cardLabel = [card.name, card.desc].filter(Boolean).join('. ');
    return `
      <span
        class="deck-card level11-edit-card"
        data-cid="${escapeAttr(cardId)}"
        data-card-label="${escapeAttr(cardLabel)}"
        data-level11-index="${index}"
        data-level11-selectable="${selectable ? 'true' : 'false'}"
        style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:4px;border:1px solid ${borderColor};padding:6px 10px;font-size:11px;background:${background};cursor:${selectable ? 'pointer' : 'help'};box-shadow:${boxShadow}"
      >
        <span>${card.name}</span>
        ${stateLabel ? `<span class="level11-card-state" style="display:inline-flex;align-items:center;padding:1px 6px;border-radius:999px;border:1px solid ${accent}55;background:${accent}16;color:${accent};font-size:9px;letter-spacing:0.06em;">${stateLabel}</span>` : ''}
      </span>
    `;
  }).join('')}</div>`;
}

export function buildRelicMarkup(relics, accent, options = {}) {
  const slotOffset = Number(options.slotOffset) || 0;
  return `
    <div class="relic-wrap">
      ${(relics || []).map((relic, index) => `
        <div
          class="relic-inner"
          data-relic-index="${index}"
          data-relic-title="${relic.icon} ${relic.name}"
          data-relic-desc="${relic.desc || ''}"
          style="border:1px solid ${accent}33;background:${accent}08;padding:10px 16px"
        >
          <span style="font-size:24px">${relic.icon}</span>
          <div>
            <div style="font-size:13px;color:${accent};font-family:'Share Tech Mono',monospace;letter-spacing:.5px">${relic.name}</div>
            <div style="font-size:11px;color:${accent}66;font-family:'Share Tech Mono',monospace">${index + slotOffset === 0 ? '기본 유물' : '추가 유물'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
