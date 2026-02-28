import { DescriptionUtils } from '../../utils/description_utils.js';


let _deckFilterType = 'all';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const DeckModalUI = {
  resetFilter() {
    _deckFilterType = 'all';
  },

  showDeckView(deps = {}) {
    this.renderDeckModal(deps);
    const doc = _getDoc(deps);
    const modal = doc.getElementById('deckViewModal');
    if (modal) modal.style.display = 'block';
  },

  renderDeckModal(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.player || !data?.cards) return;

    const doc = _getDoc(deps);
    const modal = doc.getElementById('deckViewModal');
    if (!modal) return;

    const deckCards = gs.player.deck ? [...gs.player.deck] : [];
    const handCards = gs.player.hand ? [...gs.player.hand] : [];
    const graveCards = gs.player.graveyard ? [...gs.player.graveyard] : [];
    const allCards = [...deckCards, ...handCards, ...graveCards];

    const bar = doc.getElementById('deckStatusBar');
    if (bar) {
      bar.textContent = '';
      const createPart = (label, value, color) => {
        const s = doc.createElement('span');
        s.style.color = color;
        s.textContent = `${label} `;
        const b = doc.createElement('b');
        b.textContent = value;
        s.appendChild(b);
        return s;
      };
      const sep = () => {
        const s = doc.createElement('span');
        s.style.opacity = '0.3';
        s.textContent = ' / ';
        return s;
      };
      bar.append(
        createPart('덱', deckCards.length, 'var(--echo)'),
        sep(),
        createPart('손패', handCards.length, 'var(--cyan)'),
        sep(),
        createPart('무덤', graveCards.length, 'var(--text-dim)')
      );
    }

    const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
    const countMap = {};
    allCards.forEach(id => { countMap[id] = (countMap[id] || 0) + 1; });
    const rarityBorder = {
      rare: 'rgba(240,180,41,0.35)',
      uncommon: 'rgba(123,47,255,0.35)',
      legendary: 'rgba(192,132,252,0.45)',
      common: 'var(--border)',
    };

    const sorted = Object.entries(countMap).sort(([a], [b]) => {
      const ra = rarityOrder[data.cards[a]?.rarity || 'common'] ?? 3;
      const rb = rarityOrder[data.cards[b]?.rarity || 'common'] ?? 3;
      return ra - rb;
    }).filter(([id]) => {
      if (_deckFilterType === 'all') return true;
      const card = data.cards[id];
      if (!card) return false;
      if (_deckFilterType === 'upgraded') return !!card.upgraded;
      return card.type === _deckFilterType;
    });

    const countEl = doc.getElementById('deckModalCount');
    if (countEl) countEl.textContent = allCards.length;

    const cardsEl = doc.getElementById('deckModalCards');
    if (!cardsEl) return;
    cardsEl.textContent = '';

    sorted.forEach(([id, cnt]) => {
      const card = data.cards[id];
      if (!card) return;
      const r = card.rarity || 'common';
      const bdr = rarityBorder[r];
      const typeColor = card.type === 'ATTACK' ? '#ff6688' : card.type === 'SKILL' ? '#66bbff' : card.type === 'POWER' ? 'var(--gold)' : 'var(--echo)';

      const el = doc.createElement('div');
      el.style.cssText = `position:relative;background:var(--glass);border:1px solid ${bdr};border-radius:16px;padding:16px 14px;width:160px;min-height:240px;display:flex;flex-direction:column;align-items:center;backdrop-filter:blur(16px);transition:all 0.15s;`;

      el.onmouseenter = (e) => {
        if (typeof window.showTooltip === 'function') window.showTooltip(e, id);
        el.style.transform = 'translateY(-6px)';
        el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.6)';
      };
      el.onmouseleave = () => {
        if (typeof window.hideTooltip === 'function') window.hideTooltip();
        el.style.transform = '';
        el.style.boxShadow = '';
      };

      const cost = doc.createElement('div');
      cost.style.cssText = "position:absolute;top:8px;left:8px;width:32px;height:32px;border-radius:50%;background:rgba(123,47,255,0.4);border:1px solid var(--echo);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--white);";
      cost.textContent = card.cost;
      el.appendChild(cost);

      if (cnt > 1) {
        const countBadge = doc.createElement('div');
        countBadge.style.cssText = "position:absolute;bottom:40px;right:10px;font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--cyan);font-weight:bold;";
        countBadge.textContent = `×${cnt}`;
        el.appendChild(countBadge);
      }

      if (handCards.includes(id)) {
        const tag = doc.createElement('div'); tag.className = 'card-location-tag';
        tag.style.cssText = 'position:absolute;top:4px;right:4px;font-size:7px;background:rgba(0,255,204,0.15);border-radius:3px;padding:1px 4px;color:var(--cyan);';
        tag.textContent = '손패'; el.appendChild(tag);
      } else if (graveCards.includes(id)) {
        const tag = doc.createElement('div'); tag.className = 'card-location-tag';
        tag.style.cssText = 'position:absolute;top:4px;right:4px;font-size:7px;background:rgba(123,47,255,0.15);border-radius:3px;padding:1px 4px;color:var(--echo);';
        tag.textContent = '무덤'; el.appendChild(tag);
      }

      const icon = doc.createElement('div'); icon.style.cssText = 'font-size:48px;margin:32px 0 12px;'; icon.textContent = card.icon; el.appendChild(icon);
      const name = doc.createElement('div'); name.style.cssText = "font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--white);text-align:center;margin-bottom:8px;line-height:1.2;"; name.textContent = card.name; el.appendChild(name);

      const desc = doc.createElement('div');
      desc.style.cssText = 'font-size:13px;color:var(--text);text-align:center;line-height:1.5;flex:1;';
      if (window.DescriptionUtils) {
        desc.innerHTML = window.DescriptionUtils.highlight(card.desc);
      } else {
        desc.textContent = card.desc;
      }
      el.appendChild(desc);

      const type = doc.createElement('div');
      type.style.cssText = `font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.1em;color:${typeColor};margin-top:8px;font-weight:bold;`;
      type.textContent = card.upgraded ? `${card.type} ✦` : card.type;
      if (card.upgraded) type.style.color = 'var(--cyan)';
      el.appendChild(type);

      cardsEl.appendChild(el);
    });
  },

  setDeckFilter(type, deps = {}) {
    _deckFilterType = type;
    const doc = _getDoc(deps);
    ['all', 'ATTACK', 'SKILL', 'POWER', 'upgraded'].forEach(t => {
      const btn = doc.getElementById(`deckFilter_${t}`);
      if (!btn) return;
      if (t === type) {
        btn.style.background = t === 'ATTACK' ? 'rgba(255,80,100,0.2)'
          : t === 'SKILL' ? 'rgba(80,180,255,0.2)'
            : t === 'POWER' ? 'rgba(240,180,41,0.15)'
              : t === 'upgraded' ? 'rgba(0,255,204,0.12)'
                : 'rgba(123,47,255,0.2)';
      } else {
        btn.style.background = 'transparent';
      }
    });
    this.renderDeckModal(deps);
  },

  closeDeckView(deps = {}) {
    const doc = deps?.doc || document;
    const modal = doc.getElementById('deckViewModal');
    if (modal) {
      modal.style.display = 'none';
    }
  },
};
