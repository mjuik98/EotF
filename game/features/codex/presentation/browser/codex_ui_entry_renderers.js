import {
  ensureCodexState,
  getCardTypeClass,
  getCardTypeLabel,
  getCodexRecord,
  getCodexSets,
  getEnemyBadgeClass,
  getEnemyTypeLabel,
  getRarityBadgeClass,
  getRarityCardClass,
  getRarityLabel,
  isSeenCodexCard,
  resolveCodexItemSetId,
} from './codex_ui_helpers.js';
import {
  createCodexEntryShell,
  setCodexEntryAnimationDelay,
} from './codex_ui_card_shell.js';
import {
  bindOwnedCodexSetItems,
  buildCodexSetBlockMarkup,
  buildCodexSetItemsMarkup,
  renderCodexEmptyState,
} from './codex_ui_set_view_helpers.js';

export function createCodexEnemyCard(doc, enemy, index, context = {}) {
  const { gs, onOpen } = context;
  const codex = ensureCodexState(gs);
  const seen = codex.enemies.has(enemy.id);
  const card = createCodexEntryShell(doc, enemy, context.typeClass || 't-enemy', '', seen);
  setCodexEntryAnimationDelay(card, index);

  const rec = getCodexRecord(gs, 'enemies', enemy.id);
  const killsBadge = seen && rec ? `<div class="cx-record-badge">💀 ${rec.kills ?? 0}</div>` : '';
  const hintBadge = !seen && enemy.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${enemy.hint}</div></div>` : '';

  card.innerHTML += `
    <div class="cx-num">#${String(index + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${getEnemyBadgeClass(enemy)}">${getEnemyTypeLabel(enemy)}</div>` : ''}
    <div class="cx-icon-area">
      <div class="cx-icon-bg"></div>
      ${seen ? `<div class="cx-icon">${enemy.icon || '?'}</div>` : `<div class="cx-silhouette">${enemy.icon || '?'}</div>`}
    </div>
    ${hintBadge}${killsBadge}
    <div class="cx-info">
      <div class="cx-name">${seen ? enemy.name : '???'}</div>
      <div class="cx-sub">${seen ? `체력 ${enemy.maxHp ?? enemy.hp ?? 0} · 공격력 ${enemy.atk ?? 0}` : '미발견'}</div>
    </div>
    ${seen && enemy.isNew ? '<div class="cx-new-dot"></div>' : ''}
  `;

  if (seen) card.addEventListener('click', () => onOpen?.(enemy));
  return card;
}

export function createCodexCardEntry(doc, cardEntry, index, context = {}) {
  const { gs, onOpen } = context;
  const codex = ensureCodexState(gs);
  const seen = isSeenCodexCard(codex, cardEntry.id);
  const card = createCodexEntryShell(
    doc,
    cardEntry,
    `t-${String(cardEntry.type || 'skill').toLowerCase()}`,
    getRarityCardClass(cardEntry.rarity),
    seen,
  );
  setCodexEntryAnimationDelay(card, index);

  const rec = getCodexRecord(gs, 'cards', cardEntry.id);
  const usedBadge = seen && rec ? `<div class="cx-record-badge">✦ ${rec.used ?? 0}</div>` : '';
  const upgradeBadge = seen && rec?.upgradedDiscovered ? '<div class="cx-record-badge cx-record-badge--left">+</div>' : '';
  const hintBadge = !seen && cardEntry.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${cardEntry.hint}</div></div>` : '';
  const rarityLabel = getRarityLabel(cardEntry.rarity);

  card.innerHTML += `
    <div class="cx-num">#${String(index + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${getCardTypeClass(cardEntry.type)}">${getCardTypeLabel(cardEntry.type)}</div>` : ''}
    <div class="cx-icon-area">
      <div class="cx-icon-bg"></div>
      ${seen ? `<div class="cx-icon">${cardEntry.icon || '?'}</div>` : `<div class="cx-silhouette">${cardEntry.icon || '?'}</div>`}
    </div>
    ${hintBadge}${usedBadge}${upgradeBadge}
    <div class="cx-info">
      <div class="cx-name">${seen ? cardEntry.name : '???'}</div>
      <div class="cx-sub">${seen ? rarityLabel : '미발견'}</div>
      ${seen ? `<div class="cx-cost">${cardEntry.cost ?? 0}</div>` : ''}
    </div>
    ${seen && cardEntry.isNew ? '<div class="cx-new-dot"></div>' : ''}
  `;

  if (seen) card.addEventListener('click', () => onOpen?.(cardEntry));
  return card;
}

export function createCodexItemCard(doc, item, index, context = {}) {
  const { gs, data, onOpen } = context;
  const codex = ensureCodexState(gs);
  const seen = codex.items.has(item.id);
  const setId = resolveCodexItemSetId(item);
  const setDef = setId ? getCodexSets(data)[setId] : null;
  const card = createCodexEntryShell(
    doc,
    item,
    't-item',
    item.rarity === 'legendary' || item.rarity === 'boss' ? 'r-legendary' : getRarityCardClass(item.rarity),
    seen,
  );
  setCodexEntryAnimationDelay(card, index);
  if (setDef && seen) {
    card.style.setProperty('--cx-card-border', setDef.border || 'rgba(0,255,204,.2)');
    card.style.setProperty('--set-color', setDef.color || '#00ffcc');
  }

  const hintBadge = !seen && item.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${item.hint}</div></div>` : '';

  card.innerHTML += `
    <div class="cx-num">#${String(index + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${getRarityBadgeClass(item.rarity)}">${getRarityLabel(item.rarity)}</div>` : ''}
    ${seen && setId ? '<div class="cx-badge b-set cx-badge-set-offset">세트</div>' : ''}
    <div class="cx-icon-area">
      <div class="cx-icon-bg"></div>
      ${seen ? `<div class="cx-icon">${item.icon || '?'}</div>` : `<div class="cx-silhouette">${item.icon || '?'}</div>`}
    </div>
    ${hintBadge}
    <div class="cx-info">
      <div class="cx-name">${seen ? item.name : '???'}</div>
      <div class="cx-sub">${seen ? (setDef ? `◈ ${setDef.name}` : `${getRarityLabel(item.rarity)} 등급`) : '미발견'}</div>
    </div>
    ${seen && item.isNew ? '<div class="cx-new-dot"></div>' : ''}
    ${seen && setDef ? '<div class="cx-set-pip"></div><div class="cx-set-ribbon"></div>' : ''}
  `;

  if (seen) card.addEventListener('click', () => onOpen?.(item));
  return card;
}

export function renderCodexSetView(doc, container, data, gs, handlers = {}) {
  const sets = getCodexSets(data);
  const items = Object.values(data?.items || {});
  const codex = ensureCodexState(gs);

  Object.entries(sets).forEach(([, def]) => {
    const setItems = (def.items || []).map((id) => items.find((entry) => entry.id === id)).filter(Boolean);
    const owned = setItems.filter((entry) => codex.items.has(entry.id)).length;
    const total = setItems.length;
    const radius = 17;
    const circumference = 2 * Math.PI * radius;
    const ratio = total > 0 ? (owned / total) : 0;
    const offset = circumference - (circumference * ratio);
    const isComplete = total > 0 && owned >= total;

    const block = doc.createElement('div');
    block.className = 'cx-set-block';
    block.style.setProperty('--sv-color', def.color || '#00ffcc');
    block.style.setProperty('--sv-border', def.border || 'rgba(0,255,204,.4)');
    block.style.setProperty('--sv-glow', def.glow || 'rgba(0,255,204,.15)');

    const itemsHtml = buildCodexSetItemsMarkup(setItems, codex);

    block.innerHTML = buildCodexSetBlockMarkup(def, {
      owned,
      total,
      radius,
      circumference,
      offset,
      isComplete,
      itemsHtml,
    });

    bindOwnedCodexSetItems(block, items, handlers.onOpenItem);

    container.appendChild(block);
  });

  if (Object.keys(sets).length > 0) {
    const div = doc.createElement('div');
    div.className = 'cx-set-view-divider';
    container.appendChild(div);
  }
}

export function renderCodexEmpty(container, message = '검색 결과가 없습니다') {
  renderCodexEmptyState(container, message);
}
