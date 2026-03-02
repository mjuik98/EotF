import { DescriptionUtils } from '../../utils/description_utils.js';

let _codexTab = 'enemies';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _toSet(value) {
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  return new Set();
}

function _ensureCodex(gs) {
  if (!gs) return { enemies: new Set(), cards: new Set(), items: new Set() };
  if (!gs.meta) gs.meta = {};
  if (!gs.meta.codex) {
    gs.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
  }
  gs.meta.codex.enemies = _toSet(gs.meta.codex.enemies);
  gs.meta.codex.cards = _toSet(gs.meta.codex.cards);
  gs.meta.codex.items = _toSet(gs.meta.codex.items);
  return gs.meta.codex;
}

function _setTabButtonState(doc, tab, active) {
  const btn = doc.getElementById(`codexTab_${tab}`);
  if (!btn) return;
  if (active) btn.classList.add('active');
  else btn.classList.remove('active');
}

function _safeDescHtml(desc) {
  if (!desc) return '';
  if (typeof DescriptionUtils?.highlight === 'function') return DescriptionUtils.highlight(desc);
  return desc;
}

function _cardTypeLabel(type) {
  const t = String(type || '').toUpperCase();
  if (t === 'ATTACK') return '공격';
  if (t === 'SKILL') return '스킬';
  if (t === 'POWER') return '파워';
  return t || '기타';
}

function _itemRarityLabel(rarity) {
  const r = String(rarity || 'common').toLowerCase();
  if (r === 'legendary') return '전설';
  if (r === 'rare') return '희귀';
  if (r === 'uncommon') return '고급';
  return '일반';
}

function _createEntryCard(doc, entry) {
  const card = doc.createElement('article');
  card.className = `codex-entry${entry.seen ? '' : ' is-unknown'}`;
  if (entry.rarityClass) card.classList.add(entry.rarityClass);
  if (entry.accent) card.style.setProperty('--codex-accent', entry.accent);

  const iconEl = doc.createElement('div');
  iconEl.className = 'codex-entry-icon';
  iconEl.textContent = entry.seen ? (entry.icon || '?') : '❔';

  const titleEl = doc.createElement('div');
  titleEl.className = 'codex-entry-title';
  titleEl.textContent = entry.seen ? (entry.title || '미확인') : '미확인';

  const subtitleEl = doc.createElement('div');
  subtitleEl.className = 'codex-entry-subtitle';
  subtitleEl.textContent = entry.subtitle || '';

  const descEl = doc.createElement('div');
  descEl.className = 'codex-entry-desc';
  if (entry.seen) {
    descEl.innerHTML = _safeDescHtml(entry.desc);
  } else {
    descEl.textContent = '런에서 발견하면 상세 정보가 표시됩니다.';
  }

  card.append(iconEl, titleEl, subtitleEl, descEl);
  return card;
}

function _createSection(doc, title, entries) {
  const section = doc.createElement('section');
  section.className = 'codex-section';

  const heading = doc.createElement('h3');
  heading.className = 'codex-section-title';
  heading.textContent = title;

  const grid = doc.createElement('div');
  grid.className = 'codex-grid';

  if (!entries.length) {
    const empty = doc.createElement('div');
    empty.className = 'codex-empty';
    empty.textContent = '표시할 항목이 없습니다.';
    grid.appendChild(empty);
  } else {
    entries.forEach((entry) => grid.appendChild(_createEntryCard(doc, entry)));
  }

  section.append(heading, grid);
  return section;
}

function _renderSections(doc, container, sections) {
  container.textContent = '';
  const frag = doc.createDocumentFragment();
  sections.forEach((section) => {
    frag.appendChild(_createSection(doc, section.title, section.entries));
  });
  container.appendChild(frag);
}

function _toEnemyEntry(codex, e) {
  return {
    seen: codex.enemies.has(e.id),
    icon: e.icon,
    title: e.name,
    subtitle: `HP ${e.maxHp || e.hp || 0} · ATK ${e.atk || 0}`,
    desc: e.desc || `보상: ${e.gold || 0} 골드 / ${e.xp || 0} EXP`,
    accent: e.isBoss ? 'rgba(240,180,41,0.5)' : e.isElite ? 'rgba(192,132,252,0.5)' : 'rgba(255,51,102,0.35)',
  };
}

function _toCardEntry(codex, c) {
  const rarity = String(c.rarity || 'common').toLowerCase();
  return {
    seen: codex.cards.has(c.id),
    icon: c.icon,
    title: c.name,
    subtitle: `${_cardTypeLabel(c.type)} · 비용 ${c.cost ?? 0}`,
    desc: c.desc || '설명 없음',
    accent: rarity === 'legendary'
      ? 'rgba(192,132,252,0.5)'
      : rarity === 'rare'
        ? 'rgba(240,180,41,0.45)'
        : rarity === 'uncommon'
          ? 'rgba(123,47,255,0.4)'
          : 'rgba(110,130,180,0.35)',
    rarityClass: `rarity-${rarity}`,
  };
}

function _toItemEntry(codex, i) {
  const rarity = String(i.rarity || 'common').toLowerCase();
  return {
    seen: codex.items.has(i.id),
    icon: i.icon,
    title: i.name,
    subtitle: _itemRarityLabel(rarity),
    desc: i.desc || '설명 없음',
    accent: rarity === 'legendary'
      ? 'rgba(192,132,252,0.55)'
      : rarity === 'rare'
        ? 'rgba(240,180,41,0.5)'
        : rarity === 'uncommon'
          ? 'rgba(0,255,204,0.45)'
          : 'rgba(140,160,200,0.35)',
    rarityClass: `rarity-${rarity}`,
  };
}

