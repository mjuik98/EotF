/**
 * codex_ui.js  —  도감 UI v3
 *
 * 기존 API 표면 완전 유지:
 *   CodexUI.openCodex(deps)
 *   CodexUI.closeCodex(deps)
 *   CodexUI.setCodexTab(tab, deps)
 *   CodexUI.renderCodexContent(deps)
 *
 * deps = { gs, data, doc }
 *   gs.meta.codex           — { enemies:Set, cards:Set, items:Set }
 *   gs.meta.codexRecords    — { enemies:{id:{encounters,kills,firstSeen}}, cards:{id:{used,firstSeen}}, items:{id:{found,firstSeen}} }
 *   data.enemies / cards / items / inscriptions  — { [id]: entryObj }
 *   data.itemSets           — (optional) { [setId]: { name, color, glow, border, icon, effect, items:[id] } }
 *
 * 각 data entry 에 지원하는 추가 필드:
 *   entry.quote   — 인게임 대사/인용구 (팝업 하단 이탤릭 블록)
 *   entry.hint    — 미발견 시 힌트 텍스트
 *   entry.set     — itemSet id (유물 전용)
 */

import { DescriptionUtils } from '../../utils/description_utils.js';
import {
  getCardUpgradeId,
  isCardUpgradeVariant,
  resolveCodexCardId,
} from '../../systems/codex_records_system.js';

/* ════════════════════════════════════════
   MODULE STATE
════════════════════════════════════════ */
let _codexTab = 'enemies';
let _codexFilter = 'all';
let _codexSort = 'default';
let _codexSearch = '';
let _showUnknown = true;
let _isTransitioning = false;

// popup navigation
let _popupList = [];
let _popupIdx = 0;
let _popupDeps = null;
let _popupOpenFn = null;

/* ════════════════════════════════════════
   HELPERS — deps / gs
════════════════════════════════════════ */
function _getDoc(deps) {
  return deps?.doc || document;
}

function _toSet(v) {
  if (v instanceof Set) return v;
  if (Array.isArray(v)) return new Set(v);
  return new Set();
}

function _ensureCodex(gs) {
  if (!gs) return { enemies: new Set(), cards: new Set(), items: new Set() };
  if (!gs.meta) gs.meta = {};
  if (!gs.meta.codex) gs.meta.codex = {};
  const c = gs.meta.codex;
  c.enemies = _toSet(c.enemies);
  c.cards = _toSet(c.cards);
  c.items = _toSet(c.items);
  return c;
}

function _getRecords(gs, category, id) {
  const key = category === 'cards' ? resolveCodexCardId(id) : id;
  return gs?.meta?.codexRecords?.[category]?.[key] || null;
}

function _safeHtml(desc) {
  if (!desc) return '';
  if (typeof DescriptionUtils?.highlight === 'function') return DescriptionUtils.highlight(desc);
  return desc;
}

function _getBaseCards(data) {
  return Object.values(data?.cards || {}).filter((card) => !isCardUpgradeVariant(card?.id));
}

function _isSeenCard(codex, cardId) {
  return codex.cards.has(resolveCodexCardId(cardId));
}

function _getCardUpgradeEntry(data, cardId) {
  const upgradedId = getCardUpgradeId(cardId);
  if (!upgradedId) return null;
  return data?.cards?.[upgradedId] || null;
}

/* ════════════════════════════════════════
   SET DEFINITIONS
   data.itemSets 가 없으면 이 기본값 사용
════════════════════════════════════════ */
const _DEFAULT_SETS = {};  // 실제 게임 데이터에서 data.itemSets 로 주입

function _getSets(data) {
  return data?.itemSets || _DEFAULT_SETS;
}

/* ════════════════════════════════════════
   LABEL HELPERS
════════════════════════════════════════ */
function _cardTypeLabel(type) {
  const t = String(type || '').toUpperCase();
  return t === 'ATTACK' ? '공격' : t === 'SKILL' ? '스킬' : t === 'POWER' ? '파워' : (t || '기타');
}
function _cardTypeCls(type) {
  const t = String(type || '').toUpperCase();
  return t === 'ATTACK' ? 'b-attack' : t === 'SKILL' ? 'b-skill' : t === 'POWER' ? 'b-power' : 'b-item';
}
function _rarityLabel(r) {
  const m = { boss: '보스', legendary: '전설', rare: '희귀', uncommon: '고급', common: '일반' };
  return m[String(r || 'common').toLowerCase()] || '일반';
}
function _rarityBadgeCls(r) {
  const m = { boss: 'b-boss', legendary: 'b-legendary', rare: 'b-rare', uncommon: 'b-skill', common: 'b-item' };
  return m[String(r || 'common').toLowerCase()] || 'b-item';
}
function _enemyTypeCls(e) {
  if (e.isBoss) return 't-boss';
  if (e.isMiniBoss) return 't-miniboss';
  if (e.isElite) return 't-elite';
  return 't-enemy';
}
function _enemyBadgeCls(e) {
  if (e.isBoss) return 'b-boss';
  if (e.isMiniBoss) return 'b-miniboss';
  if (e.isElite) return 'b-elite';
  return 'b-enemy';
}
function _enemyTypeLabel(e) {
  if (e.isBoss) return '보스';
  if (e.isMiniBoss) return '중간 보스';
  if (e.isElite) return '정예';
  return '일반';
}
function _rarityCardCls(r) {
  const s = String(r || '').toLowerCase();
  if (s === 'legendary') return 'r-legendary';
  if (s === 'rare') return 'r-rare';
  return '';
}

/* ════════════════════════════════════════
   FILTER DEFINITIONS
════════════════════════════════════════ */
function _filterDefs(data) {
  const sets = _getSets(data);
  const setFilters = Object.entries(sets).map(([k, s]) => ({
    k: `set:${k}`, l: `◈ ${s.name}`, c: `f-set-${k}`,
  }));
  return {
    enemies: [{ k: 'all', l: '전체' }, { k: 'enemy', l: '일반', c: 'f-enemy' }, { k: 'elite', l: '정예', c: 'f-elite' }, { k: 'miniboss', l: '중간 보스', c: 'f-miniboss' }, { k: 'boss', l: '보스', c: 'f-boss' }],
    cards: [{ k: 'all', l: '전체' }, { k: 'attack', l: '공격', c: 'f-attack' }, { k: 'skill', l: '스킬', c: 'f-skill' }, { k: 'power', l: '파워', c: 'f-power' }],
    items: [{ k: 'all', l: '전체' }, { k: 'common', l: '일반' }, { k: 'uncommon', l: '고급' }, { k: 'rare', l: '희귀', c: 'f-rare' }, { k: 'legendary', l: '전설', c: 'f-legendary' }, { k: 'boss', l: '보스', c: 'f-boss' },
    ...(setFilters.length ? [null, ...setFilters] : [])],
    inscriptions: [{ k: 'all', l: '전체' }],
  };
}

