export function buildCodexSetItemsMarkup(setItems, codex) {
  return setItems.map((item) => {
    const seen = codex.items.has(item.id);
    const hint = !seen && item.hint ? `<span class="cx-svi-hint">${item.hint}</span>` : '';
    return `<div class="cx-svi ${seen ? 'owned' : 'missing'}" data-item-id="${item.id}">
      <span class="cx-svi-icon">${seen ? (item.icon || '?') : '❔'}</span>
      <span class="cx-svi-name">${seen ? item.name : '???'}</span>
      ${hint}
    </div>`;
  }).join('');
}

export function buildCodexSetBlockMarkup(def, {
  owned,
  total,
  radius,
  circumference,
  offset,
  isComplete,
  itemsHtml,
} = {}) {
  return `
    <div class="cx-set-hdr">
      <span class="cx-set-icon">${def.icon || '◈'}</span>
      <span class="cx-set-name">${def.name}</span>
      <div class="cx-set-ring">
        <svg class="cx-set-ring-svg" width="42" height="42" viewBox="0 0 42 42">
          <circle fill="none" stroke="rgba(255,255,255,.07)" stroke-width="4" cx="21" cy="21" r="${radius}"/>
          <circle fill="none" stroke="${def.color || '#00ffcc'}" stroke-width="4" stroke-linecap="round"
            cx="21" cy="21" r="${radius}"
            stroke-dasharray="${circumference.toFixed(1)}"
            stroke-dashoffset="${offset.toFixed(1)}"/>
        </svg>
        <div class="cx-set-ring-txt">${owned}/${total}</div>
      </div>
    </div>
    <div class="cx-set-items">${itemsHtml}</div>
    <div class="cx-set-effect">
      <span class="cx-set-effect-icon">✦</span>
      <span class="cx-set-effect-text">
        <span class="cx-set-effect-status">${owned}/${total} 보유</span>
        ${isComplete ? ' · <span class="cx-set-effect-status is-complete">세트 효과 활성화</span>' : ' · 세트 미완성'}
        <br>${def.effect || ''}
      </span>
    </div>
  `;
}

export function bindOwnedCodexSetItems(block, items, onOpenItem) {
  block.querySelectorAll('.cx-svi.owned').forEach((element) => {
    const itemId = element.dataset.itemId;
    const item = items.find((entry) => entry.id === itemId);
    if (item) element.addEventListener('click', () => onOpenItem?.(item));
  });
}

export function renderCodexEmptyState(container, message = '검색 결과가 없습니다') {
  container.innerHTML = `<div class="cx-empty-state"><div class="cx-empty-icon">🔍</div><div class="cx-empty-text">${message}</div></div>`;
}
