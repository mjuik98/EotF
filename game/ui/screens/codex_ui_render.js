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
} from './codex_ui_helpers.js';

function catBar(label, seen, total, fillClass, tab) {
  const width = total > 0 ? Math.round((seen / total) * 100) : 0;
  return `
    <div class="cx-cat-item" data-tab="${tab}">
      <div class="cx-cat-header">
        <span class="cx-cat-label">${label}</span>
        <span class="cx-cat-nums"><span class="cx-cat-seen">${seen}</span>/${total}</span>
      </div>
      <div class="cx-cat-track">
        <div class="cx-cat-fill ${fillClass}" style="width:${width}%"></div>
      </div>
    </div>`;
}

function baseCard(doc, entry, typeClass, rarityClass, seen) {
  const card = doc.createElement('article');
  card.className = [
    'cx-card',
    typeClass,
    rarityClass,
    !seen ? 'is-unknown' : '',
    entry.isNew && seen ? 'new-card' : '',
  ].filter(Boolean).join(' ');

  if (!seen) {
    card.innerHTML = `
      <div class="cx-unknown-qmarks">
        <span class="cx-qmark" style="top:20%;left:10%;animation-delay:0s">?</span>
        <span class="cx-qmark" style="top:40%;left:80%;animation-delay:1s">?</span>
        <span class="cx-qmark" style="top:65%;left:40%;animation-delay:2s">?</span>
      </div>`;
  }
  return card;
}

export function renderCodexProgress(doc, progress, handlers = {}) {
  const section = doc.getElementById('cxProgressSection');
  if (!section) return;

  [['enemies', progress.enemies.seen, progress.enemies.total], ['cards', progress.cards.seen, progress.cards.total],
  ['items', progress.items.seen, progress.items.total], ['inscriptions', progress.inscriptions.seen, progress.inscriptions.total]].forEach(([tab, seen, total]) => {
    const badge = doc.getElementById(`cxBadge_${tab}`);
    if (badge) badge.textContent = `${seen}/${total}`;
  });

  section.innerHTML = `
    <div class="cx-ring-wrap">
      <svg class="cx-ring-svg" width="72" height="72" viewBox="0 0 72 72">
        <defs>
          <linearGradient id="cxRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#007755"/>
            <stop offset="100%" stop-color="#00ffcc"/>
          </linearGradient>
        </defs>
        <circle class="cx-ring-bg" cx="36" cy="36" r="29"/>
        <circle class="cx-ring-fill" cx="36" cy="36" r="29"
          stroke="url(#cxRingGrad)"
          stroke-dasharray="${progress.circumference.toFixed(1)}"
          stroke-dashoffset="${progress.offset.toFixed(1)}"/>
      </svg>
      <div class="cx-ring-label">
        <div class="cx-ring-pct">${progress.percent}%</div>
        <div class="cx-ring-cap">TOTAL</div>
      </div>
    </div>
    <div class="cx-cat-bars">
      ${catBar('👾 적', progress.enemies.seen, progress.enemies.total, 'fill-enemy', 'enemies')}
      ${catBar('🃏 카드', progress.cards.seen, progress.cards.total, 'fill-cards', 'cards')}
      ${catBar('💎 유물', progress.items.seen, progress.items.total, 'fill-items', 'items')}
      ${catBar('✨ 각인', progress.inscriptions.seen, progress.inscriptions.total, 'fill-inscr', 'inscriptions')}
    </div>
  `;

  section.querySelectorAll('.cx-cat-item').forEach((element) => {
    element.addEventListener('click', () => handlers.onSelectTab?.(element.dataset.tab));
  });

  const raf = globalThis.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
  raf(() => {
    const fill = section.querySelector('.cx-ring-fill');
    if (fill) fill.style.strokeDashoffset = progress.offset;
  });
}

export function renderCodexFilterBar(doc, options = {}) {
  const {
    definitions = [],
    filter = 'all',
    showUnknown = true,
    onFilterChange = () => {},
    onToggleUnknown = () => {},
  } = options;
  const bar = doc.getElementById('cxFilterBar');
  if (!bar) return;

  bar.textContent = '';

  const label = doc.createElement('span');
  label.className = 'cx-filter-label';
  label.textContent = 'FILTER';
  bar.appendChild(label);

  definitions.forEach((definition) => {
    if (!definition) {
      const sep = doc.createElement('div');
      sep.className = 'cx-filter-sep';
      bar.appendChild(sep);
      return;
    }
    const btn = doc.createElement('button');
    btn.className = 'cx-filter-pill' + (filter === definition.k ? ` ${definition.c || 'f-all'}` : '');
    btn.textContent = definition.l;
    btn.addEventListener('click', () => onFilterChange(definition.k));
    bar.appendChild(btn);
  });

  const endSep = doc.createElement('div');
  endSep.className = 'cx-filter-sep';
  bar.appendChild(endSep);

  const toggle = doc.createElement('button');
  toggle.className = 'cx-unknown-toggle';
  toggle.innerHTML = `<span>미발견 표시</span><div class="cx-toggle-track ${showUnknown ? 'on' : ''}"></div>`;
  toggle.addEventListener('click', () => onToggleUnknown());
  bar.appendChild(toggle);
}

