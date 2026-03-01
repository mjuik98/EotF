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
  btn.style.background = active ? 'rgba(0,255,204,0.12)' : 'transparent';
  btn.style.color = active ? 'var(--cyan)' : 'var(--text-dim)';
  btn.style.borderColor = active ? 'var(--cyan)' : 'var(--border)';
}

function _safeDescHtml(desc) {
  if (!desc) return '';
  if (typeof DescriptionUtils?.highlight === 'function') return DescriptionUtils.highlight(desc);
  return desc;
}

function _createCard(doc, { seen, icon, title, subtitle, desc, accent }) {
  const card = doc.createElement('div');
  card.style.cssText = `
    background:var(--glass);
    border:1px solid ${seen ? (accent || 'var(--border)') : 'rgba(60,60,80,0.35)'};
    border-radius:12px;
    padding:12px;
    width:170px;
    min-height:170px;
    display:flex;
    flex-direction:column;
    gap:8px;
  `;

  const iconEl = doc.createElement('div');
  iconEl.style.cssText = `font-size:34px;text-align:center;opacity:${seen ? '1' : '0.35'};`;
  iconEl.textContent = seen ? (icon || '?') : '?';

  const titleEl = doc.createElement('div');
  titleEl.style.cssText = `font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;`;
  titleEl.textContent = seen ? (title || 'Unknown') : 'Unknown';

  const subtitleEl = doc.createElement('div');
  subtitleEl.style.cssText = 'font-size:10px;color:var(--text-dim);text-align:center;';
  subtitleEl.textContent = subtitle || '';

  const descEl = doc.createElement('div');
  descEl.style.cssText = 'font-size:10px;color:var(--text);line-height:1.5;';
  if (seen) {
    descEl.innerHTML = _safeDescHtml(desc);
  } else {
    descEl.textContent = 'Discover this entry in a run.';
  }

  card.append(iconEl, titleEl, subtitleEl, descEl);
  return card;
}

function _renderCollection(doc, container, entries) {
  container.textContent = '';
  const grid = doc.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';
  entries.forEach((entry) => grid.appendChild(_createCard(doc, entry)));
  container.appendChild(grid);
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
      progressEl.textContent = `Enemies ${seenEnemies}/${enemies.length} | Cards ${seenCards}/${cards.length} | Items ${seenItems}/${items.length} | Inscriptions ${seenInscriptions}/${inscriptions.length} | Discovery ${pct}%`;
    }

    if (_codexTab === 'enemies') {
      _renderCollection(doc, contentEl, enemies.map((e) => ({
        seen: codex.enemies.has(e.id),
        icon: e.icon,
        title: e.name,
        subtitle: `${e.maxHp || e.hp || 0} HP | ${e.atk || 0} ATK`,
        desc: e.desc || `Gold ${e.gold || 0}, XP ${e.xp || 0}`,
        accent: e.isBoss ? 'rgba(240,180,41,0.5)' : 'rgba(255,51,102,0.35)',
      })));
      return;
    }

    if (_codexTab === 'cards') {
      _renderCollection(doc, contentEl, cards.map((c) => ({
        seen: codex.cards.has(c.id),
        icon: c.icon,
        title: c.name,
        subtitle: `${c.type || 'CARD'} | Cost ${c.cost ?? 0}`,
        desc: c.desc || '',
        accent: c.rarity === 'rare' ? 'rgba(240,180,41,0.45)' : 'rgba(123,47,255,0.35)',
      })));
      return;
    }

    if (_codexTab === 'items') {
      _renderCollection(doc, contentEl, items.map((i) => ({
        seen: codex.items.has(i.id),
        icon: i.icon,
        title: i.name,
        subtitle: i.rarity || 'common',
        desc: i.desc || '',
        accent: i.rarity === 'legendary' ? 'rgba(192,132,252,0.45)' : 'rgba(0,255,204,0.35)',
      })));
      return;
    }

    if (_codexTab === 'inscriptions') {
      _renderCollection(doc, contentEl, inscriptions.map((i) => {
        const level = Number(gs.meta?.inscriptions?.[i.id] || 0);
        return {
          seen: level > 0,
          icon: i.icon,
          title: i.name,
          subtitle: `Level ${level}${i.maxLevel ? ` / ${i.maxLevel}` : ''}`,
          desc: i.desc || '',
          accent: 'rgba(0,255,204,0.35)',
        };
      }));
    }
  },
};