/* ════════════════════════════════════════
   MODAL STRUCTURE INJECTION
   모달 열릴 때 내부 레이아웃을 v3 구조로 재구성
════════════════════════════════════════ */
function _injectModalStructure(doc, deps) {
  const inner = doc.getElementById('codexModal')?.querySelector('.codex-modal-inner');
  if (!inner) return;

  // 이미 v3 구조라면 skip
  if (inner.dataset.v3) return;
  inner.dataset.v3 = '1';

  inner.innerHTML = `
    <!-- 헤더 -->
    <div class="cx-header">
      <div class="cx-header-left">
        <div class="cx-eyebrow">◈ CODEX ◈</div>
        <div class="cx-title">도감</div>
        <div class="cx-subtitle">발견한 모든 것이 기록된다</div>
      </div>
      <div class="cx-header-right">
        <div class="cx-search-wrap">
          <span class="cx-search-icon">🔍</span>
          <input class="cx-search" id="cxSearch" type="text" placeholder="검색..." autocomplete="off">
        </div>
        <select class="cx-sort-select" id="cxSort">
          <option value="default">기본순</option>
          <option value="name">이름순</option>
          <option value="rarity">등급순</option>
          <option value="count">횟수순</option>
        </select>
        <button class="cx-close-btn" id="codexCloseBtn">✕</button>
      </div>
    </div>

    <!-- 진행도 -->
    <div class="cx-progress-section" id="cxProgressSection">
      <!-- JS 에서 채움 -->
    </div>

    <!-- 탭 -->
    <div class="cx-tabs">
      <button class="cx-tab-btn active" id="codexTab_enemies" data-tab="enemies">
        👾 적 도감 <span class="cx-tab-badge" id="cxBadge_enemies"></span>
      </button>
      <button class="cx-tab-btn" id="codexTab_cards" data-tab="cards">
        🃏 카드 도감 <span class="cx-tab-badge" id="cxBadge_cards"></span>
      </button>
      <button class="cx-tab-btn" id="codexTab_items" data-tab="items">
        💎 유물 도감 <span class="cx-tab-badge" id="cxBadge_items"></span>
      </button>
      <button class="cx-tab-btn" id="codexTab_inscriptions" data-tab="inscriptions">
        ✨ 각인 도감 <span class="cx-tab-badge" id="cxBadge_inscriptions"></span>
      </button>
    </div>

    <!-- 필터 바 -->
    <div class="cx-filter-bar" id="cxFilterBar"></div>

    <!-- 콘텐츠 -->
    <div class="cx-content-wrap">
      <div class="cx-content" id="codexContent"></div>
    </div>

    <!-- 푸터 -->
    <div class="cx-footer">
      <div class="cx-footer-hints">
        <span><span class="cx-kbd">클릭</span>상세 보기</span>
        <span><span class="cx-kbd">←→</span>이전/다음</span>
        <span><span class="cx-kbd">ESC</span>닫기</span>
      </div>
    </div>
  `;

  // 이벤트 바인딩
  doc.getElementById('cxSearch')?.addEventListener('input', (e) => {
    _codexSearch = e.target.value.toLowerCase();
    CodexUI.renderCodexContent(_popupDeps);
  });
  doc.getElementById('cxSort')?.addEventListener('change', (e) => {
    _codexSort = e.target.value;
    CodexUI.renderCodexContent(_popupDeps);
  });
  doc.getElementById('codexCloseBtn')?.addEventListener('click', () => {
    _popupDeps?.audioEngine?.playClick?.();
    CodexUI.closeCodex(_popupDeps);
  });

  // 탭 버튼
  ['enemies', 'cards', 'items', 'inscriptions'].forEach(tab => {
    doc.getElementById(`codexTab_${tab}`)?.addEventListener('click', () => {
      _popupDeps?.audioEngine?.playClick?.();
      CodexUI.setCodexTab(tab, _popupDeps);
    });
  });
}

