import {
  ensureCodexState,
  getCodexRecord,
  getCodexSets,
  resolveCodexItemSetId,
} from './codex_ui_helpers.js';

function buildRecordEntry(icon, label, value, options = {}) {
  const widthClass = options.wide ? ' cx-prec--wide' : '';
  const toneClass = options.tone ? ` cx-prec-val--${options.tone}` : '';
  return `<div class="cx-prec${widthClass}">
    <div class="cx-prec-icon">${icon}</div>
    <div class="cx-prec-info">
      <div class="cx-prec-label">${label}</div>
      <div class="cx-prec-val${toneClass}">${value}</div>
    </div>
  </div>`;
}

export function buildCodexQuoteBlock(quote, formatHtml = (value) => value || '') {
  if (!quote) return '';
  return `<div class="cx-popup-quote"><div class="cx-popup-quote-text">${formatHtml(quote)}</div></div>`;
}

export function buildCodexSetPopupBlock(item, data, gs) {
  const setId = resolveCodexItemSetId(item);
  if (!setId) return '';
  const def = getCodexSets(data)[setId];
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
      ${buildRecordEntry('👁️', '조우 횟수', `${record.encounters ?? 0}회`, { tone: 'info' })}
      ${buildRecordEntry('💀', '처치 횟수', `${record.kills ?? 0}회`, { tone: 'danger' })}
      ${buildRecordEntry('◐', '처치율', ratio, { tone: 'accent' })}
      ${buildRecordEntry('📖', '첫 발견', record.firstSeen || '-', { tone: 'gold' })}
    </div>`;
  }
  if (category === 'cards') {
    return `<div class="cx-popup-recs">
      ${buildRecordEntry('✦', '사용 횟수', `${record.used ?? 0}회`, { tone: 'info', wide: true })}
      ${buildRecordEntry('📖', '첫 발견', record.firstSeen || '-', { tone: 'gold', wide: true })}
      ${record.upgradedDiscovered ? buildRecordEntry('+', '강화 사용 횟수', `${record.upgradeUsed ?? 0}회`, { tone: 'info', wide: true }) : ''}
      ${record.upgradedDiscovered ? buildRecordEntry('⬆', '강화 첫 발견', record.upgradeFirstSeen || '-', { tone: 'gold', wide: true }) : ''}
    </div>`;
  }
  if (category === 'items') {
    return `<div class="cx-popup-recs">
      ${buildRecordEntry('💎', '획득 횟수', `${record.found ?? 0}회`, { tone: 'info', wide: true })}
      ${buildRecordEntry('📖', '첫 발견', record.firstSeen || '-', { tone: 'gold', wide: true })}
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
      <button class="cx-popup-nav-btn is-next" id="cxNavNext" ${!hasNext ? 'disabled' : ''}>
        <span>→</span><span class="cx-popup-nav-name">${next ? (next.name || '???') : ''}</span>
      </button>
    </div>`;
}
