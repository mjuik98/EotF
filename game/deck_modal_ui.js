'use strict';

(function initDeckModalUI(globalObj) {
  let _deckFilterType = 'all';

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const DeckModalUI = {
    resetFilter() {
      _deckFilterType = 'all';
    },

    showDeckView(deps = {}) {
      this.renderDeckModal(deps);
      const doc = _getDoc(deps);
      doc.getElementById('deckViewModal')?.classList.add('active');
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
        bar.innerHTML =
          `<span style="color:var(--echo);">덱 <b>${deckCards.length}</b></span>` +
          `<span style="opacity:0.3;"> / </span>` +
          `<span style="color:var(--cyan);">손패 <b>${handCards.length}</b></span>` +
          `<span style="opacity:0.3;"> / </span>` +
          `<span style="color:var(--text-dim);">무덤 <b>${graveCards.length}</b></span>`;
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
      cardsEl.innerHTML = sorted.map(([id, cnt]) => {
        const card = data.cards[id];
        if (!card) return '';
        const r = card.rarity || 'common';
        const bdr = rarityBorder[r];
        const typeColor = card.type === 'ATTACK' ? '#ff6688' : card.type === 'SKILL' ? '#66bbff' : card.type === 'POWER' ? 'var(--gold)' : 'var(--echo)';
        const locationTag = handCards.includes(id)
          ? `<div style="position:absolute;top:4px;right:4px;font-size:7px;background:rgba(0,255,204,0.15);border-radius:3px;padding:1px 4px;color:var(--cyan);">손패</div>`
          : graveCards.includes(id)
            ? `<div style="position:absolute;top:4px;right:4px;font-size:7px;background:rgba(123,47,255,0.15);border-radius:3px;padding:1px 4px;color:var(--echo);">무덤</div>`
            : '';
        return `<div style="position:relative;background:var(--glass);border:1px solid ${bdr};border-radius:10px;padding:10px 8px;
            width:88px;min-height:130px;display:flex;flex-direction:column;align-items:center;backdrop-filter:blur(12px);
            transition:transform 0.15s,box-shadow 0.15s;"
            onmouseenter="showTooltip(event,'${id}');this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.4)'"
            onmouseleave="hideTooltip();this.style.transform='';this.style.boxShadow=''">
          <div style="position:absolute;top:5px;left:5px;width:18px;height:18px;border-radius:50%;background:rgba(123,47,255,0.3);
            border:1px solid var(--echo);display:flex;align-items:center;justify-content:center;
            font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--white);">${card.cost}</div>
          ${cnt > 1 ? `<div style="position:absolute;bottom:24px;right:5px;font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--cyan);">×${cnt}</div>` : ''}
          ${locationTag}
          <div style="font-size:22px;margin:16px 0 4px;">${card.icon}</div>
          <div style="font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:var(--white);text-align:center;margin-bottom:3px;line-height:1.2;">${card.name}</div>
          <div style="font-size:9px;color:var(--text-dim);text-align:center;line-height:1.3;flex:1;">${card.desc}</div>
          <div style="font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.1em;color:${card.upgraded ? 'var(--cyan)' : typeColor};margin-top:4px;">${card.upgraded ? '✦ 강화됨' : card.type}</div>
        </div>`;
      }).join('');
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
      const doc = _getDoc(deps);
      doc.getElementById('deckViewModal')?.classList.remove('active');
    },
  };

  globalObj.DeckModalUI = DeckModalUI;
})(window);
