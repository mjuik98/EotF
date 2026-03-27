import {
  ensureCodexState,
  getCodexRecord,
  getCodexSets,
} from './codex_ui_helpers.js';

export function buildCodexQuoteBlock(quote) {
  if (!quote) return '';
  return `<div class="cx-popup-quote"><div class="cx-popup-quote-text">${quote}</div></div>`;
}

export function buildCodexSetPopupBlock(item, data, gs) {
  if (!item?.set) return '';
  const def = getCodexSets(data)[item.set];
  if (!def) return '';
  const items = Object.values(data?.items || {});
  const codex = ensureCodexState(gs);
  const owned = (def.items || []).filter((pieceId) => codex.items.has(pieceId)).length;
  const total = (def.items || []).length;
  const piecesHtml = (def.items || []).map((pieceId) => {
    const piece = items.find((entry) => entry.id === pieceId);
    if (!piece) return '';
    return `<div class="cx-set-piece ${codex.items.has(pieceId) ? 'owned' : 'missing'}">
      <div class="cx-set-dot"></div><span>${codex.items.has(pieceId) ? piece.name : '???'}</span>
    </div>`;
  }).join('');
  return `
    <div class="cx-popup-set" style="--set-color:${def.color || '#00ffcc'};--set-border:${def.border || 'rgba(0,255,204,.3)'};--set-glow:${def.glow || 'transparent'}">
      <div class="cx-popup-set-hdr">
        <span>${def.icon || '◈'}</span>
        <span class="cx-popup-set-name">${def.name} 세트</span>
        <span class="cx-popup-set-label">${owned}/${total} 보유</span>
      </div>
      <div class="cx-popup-set-pieces">${piecesHtml}</div>
      <div class="cx-popup-set-effect"><span>✦</span><span>${def.effect || ''}</span></div>
    </div>`;
}

export function buildCodexRecordBlock(gs, category, id) {
  const record = getCodexRecord(gs, category, id);
  if (!record) return '';
  if (category === 'enemies') {
    const encounters = Math.max(0, Number(record.encounters ?? 0));
    const kills = Math.max(0, Number(record.kills ?? 0));
    const ratio = encounters > 0 ? `${Math.round((kills / encounters) * 100)}%` : '-';
    return `<div class="cx-popup-recs">
      <div class="cx-prec"><div class="cx-prec-icon">👁️</div><div class="cx-prec-info"><div class="cx-prec-label">조우 횟수</div><div class="cx-prec-val" style="color:#88ccff">${record.encounters ?? 0}회</div></div></div>
      <div class="cx-prec"><div class="cx-prec-icon">💀</div><div class="cx-prec-info"><div class="cx-prec-label">처치 횟수</div><div class="cx-prec-val" style="color:#ff8899">${record.kills ?? 0}회</div></div></div>
      <div class="cx-prec"><div class="cx-prec-icon">◐</div><div class="cx-prec-info"><div class="cx-prec-label">처치율</div><div class="cx-prec-val" style="color:#b6a6ff">${ratio}</div></div></div>
      <div class="cx-prec"><div class="cx-prec-icon">📖</div><div class="cx-prec-info"><div class="cx-prec-label">첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${record.firstSeen || '-'}</div></div></div>
    </div>`;
  }
  if (category === 'cards') {
    return `<div class="cx-popup-recs">
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">✦</div><div class="cx-prec-info"><div class="cx-prec-label">사용 횟수</div><div class="cx-prec-val" style="color:#88ccff">${record.used ?? 0}회</div></div></div>
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">📖</div><div class="cx-prec-info"><div class="cx-prec-label">첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${record.firstSeen || '-'}</div></div></div>
      ${record.upgradedDiscovered ? `<div class="cx-prec" style="flex:2"><div class="cx-prec-icon">+</div><div class="cx-prec-info"><div class="cx-prec-label">강화 사용 횟수</div><div class="cx-prec-val" style="color:#88ccff">${record.upgradeUsed ?? 0}회</div></div></div>` : ''}
      ${record.upgradedDiscovered ? `<div class="cx-prec" style="flex:2"><div class="cx-prec-icon">⬆</div><div class="cx-prec-info"><div class="cx-prec-label">강화 첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${record.upgradeFirstSeen || '-'}</div></div></div>` : ''}
    </div>`;
  }
  if (category === 'items') {
    return `<div class="cx-popup-recs">
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">💎</div><div class="cx-prec-info"><div class="cx-prec-label">획득 횟수</div><div class="cx-prec-val" style="color:#88ccff">${record.found ?? 0}회</div></div></div>
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">📖</div><div class="cx-prec-info"><div class="cx-prec-label">첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${record.firstSeen || '-'}</div></div></div>
    </div>`;
  }
  return '';
}

export function buildCodexNavBlock(list, index) {
  if (!Array.isArray(list) || list.length <= 1) return '';
  const hasPrev = index > 0;
  const hasNext = index < list.length - 1;
  const prev = hasPrev ? list[index - 1] : null;
  const next = hasNext ? list[index + 1] : null;
  return `
    <div class="cx-popup-nav">
      <button class="cx-popup-nav-btn" id="cxNavPrev" ${!hasPrev ? 'disabled' : ''}>
        <span>←</span><span class="cx-popup-nav-name">${prev ? (prev.name || '???') : ''}</span>
      </button>
      <span class="cx-popup-nav-pos">${index + 1} / ${list.length}</span>
      <button class="cx-popup-nav-btn" id="cxNavNext" ${!hasNext ? 'disabled' : ''} style="flex-direction:row-reverse">
        <span>→</span><span class="cx-popup-nav-name">${next ? (next.name || '???') : ''}</span>
      </button>
    </div>`;
}