/* ════════════════════════════════════════
   PROGRESS SECTION
════════════════════════════════════════ */
function _renderProgress(doc, gs, data) {
  const section = doc.getElementById('cxProgressSection');
  if (!section) return;

  const codex = _ensureCodex(gs);
  const enemies = Object.values(data.enemies || {});
  const cards = _getBaseCards(data);
  const items = Object.values(data.items || {});
  const inscriptions = Object.values(data.inscriptions || {});

  const se = enemies.filter(e => codex.enemies.has(e.id)).length;
  const sc = cards.filter(c => codex.cards.has(c.id)).length;
  const si = items.filter(i => codex.items.has(i.id)).length;
  const sn = inscriptions.filter(i => Number(gs.meta?.inscriptions?.[i.id] || 0) > 0).length;

  const total = enemies.length + cards.length + items.length + inscriptions.length;
  const seen = se + sc + si + sn;
  const pct = total > 0 ? Math.round((seen / total) * 100) : 0;
  const circ = 2 * Math.PI * 29;
  const offset = circ - (circ * pct / 100);

  // update tab badges
  [['enemies', se, enemies.length], ['cards', sc, cards.length],
  ['items', si, items.length], ['inscriptions', sn, inscriptions.length]].forEach(([t, s, tot]) => {
    const b = doc.getElementById(`cxBadge_${t}`);
    if (b) b.textContent = `${s}/${tot}`;
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
        <circle class="cx-ring-bg"   cx="36" cy="36" r="29"/>
        <circle class="cx-ring-fill" cx="36" cy="36" r="29"
          stroke="url(#cxRingGrad)"
          stroke-dasharray="${circ.toFixed(1)}"
          stroke-dashoffset="${offset.toFixed(1)}"/>
      </svg>
      <div class="cx-ring-label">
        <div class="cx-ring-pct">${pct}%</div>
        <div class="cx-ring-cap">TOTAL</div>
      </div>
    </div>
    <div class="cx-cat-bars">
      ${_catBar('👾 적', se, enemies.length, 'fill-enemy', 'enemies')}
      ${_catBar('🃏 카드', sc, cards.length, 'fill-cards', 'cards')}
      ${_catBar('💎 유물', si, items.length, 'fill-items', 'items')}
      ${_catBar('✨ 각인', sn, inscriptions.length, 'fill-inscr', 'inscriptions')}
    </div>
  `;

  // cat bar click
  section.querySelectorAll('.cx-cat-item').forEach(el => {
    el.addEventListener('click', () => CodexUI.setCodexTab(el.dataset.tab, _popupDeps));
  });

  // animate ring after paint
  requestAnimationFrame(() => {
    const fill = section.querySelector('.cx-ring-fill');
    if (fill) fill.style.strokeDashoffset = offset;
  });
}

function _catBar(label, seen, total, fillCls, tab) {
  const w = total > 0 ? Math.round((seen / total) * 100) : 0;
  return `
    <div class="cx-cat-item" data-tab="${tab}">
      <div class="cx-cat-header">
        <span class="cx-cat-label">${label}</span>
        <span class="cx-cat-nums"><span class="cx-cat-seen">${seen}</span>/${total}</span>
      </div>
      <div class="cx-cat-track">
        <div class="cx-cat-fill ${fillCls}" style="width:${w}%"></div>
      </div>
    </div>`;
}

/* ════════════════════════════════════════
   FILTER BAR
════════════════════════════════════════ */
function _renderFilterBar(doc, data) {
  const bar = doc.getElementById('cxFilterBar');
  if (!bar) return;

  // Clear existing content safely
  bar.textContent = '';

  const label = doc.createElement('span');
  label.className = 'cx-filter-label';
  label.textContent = 'FILTER';
  bar.appendChild(label);

  const defs = _filterDefs(data)[_codexTab] || [];
  defs.forEach(d => {
    if (!d) {
      const sep = doc.createElement('div');
      sep.className = 'cx-filter-sep';
      bar.appendChild(sep);
      return;
    }
    const btn = doc.createElement('button');
    btn.className = 'cx-filter-pill' + (_codexFilter === d.k ? ' ' + (d.c || 'f-all') : '');
    btn.textContent = d.l;
    btn.addEventListener('click', () => {
      _codexFilter = d.k;
      _renderFilterBar(doc, data);
      CodexUI.renderCodexContent(_popupDeps);
    });
    bar.appendChild(btn);
  });

  const endSep = doc.createElement('div');
  endSep.className = 'cx-filter-sep';
  bar.appendChild(endSep);

  const tog = doc.createElement('button');
  tog.className = 'cx-unknown-toggle';
  tog.innerHTML = `<span>미발견 표시</span><div class="cx-toggle-track ${_showUnknown ? 'on' : ''}"></div>`;
  tog.addEventListener('click', () => {
    _showUnknown = !_showUnknown;
    _renderFilterBar(doc, data);
    CodexUI.renderCodexContent(_popupDeps);
  });
  bar.appendChild(tog);
}

/* ════════════════════════════════════════
   SORT / FILTER LOGIC
════════════════════════════════════════ */
function _applyFilter(arr, codex, category) {
  let out = arr.slice();

  // search
  if (_codexSearch) out = out.filter(e => (e.name || '').toLowerCase().includes(_codexSearch));

  // tab filter
  if (_codexFilter.startsWith('set:')) {
    const setKey = _codexFilter.slice(4);
    out = out.filter(e => e.set === setKey);
  } else if (_codexFilter !== 'all') {
    out = out.filter(e => {
      // Enemy specific handling
      if (category === 'enemies') {
        if (_codexFilter === 'boss') return !!e.isBoss;
        if (_codexFilter === 'miniboss') return !!e.isMiniBoss;
        if (_codexFilter === 'elite') return !!e.isElite;
        if (_codexFilter === 'enemy') return !e.isBoss && !e.isElite && !e.isMiniBoss;
        return false;
      }
      // Default handling (cards, items)
      const type = String(e.type || '').toLowerCase();
      const rarity = String(e.rarity || '').toLowerCase();
      return type === _codexFilter || rarity === _codexFilter;
    });
  }

  // unknown visibility
  if (!_showUnknown) {
    const seen = codex[category] || new Set();
    out = out.filter(e => seen.has(e.id));
  }

  // sort
  const seenSet = codex[category] || new Set();
  if (_codexSort === 'name') {
    out.sort((a, b) => {
      if (!seenSet.has(a.id) && !seenSet.has(b.id)) return 0;
      if (!seenSet.has(a.id)) return 1;
      if (!seenSet.has(b.id)) return -1;
      return (a.name || '').localeCompare(b.name || '', 'ko');
    });
  } else if (_codexSort === 'rarity') {
    const ord = { legendary: 0, boss: 1, rare: 2, uncommon: 3, common: 4 };
    out.sort((a, b) => {
      if (!seenSet.has(a.id) && !seenSet.has(b.id)) return 0;
      if (!seenSet.has(a.id)) return 1;
      if (!seenSet.has(b.id)) return -1;
      return (ord[String(a.rarity || '').toLowerCase()] ?? 5) - (ord[String(b.rarity || '').toLowerCase()] ?? 5);
    });
  } else if (_codexSort === 'count') {
    out.sort((a, b) => {
      if (!seenSet.has(a.id) && !seenSet.has(b.id)) return 0;
      if (!seenSet.has(a.id)) return 1;
      if (!seenSet.has(b.id)) return -1;
      const ra = _getRecords(_popupDeps?.gs, category, a.id);
      const rb = _getRecords(_popupDeps?.gs, category, b.id);
      const va = ra ? (ra.kills ?? ra.used ?? ra.found ?? 0) : 0;
      const vb = rb ? (rb.kills ?? rb.used ?? rb.found ?? 0) : 0;
      return vb - va;
    });
  }
  return out;
}

/* ════════════════════════════════════════
   SECTION RENDERER
════════════════════════════════════════ */
function _renderSection(doc, container, title, icon, entries, cardFn, navList) {
  const sec = doc.createElement('div');
  sec.className = 'cx-section';

  const seenCount = entries.filter(e => ((_popupDeps?.gs?.meta?.codex?.enemies ||
    _popupDeps?.gs?.meta?.codex?.cards || _popupDeps?.gs?.meta?.codex?.items ||
    new Set()).has(e.id))).length;
  // count any seen for display
  const seenAll = entries.filter(e => {
    const c = _ensureCodex(_popupDeps?.gs);
    return c.enemies.has(e.id) || c.cards.has(e.id) || c.items.has(e.id);
  }).length;

  sec.innerHTML = `
    <div class="cx-section-hdr">
      <span class="cx-section-icon">${icon}</span>
      <span class="cx-section-title">${title}</span>
      <span class="cx-section-count">${seenAll} / ${entries.length}</span>
    </div>`;

  const grid = doc.createElement('div');
  grid.className = 'cx-grid';
  let idx = 0;
  entries.forEach(e => {
    const card = cardFn(e, idx++, navList, doc);
    grid.appendChild(card);
  });
  sec.appendChild(grid);
  container.appendChild(sec);
}

/* ════════════════════════════════════════
   BASE CARD FACTORY
════════════════════════════════════════ */
function _baseCard(doc, entry, typeClass, rarityClass, seen) {
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

/* ════════════════════════════════════════
   ENEMY CARD
════════════════════════════════════════ */
function _makeEnemyCard(e, idx, navList, doc) {
  const codex = _ensureCodex(_popupDeps?.gs);
  const seen = codex.enemies.has(e.id);
  const card = _baseCard(doc, e, _enemyTypeCls(e), '', seen);
  card.style.animationDelay = `${(idx % 12) * 0.03}s`;

  const rec = _getRecords(_popupDeps?.gs, 'enemies', e.id);
  const killsBadge = seen && rec ? `<div class="cx-record-badge">💀 ${rec.kills ?? 0}</div>` : '';
  const hintBadge = !seen && e.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${e.hint}</div></div>` : '';

  card.innerHTML += `
    <div class="cx-num">#${String(idx + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${_enemyBadgeCls(e)}">${_enemyTypeLabel(e)}</div>` : ''}
    <div class="cx-icon-area">
      <div class="cx-icon-bg"></div>
      ${seen ? `<div class="cx-icon">${e.icon || '?'}</div>` : `<div class="cx-silhouette">${e.icon || '?'}</div>`}
    </div>
    ${hintBadge}${killsBadge}
    <div class="cx-info">
      <div class="cx-name">${seen ? e.name : '???'}</div>
      <div class="cx-sub">${seen ? `HP ${e.maxHp ?? e.hp ?? 0} · ATK ${e.atk ?? 0}` : '미발견'}</div>
    </div>
    ${seen && e.isNew ? '<div class="cx-new-dot"></div>' : ''}
  `;

  if (seen) card.addEventListener('click', () => _openEnemyPopup(e, navList.filter(x => codex.enemies.has(x.id))));
  return card;
}

/* ════════════════════════════════════════
   CARD ENTRY
════════════════════════════════════════ */
function _makeCardEntry(c, idx, navList, doc) {
  const codex = _ensureCodex(_popupDeps?.gs);
  const seen = _isSeenCard(codex, c.id);
  const card = _baseCard(doc, c, `t-${String(c.type || 'skill').toLowerCase()}`, _rarityCardCls(c.rarity), seen);
  card.style.animationDelay = `${(idx % 12) * 0.03}s`;

  const rec = _getRecords(_popupDeps?.gs, 'cards', c.id);
  const usedBadge = seen && rec ? `<div class="cx-record-badge">✦ ${rec.used ?? 0}</div>` : '';
  const upgradeBadge = seen && rec?.upgradedDiscovered ? '<div class="cx-record-badge" style="right:auto;left:12px">+</div>' : '';
  const hintBadge = !seen && c.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${c.hint}</div></div>` : '';
  const rLabel = _rarityLabel(c.rarity);

  card.innerHTML += `
    <div class="cx-num">#${String(idx + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${_cardTypeCls(c.type)}">${_cardTypeLabel(c.type)}</div>` : ''}
    <div class="cx-icon-area">
      <div class="cx-icon-bg"></div>
      ${seen ? `<div class="cx-icon">${c.icon || '?'}</div>` : `<div class="cx-silhouette">${c.icon || '?'}</div>`}
    </div>
    ${hintBadge}${usedBadge}${upgradeBadge}
    <div class="cx-info">
      <div class="cx-name">${seen ? c.name : '???'}</div>
      <div class="cx-sub">${seen ? rLabel : '미발견'}</div>
      ${seen ? `<div class="cx-cost">${c.cost ?? 0}</div>` : ''}
    </div>
    ${seen && c.isNew ? '<div class="cx-new-dot"></div>' : ''}
  `;

  if (seen) card.addEventListener('click', () => _openCardPopup(c, navList.filter(x => _isSeenCard(codex, x.id))));
  return card;
}

/* ════════════════════════════════════════
   ITEM CARD
════════════════════════════════════════ */
function _makeItemCard(item, idx, navList, doc) {
  const codex = _ensureCodex(_popupDeps?.gs);
  const seen = codex.items.has(item.id);
  const setDef = item.set ? _getSets(_popupDeps?.data)[item.set] : null;
  const card = _baseCard(doc, item, 't-item',
    item.rarity === 'legendary' || item.rarity === 'boss' ? 'r-legendary' : _rarityCardCls(item.rarity), seen);
  card.style.animationDelay = `${(idx % 12) * 0.03}s`;
  if (setDef && seen) card.style.setProperty('--cx-card-border', setDef.border || 'rgba(0,255,204,.2)');

  const hintBadge = !seen && item.hint ? `<div class="cx-hint-badge"><div class="cx-hint-inner">${item.hint}</div></div>` : '';

  card.innerHTML += `
    <div class="cx-num">#${String(idx + 1).padStart(3, '0')}</div>
    ${seen ? `<div class="cx-badge ${_rarityBadgeCls(item.rarity)}">${_rarityLabel(item.rarity)}</div>` : ''}
    ${seen && item.set ? `<div class="cx-badge b-set" style="top:26px;">세트</div>` : ''}
    <div class="cx-icon-area">
      <div class="cx-icon-bg"></div>
      ${seen ? `<div class="cx-icon">${item.icon || '?'}</div>` : `<div class="cx-silhouette">${item.icon || '?'}</div>`}
    </div>
    ${hintBadge}
    <div class="cx-info">
      <div class="cx-name">${seen ? item.name : '???'}</div>
      <div class="cx-sub">${seen ? (setDef ? `◈ ${setDef.name}` : _rarityLabel(item.rarity) + ' 등급') : '미발견'}</div>
    </div>
    ${seen && item.isNew ? '<div class="cx-new-dot"></div>' : ''}
    ${seen && setDef ? `<div class="cx-set-pip" style="--set-color:${setDef.color}"></div><div class="cx-set-ribbon" style="--set-color:${setDef.color}"></div>` : ''}
  `;

  if (seen) card.addEventListener('click', () => _openItemPopup(item, navList.filter(x => codex.items.has(x.id))));
  return card;
}

/* ════════════════════════════════════════
   SET VIEW (유물 탭 상단)
════════════════════════════════════════ */
function _renderSetView(doc, container, data, gs) {
  const sets = _getSets(data);
  const items = Object.values(data.items || {});
  const codex = _ensureCodex(gs);

  Object.entries(sets).forEach(([key, def]) => {
    const setItems = (def.items || []).map(id => items.find(x => x.id === id)).filter(Boolean);
    const owned = setItems.filter(x => codex.items.has(x.id)).length;
    const total = setItems.length;
    const r = 17;
    const circ = 2 * Math.PI * r;
    const ratio = total > 0 ? (owned / total) : 0;
    const offset = circ - (circ * ratio);
    const isComplete = total > 0 && owned >= total;

    const block = doc.createElement('div');
    block.className = 'cx-set-block';
    block.style.setProperty('--sv-color', def.color || '#00ffcc');
    block.style.setProperty('--sv-border', def.border || 'rgba(0,255,204,.4)');
    block.style.setProperty('--sv-glow', def.glow || 'rgba(0,255,204,.15)');

    const itemsHtml = setItems.map(it => {
      const itSeen = codex.items.has(it.id);
      const hint = !itSeen && it.hint ? `<span class="cx-svi-hint">${it.hint}</span>` : '';
      return `<div class="cx-svi ${itSeen ? 'owned' : 'missing'}" data-item-id="${it.id}">
        <span class="cx-svi-icon">${itSeen ? (it.icon || '?') : '❔'}</span>
        <span class="cx-svi-name">${itSeen ? it.name : '???'}</span>
        ${hint}
      </div>`;
    }).join('');

    block.innerHTML = `
      <div class="cx-set-hdr">
        <span class="cx-set-icon">${def.icon || '◈'}</span>
        <span class="cx-set-name">${def.name}</span>
        <div class="cx-set-ring">
          <svg width="42" height="42" viewBox="0 0 42 42" style="transform:rotate(-90deg)">
            <circle fill="none" stroke="rgba(255,255,255,.07)" stroke-width="4" cx="21" cy="21" r="${r}"/>
            <circle fill="none" stroke="${def.color || '#00ffcc'}" stroke-width="4" stroke-linecap="round"
              cx="21" cy="21" r="${r}"
              stroke-dasharray="${circ.toFixed(1)}"
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
          ${isComplete
        ? ` · <span style="color:${def.color || '#00ffcc'};font-weight:600">세트 효과 활성화</span>`
        : ' · 세트 미완성'}
          <br>${def.effect || ''}
        </span>
      </div>
    `;

    // 보유 아이템 클릭 → 팝업
    block.querySelectorAll('.cx-svi.owned').forEach(el => {
      const itemId = el.dataset.itemId;
      const item = items.find(x => x.id === itemId);
      if (item) el.addEventListener('click', () => _openItemPopup(item, items.filter(x => codex.items.has(x.id))));
    });

    container.appendChild(block);
  });

  // 구분선
  if (Object.keys(sets).length > 0) {
    const div = doc.createElement('div');
    div.style.cssText = 'height:1px;background:rgba(255,255,255,.05);margin:8px 0 28px';
    container.appendChild(div);
  }
}

/* ════════════════════════════════════════
   POPUP HELPERS
════════════════════════════════════════ */
function _getPopupOverlay(doc) {
  let el = doc.getElementById('cxDetailPopup');
  if (!el) {
    el = doc.createElement('div');
    el.id = 'cxDetailPopup';
    el.className = 'cx-popup-overlay';
    el.innerHTML = '<div class="cx-popup-box" id="cxPopupBox"></div>';
    doc.body.appendChild(el);
    el.addEventListener('click', e => {
      if (e.target === el) _closePopup(doc);
    });
  }
  return el;
}

function _openPopup(doc) {
  const el = _getPopupOverlay(doc);
  el.classList.add('open');
}

function _closePopup(doc) {
  _getPopupOverlay(doc)?.classList.remove('open');
  _popupOpenFn = null;
}

function _setPopupTheme(doc, bg1, bg2, border, glow) {
  const b = doc.getElementById('cxPopupBox');
  if (!b) return;
  b.style.setProperty('--pb1', bg1);
  b.style.setProperty('--pb2', bg2);
  b.style.setProperty('--pb-border', border);
  b.style.setProperty('--pb-glow', glow);
}

function _quoteBlock(quote) {
  if (!quote) return '';
  return `<div class="cx-popup-quote"><div class="cx-popup-quote-text">${quote}</div></div>`;
}

function _setPopupBlock(item, data) {
  if (!item.set) return '';
  const def = _getSets(data)[item.set];
  if (!def) return '';
  const items = Object.values(data.items || {});
  const codex = _ensureCodex(_popupDeps?.gs);
  const owned = (def.items || []).filter(pid => codex.items.has(pid)).length;
  const total = (def.items || []).length;
  const piecesHtml = (def.items || []).map(pid => {
    const p = items.find(x => x.id === pid);
    if (!p) return '';
    return `<div class="cx-set-piece ${codex.items.has(pid) ? 'owned' : 'missing'}">
      <div class="cx-set-dot"></div><span>${codex.items.has(pid) ? p.name : '???'}</span>
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

function _recordBlock(gs, category, id) {
  const rec = _getRecords(gs, category, id);
  if (!rec) return '';
  if (category === 'enemies') {
    return `<div class="cx-popup-recs">
      <div class="cx-prec"><div class="cx-prec-icon">👁️</div><div class="cx-prec-info"><div class="cx-prec-label">조우 횟수</div><div class="cx-prec-val" style="color:#88ccff">${rec.encounters ?? 0}회</div></div></div>
      <div class="cx-prec"><div class="cx-prec-icon">💀</div><div class="cx-prec-info"><div class="cx-prec-label">처치 횟수</div><div class="cx-prec-val" style="color:#ff8899">${rec.kills ?? 0}회</div></div></div>
      <div class="cx-prec"><div class="cx-prec-icon">📖</div><div class="cx-prec-info"><div class="cx-prec-label">첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${rec.firstSeen || '-'}</div></div></div>
    </div>`;
  }
  if (category === 'cards') {
    return `<div class="cx-popup-recs">
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">✦</div><div class="cx-prec-info"><div class="cx-prec-label">사용 횟수</div><div class="cx-prec-val" style="color:#88ccff">${rec.used ?? 0}회</div></div></div>
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">📖</div><div class="cx-prec-info"><div class="cx-prec-label">첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${rec.firstSeen || '-'}</div></div></div>
    </div>`;
  }
  if (category === 'items') {
    return `<div class="cx-popup-recs">
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">💎</div><div class="cx-prec-info"><div class="cx-prec-label">획득 횟수</div><div class="cx-prec-val" style="color:#88ccff">${rec.found ?? 0}회</div></div></div>
      <div class="cx-prec" style="flex:2"><div class="cx-prec-icon">📖</div><div class="cx-prec-info"><div class="cx-prec-label">첫 발견</div><div class="cx-prec-val" style="color:var(--cx-gold)">${rec.firstSeen || '-'}</div></div></div>
    </div>`;
  }
  return '';
}

function _navBlock() {
  if (!_popupList || _popupList.length <= 1) return '';
  const hasPrev = _popupIdx > 0;
  const hasNext = _popupIdx < _popupList.length - 1;
  const prev = hasPrev ? _popupList[_popupIdx - 1] : null;
  const next = hasNext ? _popupList[_popupIdx + 1] : null;
  return `
    <div class="cx-popup-nav">
      <button class="cx-popup-nav-btn" id="cxNavPrev" ${!hasPrev ? 'disabled' : ''}>
        <span>←</span><span class="cx-popup-nav-name">${prev ? (prev.name || '???') : ''}</span>
      </button>
      <span class="cx-popup-nav-pos">${_popupIdx + 1} / ${_popupList.length}</span>
      <button class="cx-popup-nav-btn" id="cxNavNext" ${!hasNext ? 'disabled' : ''} style="flex-direction:row-reverse">
        <span>→</span><span class="cx-popup-nav-name">${next ? (next.name || '???') : ''}</span>
      </button>
    </div>`;
}

function _bindNavButtons(doc, openFn) {
  _popupOpenFn = openFn;
  doc.getElementById('cxNavPrev')?.addEventListener('click', () => _navPopup(-1, openFn));
  doc.getElementById('cxNavNext')?.addEventListener('click', () => _navPopup(1, openFn));
}

function _navPopup(dir, openFn) {
  if (typeof openFn !== 'function') return;
  const newIdx = _popupIdx + dir;
  if (newIdx < 0 || newIdx >= _popupList.length) return;
  _popupIdx = newIdx;
  openFn(_popupList[_popupIdx], _popupList, _popupIdx);
}

/* ════════════════════════════════════════
   OPEN POPUP FUNCTIONS
════════════════════════════════════════ */
function _openEnemyPopup(e, list, idx) {
  if (list !== undefined) { _popupList = list; _popupIdx = list.indexOf(e); }
  const doc = _getDoc(_popupDeps);
  _getPopupOverlay(doc); // ensure exists

  const tc = {
    boss: { bg1: '#16100a', border: 'rgba(240,180,41,.3)', glow: 'rgba(240,180,41,.1)' },
    miniboss: { bg1: '#160806', border: 'rgba(255,107,74,.3)', glow: 'rgba(255,107,74,.1)' },
    elite: { bg1: '#12081c', border: 'rgba(192,132,252,.3)', glow: 'rgba(192,132,252,.1)' },
    enemy: { bg1: '#140810', border: 'rgba(255,51,102,.25)', glow: 'rgba(255,51,102,.08)' },
  };
  const t = e.isBoss ? tc.boss : e.isMiniBoss ? tc.miniboss : e.isElite ? tc.elite : tc.enemy;
  _setPopupTheme(doc, t.bg1, '#08080f', t.border, t.glow);

  doc.getElementById('cxPopupBox').innerHTML = `
    <button class="cx-popup-close" id="cxPopupClose">✕</button>
    <div class="cx-popup-hdr">
      <div class="cx-popup-icon-frame">${e.icon || '?'}</div>
      <div class="cx-popup-hdr-info">
        <div class="cx-popup-tags">
          <span class="cx-badge ${_enemyBadgeCls(e)}" style="position:static">${_enemyTypeLabel(e)}</span>
          ${e.region ? `<span class="cx-badge b-item" style="position:static">${e.region}</span>` : ''}
        </div>
        <div class="cx-popup-name">${e.name}</div>
        <div class="cx-popup-sub">${e.drops ? `격퇴 시 ${e.drops}` : `골드 ${e.gold ?? 0}`}</div>
      </div>
    </div>
    <div class="cx-popup-divider"></div>
    <div class="cx-popup-stats">
      <div class="cx-pstat"><div class="cx-pstat-label">HP</div><div class="cx-pstat-val">${e.maxHp ?? e.hp ?? 0}</div></div>
      <div class="cx-pstat"><div class="cx-pstat-label">ATK</div><div class="cx-pstat-val">${e.atk ?? 0}</div></div>
      <div class="cx-pstat"><div class="cx-pstat-label">골드</div><div class="cx-pstat-val">${e.gold ?? 0}</div></div>
    </div>
    ${_recordBlock(_popupDeps?.gs, 'enemies', e.id)}
    <div class="cx-popup-desc">${_safeHtml(e.desc || '')}</div>
    ${_quoteBlock(e.quote)}
    ${_navBlock()}
  `;

  doc.getElementById('cxPopupClose')?.addEventListener('click', () => _closePopup(doc));
  _bindNavButtons(doc, _openEnemyPopup);
  _openPopup(doc);
}

function _openCardPopup(c, list, idx) {
  if (list !== undefined) { _popupList = list; _popupIdx = list.indexOf(c); }
  const doc = _getDoc(_popupDeps);
  _getPopupOverlay(doc);

  const tc = {
    legendary: { bg1: '#12081c', border: 'rgba(192,132,252,.32)', glow: 'rgba(192,132,252,.1)' },
    rare: { bg1: '#100c06', border: 'rgba(240,180,41,.28)', glow: 'rgba(240,180,41,.1)' },
    attack: { bg1: '#140810', border: 'rgba(255,51,102,.25)', glow: 'rgba(255,51,102,.08)' },
    skill: { bg1: '#080c16', border: 'rgba(80,180,255,.25)', glow: 'rgba(80,180,255,.08)' },
    power: { bg1: '#100c06', border: 'rgba(240,180,41,.25)', glow: 'rgba(240,180,41,.08)' },
  };
  const r = String(c.rarity || '').toLowerCase();
  const theme = r === 'legendary' ? tc.legendary : r === 'rare' ? tc.rare : tc[String(c.type || '').toLowerCase()] || tc.skill;
  _setPopupTheme(doc, theme.bg1, '#08080f', theme.border, theme.glow);

  const rLabel = _rarityLabel(c.rarity);
  const rBadge = r === 'legendary' ? 'b-legendary' : r === 'rare' ? 'b-rare' : 'b-item';
  const upgradeCard = _getCardUpgradeEntry(_popupDeps?.data, c.id);
  const rec = _getRecords(_popupDeps?.gs, 'cards', c.id);
  const upgradeBlock = upgradeCard ? `
    <div class="cx-popup-divider"></div>
    <div class="cx-popup-sub" style="margin-bottom:10px">${rec?.upgradedDiscovered ? '강화 카드 발견' : '강화 카드 미발견'}</div>
    <div class="cx-popup-desc" style="margin-top:0">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px">
        <span class="cx-badge ${_cardTypeCls(upgradeCard.type)}" style="position:static">${upgradeCard.name}</span>
        <span class="cx-badge ${rBadge}" style="position:static">${upgradeCard.cost ?? 0} cost</span>
      </div>
      ${rec?.upgradedDiscovered
      ? _safeHtml(upgradeCard.desc || '')
      : '<span style="opacity:.72">강화 버전은 아직 도감에 기록되지 않았습니다.</span>'}
      ${rec?.upgradedDiscovered
      ? `<div style="margin-top:10px;color:#88ccff;font-size:12px">강화 사용 횟수 ${rec.upgradeUsed ?? 0}회</div>`
      : ''}
    </div>
  ` : '';

  doc.getElementById('cxPopupBox').innerHTML = `
    <button class="cx-popup-close" id="cxPopupClose">✕</button>
    <div class="cx-popup-hdr">
      <div class="cx-popup-icon-frame">${c.icon || '?'}</div>
      <div class="cx-popup-hdr-info">
        <div class="cx-popup-tags">
          <span class="cx-badge ${_cardTypeCls(c.type)}" style="position:static">${_cardTypeLabel(c.type)}</span>
          <span class="cx-badge ${rBadge}" style="position:static">${rLabel}</span>
        </div>
        <div class="cx-popup-name">${c.name}</div>
        <div class="cx-popup-sub">에너지 비용 ${c.cost ?? 0}</div>
      </div>
    </div>
    <div class="cx-popup-divider"></div>
    ${_recordBlock(_popupDeps?.gs, 'cards', c.id)}
    <div class="cx-popup-desc">${_safeHtml(c.desc || '')}</div>
    ${upgradeBlock}
    ${_quoteBlock(c.quote)}
    ${_navBlock()}
  `;

  doc.getElementById('cxPopupClose')?.addEventListener('click', () => _closePopup(doc));
  _bindNavButtons(doc, _openCardPopup);
  _openPopup(doc);
}

function _openItemPopup(item, list, idx) {
  if (list !== undefined) { _popupList = list; _popupIdx = list.indexOf(item); }
  const doc = _getDoc(_popupDeps);
  const data = _popupDeps?.data;
  const setDef = item.set ? _getSets(data)[item.set] : null;
  _getPopupOverlay(doc);

  const border = setDef?.border || 'rgba(0,255,204,.2)';
  const glow = setDef?.glow || 'rgba(0,255,204,.07)';
  _setPopupTheme(doc, setDef ? '#0e0a1e' : '#0c0a1a', '#08080f', border, glow);

  const rLabel = _rarityLabel(item.rarity);
  const rBadge = _rarityBadgeCls(item.rarity);

  doc.getElementById('cxPopupBox').innerHTML = `
    <button class="cx-popup-close" id="cxPopupClose">✕</button>
    <div class="cx-popup-hdr">
      <div class="cx-popup-icon-frame">${item.icon || '?'}</div>
      <div class="cx-popup-hdr-info">
        <div class="cx-popup-tags">
          <span class="cx-badge b-item" style="position:static">유물</span>
          <span class="cx-badge ${rBadge}" style="position:static">${rLabel}</span>
          ${item.set ? `<span class="cx-badge b-set" style="position:static">세트</span>` : ''}
        </div>
        <div class="cx-popup-name">${item.name}</div>
        <div class="cx-popup-sub">${rLabel} 등급 유물</div>
      </div>
    </div>
    <div class="cx-popup-divider"></div>
    ${_recordBlock(_popupDeps?.gs, 'items', item.id)}
    <div class="cx-popup-desc">${_safeHtml(item.desc || '')}</div>
    ${_quoteBlock(item.quote)}
    ${_setPopupBlock(item, data)}
    ${_navBlock()}
  `;

  doc.getElementById('cxPopupClose')?.addEventListener('click', () => _closePopup(doc));
  _bindNavButtons(doc, _openItemPopup);
  _openPopup(doc);
}

/* ════════════════════════════════════════
   TAB BUTTON STATE
════════════════════════════════════════ */
function _setTabState(doc, tab) {
  ['enemies', 'cards', 'items', 'inscriptions'].forEach(t => {
    doc.getElementById(`codexTab_${t}`)?.classList.toggle('active', t === tab);
  });
}

/* ════════════════════════════════════════
   PUBLIC API
════════════════════════════════════════ */
export const CodexUI = {

  openCodex(deps = {}) {
    _ensureCodex(deps.gs);
    _popupDeps = deps;
    _codexTab = 'enemies';
    _codexFilter = 'all';
    _codexSearch = '';
    _codexSort = 'default';
    _showUnknown = true;
    _isTransitioning = false;

    const doc = _getDoc(deps);
    const modal = doc.getElementById('codexModal');
    if (modal) {
      modal.classList.remove('fade-out');
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
    }

    _injectModalStructure(doc, deps);
    _renderProgress(doc, deps.gs, deps.data);
    _setTabState(doc, _codexTab);
    _renderFilterBar(doc, deps.data);
    this.renderCodexContent(deps);
  },

  closeCodex(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('codexModal');
    if (!modal) return;
    _closePopup(doc);
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');
    const onEnd = () => {
      modal.style.display = 'none';
      modal.classList.remove('fade-out');
      modal.removeEventListener('animationend', onEnd);
    };
    modal.addEventListener('animationend', onEnd);
    setTimeout(() => { if (modal.style.display !== 'none') onEnd(); }, 300);
  },

  setCodexTab(tab, deps = {}) {
    if (tab === _codexTab && !deps._force) return;
    _popupDeps = deps;
    _codexFilter = 'all';
    _codexSearch = '';

    const doc = _getDoc(deps);
    const searchInput = doc.getElementById('cxSearch');
    if (searchInput) searchInput.value = '';

    if (_isTransitioning) {
      _codexTab = tab;
      _setTabState(doc, tab);
      _renderFilterBar(doc, deps.data);
      this.renderCodexContent(deps);
      return;
    }

    _isTransitioning = true;
    _codexTab = tab;
    _setTabState(doc, tab);

    const content = doc.getElementById('codexContent');
    if (!content) {
      _renderFilterBar(doc, deps.data);
      this.renderCodexContent(deps);
      _isTransitioning = false;
      return;
    }

    content.classList.add('cx-tab-exit');
    const onExit = () => {
      content.classList.remove('cx-tab-exit');
      content.removeEventListener('animationend', onExit);
      _renderFilterBar(doc, deps.data);
      this.renderCodexContent(deps);
      content.classList.add('cx-tab-enter');
      const onEnter = () => {
        content.classList.remove('cx-tab-enter');
        content.removeEventListener('animationend', onEnter);
        _isTransitioning = false;
      };
      content.addEventListener('animationend', onEnter);
    };
    content.addEventListener('animationend', onExit);
  },

  renderCodexContent(deps = {}) {
    _popupDeps = deps;
    const { gs, data } = deps;
    if (!gs || !data) return;

    const doc = _getDoc(deps);
    const content = doc.getElementById('codexContent');
    if (!content) return;

    const codex = _ensureCodex(gs);
    content.textContent = '';

    const enemies = Object.values(data.enemies || {});
    const cards = _getBaseCards(data);
    const items = Object.values(data.items || {});
    const inscriptions = Object.values(data.inscriptions || {});

    if (_codexTab === 'enemies') {
      const secs = [
        { title: '일반 적', icon: '👾', filter: e => !e.isBoss && !e.isElite && !e.isMiniBoss },
        { title: '정예 적', icon: '🔥', filter: e => !!e.isElite && !e.isBoss },
        { title: '중간 보스', icon: '👹', filter: e => !!e.isMiniBoss },
        { title: '보스', icon: '👑', filter: e => !!e.isBoss },
      ];
      let any = false;
      secs.forEach(s => {
        const entries = _applyFilter(enemies.filter(s.filter), codex, 'enemies');
        if (!entries.length) return;
        any = true;
        _renderSection(doc, content, s.title, s.icon, entries, _makeEnemyCard, entries);
      });
      if (!any) _renderEmpty(doc, content);
    }

    else if (_codexTab === 'cards') {
      const secs = [
        { title: '공격 카드', icon: '⚔️', filter: c => String(c.type || '').toUpperCase() === 'ATTACK' },
        { title: '스킬 카드', icon: '🛡️', filter: c => String(c.type || '').toUpperCase() === 'SKILL' },
        { title: '파워 카드', icon: '⚡', filter: c => String(c.type || '').toUpperCase() === 'POWER' },
      ];
      let any = false;
      secs.forEach(s => {
        const entries = _applyFilter(_getBaseCards(data).filter(s.filter), codex, 'cards');
        if (!entries.length) return;
        any = true;
        _renderSection(doc, content, s.title, s.icon, entries, _makeCardEntry, entries);
      });
      if (!any) _renderEmpty(doc, content);
    }

    else if (_codexTab === 'items') {
      if (_codexFilter === 'all' && !_codexSearch) {
        _renderSetView(doc, content, data, gs);
      }
      const entries = _applyFilter(items, codex, 'items');
      if (!entries.length) { _renderEmpty(doc, content); return; }
      _renderSection(doc, content, '전체 유물', '💎', entries, _makeItemCard, entries);
    }

    else if (_codexTab === 'inscriptions') {
      const seenEntries = inscriptions.filter(i => Number(gs.meta?.inscriptions?.[i.id] || 0) > 0);
      const unseenEntries = inscriptions.filter(i => Number(gs.meta?.inscriptions?.[i.id] || 0) <= 0);
      // simple render (각인은 기존 방식 유지 가능, 필요하면 확장)
      if (!seenEntries.length && !unseenEntries.length) {
        _renderEmpty(doc, content, '각인을 발견하면 이곳에 기록됩니다');
        return;
      }
      [{ title: '해금됨', icon: '✨', list: seenEntries }, { title: '미해금', icon: '🌑', list: unseenEntries }].forEach(s => {
        if (!s.list.length) return;
        const sec = doc.createElement('div'); sec.className = 'cx-section';
        sec.innerHTML = `<div class="cx-section-hdr"><span class="cx-section-icon">${s.icon}</span><span class="cx-section-title">${s.title}</span><span class="cx-section-count">${s.list.length}</span></div>`;
        const grid = doc.createElement('div'); grid.className = 'cx-grid';
        s.list.forEach((ins, idx) => {
          const unlocked = s.title === '해금됨';
          const card = doc.createElement('article');
          card.className = `cx-card t-item${unlocked ? '' : ' is-unknown'}`;
          card.style.animationDelay = `${(idx % 12) * 0.03}s`;
          card.innerHTML = `
            <div class="cx-num">#${String(idx + 1).padStart(3, '0')}</div>
            <div class="cx-icon-area"><div class="cx-icon-bg"></div>
              ${unlocked ? `<div class="cx-icon">${ins.icon || '✨'}</div>` : `<div class="cx-silhouette">${ins.icon || '✨'}</div>`}
            </div>
            <div class="cx-info">
              <div class="cx-name">${unlocked ? ins.name : '???'}</div>
              <div class="cx-sub">${unlocked ? `Lv.${gs.meta?.inscriptions?.[ins.id] ?? 0}` : '미해금'}</div>
            </div>`;
          grid.appendChild(card);
        });
        sec.appendChild(grid);
        content.appendChild(sec);
      });
    }

    // 진행도 갱신
    _renderProgress(doc, gs, data);
  },
};

function _renderEmpty(doc, container, msg = '검색 결과가 없습니다') {
  container.innerHTML = `<div class="cx-empty-state"><div class="cx-empty-icon">🔍</div><div class="cx-empty-text">${msg}</div></div>`;
}

/* ════════════════════════════════════════
   KEYBOARD NAV (모달이 열린 동안)
════════════════════════════════════════ */
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', e => {
    const popup = document.getElementById('cxDetailPopup');
    if (!popup?.classList.contains('open')) return;
    if (e.key === 'Escape') { _closePopup(document); }
    if (e.key === 'ArrowRight') { _navPopup(1, _popupOpenFn); }
    if (e.key === 'ArrowLeft') { _navPopup(-1, _popupOpenFn); }
  });
}