function _toInscriptionEntry(gs, i) {
  const level = Number(gs.meta?.inscriptions?.[i.id] || 0);
  const isUnlocked = level > 0;
  return {
    seen: isUnlocked,
    icon: i.icon,
    title: i.name,
    subtitle: `레벨 ${level}${i.maxLevel ? ` / ${i.maxLevel}` : ''}`,
    desc: i.desc || '설명 없음',
    accent: isUnlocked ? 'rgba(0,255,204,0.45)' : 'rgba(100,110,150,0.3)',
  };
}

export const CodexUI = {
  openCodex(deps = {}) {
    const gs = deps.gs;
    _ensureCodex(gs);

    const doc = _getDoc(deps);
    const modal = doc.getElementById('codexModal');
    if (modal) modal.style.display = 'block';

    this.setCodexTab('enemies', deps);
  },

  closeCodex(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('codexModal');
    if (modal) modal.style.display = 'none';
  },

  setCodexTab(tab, deps = {}) {
    _codexTab = tab;
    const doc = _getDoc(deps);
    ['enemies', 'cards', 'items', 'inscriptions'].forEach((name) => {
      _setTabButtonState(doc, name, name === tab);
    });
    this.renderCodexContent(deps);
  },

  renderCodexContent(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs || !data) return;

    const codex = _ensureCodex(gs);
    const doc = _getDoc(deps);
    const progressEl = doc.getElementById('codexProgress');
    const contentEl = doc.getElementById('codexContent');
    if (!contentEl) return;

    const enemies = Object.values(data.enemies || {});
    const cards = Object.values(data.cards || {});
    const items = Object.values(data.items || {});
    const inscriptions = Object.values(data.inscriptions || {});

    const seenEnemies = enemies.filter((e) => codex.enemies.has(e.id)).length;
    const seenCards = cards.filter((c) => codex.cards.has(c.id)).length;
    const seenItems = items.filter((i) => codex.items.has(i.id)).length;
    const seenInscriptions = inscriptions.filter((i) => Number(gs.meta?.inscriptions?.[i.id] || 0) > 0).length;

    const totalAll = enemies.length + cards.length + items.length + inscriptions.length;
    const seenAll = seenEnemies + seenCards + seenItems + seenInscriptions;
    const pct = totalAll > 0 ? Math.round((seenAll / totalAll) * 100) : 0;

    if (progressEl) {
      progressEl.textContent = `진행도 ${pct}% · 적 ${seenEnemies}/${enemies.length} · 카드 ${seenCards}/${cards.length} · 유물 ${seenItems}/${items.length} · 각인 ${seenInscriptions}/${inscriptions.length}`;
    }

    if (_codexTab === 'enemies') {
      const normal = enemies.filter((e) => !e.isElite && !e.isBoss).map((e) => _toEnemyEntry(codex, e));
      const elite = enemies.filter((e) => e.isElite).map((e) => _toEnemyEntry(codex, e));
      const boss = enemies.filter((e) => e.isBoss).map((e) => _toEnemyEntry(codex, e));
      _renderSections(doc, contentEl, [
        { title: '일반 적', entries: normal },
        { title: '정예 적', entries: elite },
        { title: '보스', entries: boss },
      ]);
      return;
    }

    if (_codexTab === 'cards') {
      const attack = cards.filter((c) => String(c.type || '').toUpperCase() === 'ATTACK').map((c) => _toCardEntry(codex, c));
      const skill = cards.filter((c) => String(c.type || '').toUpperCase() === 'SKILL').map((c) => _toCardEntry(codex, c));
      const power = cards.filter((c) => String(c.type || '').toUpperCase() === 'POWER').map((c) => _toCardEntry(codex, c));
      const other = cards.filter((c) => !['ATTACK', 'SKILL', 'POWER'].includes(String(c.type || '').toUpperCase())).map((c) => _toCardEntry(codex, c));
      _renderSections(doc, contentEl, [
        { title: '공격 카드', entries: attack },
        { title: '스킬 카드', entries: skill },
        { title: '파워 카드', entries: power },
        { title: '기타', entries: other },
      ]);
      return;
    }

    if (_codexTab === 'items') {
      const legendary = items.filter((i) => String(i.rarity || '').toLowerCase() === 'legendary').map((i) => _toItemEntry(codex, i));
      const rare = items.filter((i) => String(i.rarity || '').toLowerCase() === 'rare').map((i) => _toItemEntry(codex, i));
      const uncommon = items.filter((i) => String(i.rarity || '').toLowerCase() === 'uncommon').map((i) => _toItemEntry(codex, i));
      const common = items.filter((i) => !['legendary', 'rare', 'uncommon'].includes(String(i.rarity || '').toLowerCase())).map((i) => _toItemEntry(codex, i));
      _renderSections(doc, contentEl, [
        { title: '전설 유물', entries: legendary },
        { title: '희귀 유물', entries: rare },
        { title: '고급 유물', entries: uncommon },
        { title: '일반 유물', entries: common },
      ]);
      return;
    }

    if (_codexTab === 'inscriptions') {
      const entries = inscriptions.map((i) => _toInscriptionEntry(gs, i));
      const unlocked = entries.filter((e) => e.seen);
      const locked = entries.filter((e) => !e.seen);
      _renderSections(doc, contentEl, [
        { title: '해금됨', entries: unlocked },
        { title: '미해금', entries: locked },
      ]);
    }
  },
};