export function renderCodexSection(doc, container, options = {}) {
  const {
    title,
    icon,
    entries = [],
    buildCard,
    seenCount = 0,
  } = options;
  const section = doc.createElement('div');
  section.className = 'cx-section';
  section.innerHTML = `
    <div class="cx-section-hdr">
      <span class="cx-section-icon">${icon}</span>
      <span class="cx-section-title">${title}</span>
      <span class="cx-section-count">${seenCount} / ${entries.length}</span>
    </div>`;

  const grid = doc.createElement('div');
  grid.className = 'cx-grid';
  entries.forEach((entry, index) => {
    const card = buildCard(entry, index, doc);
    grid.appendChild(card);
  });
  section.appendChild(grid);
  container.appendChild(section);
}

export function createCodexEnemyCard(doc, enemy, index, context = {}) {
  const { gs, onOpen } = context;
  const codex = ensureCodexState(gs);
  const seen = codex.enemies.has(enemy.id);
  const card = baseCard(doc, enemy, context.typeClass || 't-enemy', '', seen);
  card.style.animationDelay = `${(index % 12) * 0.03}s`;

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
      <div class="cx-sub">${seen ? `HP ${enemy.maxHp ?? enemy.hp ?? 0} · ATK ${enemy.atk ?? 0}` : '미발견'}</div>
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
  const card = baseCard(doc, cardEntry, `t-${String(cardEntry.type || 'skill').toLowerCase()}`, getRarityCardClass(cardEntry.rarity), seen);
  card.style.animationDelay = `${(index % 12) * 0.03}s`;

  const rec = getCodexRecord(gs, 'cards', cardEntry.id);
  const usedBadge = seen && rec ? `<div class="cx-record-badge">✦ ${rec.used ?? 0}</div>` : '';
  const upgradeBadge = seen && rec?.upgradedDiscovered ? '<div class="cx-record-badge" style="right:auto;left:12px">+</div>' : '';
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
  const setDef = item.set ? getCodexSets(data)[item.set] : null;
  const card = baseCard(
    doc,
    item,
    't-item',
    item.rarity === 'legendary' || item.rarity === 'boss' ? 'r-legendary' : getRarityCardClass(item.rarity),
    seen,
  );
  card.style.animationDelay = `${(index % 12) * 0.03}s`;
  if (setDef && seen) card.style.setProperty('--cx-card-border', setDef.border || 'rgba(0,255,204,.2)');

  const hintBadge = !seen && item.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${item.hint}</div></div>` : '';

  card.innerHTML += `
    <div class="cx-num">#${String(index + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${getRarityBadgeClass(item.rarity)}">${getRarityLabel(item.rarity)}</div>` : ''}
    ${seen && item.set ? '<div class="cx-badge b-set" style="top:26px;">세트</div>' : ''}
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
    ${seen && setDef ? `<div class="cx-set-pip" style="--set-color:${setDef.color}"></div><div class="cx-set-ribbon" style="--set-color:${setDef.color}"></div>` : ''}
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

    const itemsHtml = setItems.map((item) => {
      const seen = codex.items.has(item.id);
      const hint = !seen && item.hint ? `<span class="cx-svi-hint">${item.hint}</span>` : '';
      return `<div class="cx-svi ${seen ? 'owned' : 'missing'}" data-item-id="${item.id}">
        <span class="cx-svi-icon">${seen ? (item.icon || '?') : '❔'}</span>
        <span class="cx-svi-name">${seen ? item.name : '???'}</span>
        ${hint}
      </div>`;
    }).join('');

    block.innerHTML = `
      <div class="cx-set-hdr">
        <span class="cx-set-icon">${def.icon || '◈'}</span>
        <span class="cx-set-name">${def.name}</span>
        <div class="cx-set-ring">
          <svg width="42" height="42" viewBox="0 0 42 42" style="transform:rotate(-90deg)">
            <circle fill="none" stroke="rgba(255,255,255,.07)" stroke-width="4" cx="21" cy="21" r="${radius}"/>
            <circle fill="none" stroke="${def.color || '#00ffcc'}" stroke-width="4" stroke-linecap="round"
              cx="21" cy="21" r="${radius}"
              stroke-dasharray="${circumference.toFixed(1)}"
              stroke-dashoffset="${offset.toFixed(1)}"/>
          </svg>
          <div class="cx-set-ring-txt" style="color:${def.color || '#00ffcc'}">${owned}/${total}</div>
        </div>
      </div>
      <div class="cx-set-items">${itemsHtml}</div>
      <div class="cx-set-effect">
        <span class="cx-set-effect-icon">✦</span>
        <span class="cx-set-effect-text">
          <span style="color:${def.color || '#00ffcc'};font-weight:600">${owned}/${total} 보유</span>
          ${isComplete ? ` · <span style="color:${def.color || '#00ffcc'};font-weight:600">세트 효과 활성화</span>` : ' · 세트 미완성'}
          <br>${def.effect || ''}
        </span>
      </div>
    `;

    block.querySelectorAll('.cx-svi.owned').forEach((element) => {
      const itemId = element.dataset.itemId;
      const item = items.find((entry) => entry.id === itemId);
      if (item) element.addEventListener('click', () => handlers.onOpenItem?.(item));
    });

    container.appendChild(block);
  });

  if (Object.keys(sets).length > 0) {
    const div = doc.createElement('div');
    div.style.cssText = 'height:1px;background:rgba(255,255,255,.05);margin:8px 0 28px';
    container.appendChild(div);
  }
}

export function renderCodexEmpty(container, message = '검색 결과가 없습니다') {
  container.innerHTML = `<div class="cx-empty-state"><div class="cx-empty-icon">🔍</div><div class="cx-empty-text">${message}</div></div>`;
}
