'use strict';

(function initCodexUI(globalObj) {
  let _codexTab = 'enemies';

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const CodexUI = {
    openCodex(deps = {}) {
      const gs = deps.gs;
      if (!gs?.meta) return;
      if (!gs.meta.codex) gs.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
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
      const tabs = ['enemies', 'cards', 'items'];
      const colors = { enemies: 'var(--danger)', cards: 'var(--echo)', items: 'var(--gold)' };
      const bgColors = { enemies: 'rgba(255,51,102,0.15)', cards: 'rgba(123,47,255,0.15)', items: 'rgba(240,180,41,0.1)' };
      tabs.forEach(t => {
        const btn = doc.getElementById(`codexTab_${t}`);
        if (!btn) return;
        const active = t === tab;
        btn.style.background = active ? bgColors[t] : 'transparent';
        btn.style.color = active ? colors[t] : 'var(--text-dim)';
        btn.style.borderColor = active ? colors[t] : 'var(--border)';
      });
      this.renderCodexContent(deps);
    },

    renderCodexContent(deps = {}) {
      const gs = deps.gs;
      const data = deps.data;
      if (!gs?.meta || !data?.enemies || !data?.cards || !data?.items) return;

      const codex = gs.meta.codex || { enemies: new Set(), cards: new Set(), items: new Set() };
      const doc = _getDoc(deps);
      const progressEl = doc.getElementById('codexProgress');
      const contentEl = doc.getElementById('codexContent');
      if (!contentEl) return;

      const totalEnemies = Object.keys(data.enemies).length;
      const totalCards = Object.keys(data.cards).length;
      const totalItems = Object.keys(data.items).length;
      const seenEnemies = codex.enemies.size;
      const seenCards = codex.cards.size;
      const seenItems = codex.items.size;
      const totalAll = totalEnemies + totalCards + totalItems;
      const seenAll = seenEnemies + seenCards + seenItems;
      const discoveryPct = totalAll > 0 ? Math.round((seenAll / totalAll) * 100) : 0;

      if (progressEl) {
        progressEl.innerHTML = `
          <span>👾 적 <b style="color:var(--danger);">${seenEnemies}</b>/<span style="color:var(--text-dim)">${totalEnemies}</span></span>
          <span style="opacity:0.3;">|</span>
          <span>🃏 카드 <b style="color:var(--echo);">${seenCards}</b>/<span style="color:var(--text-dim)">${totalCards}</span></span>
          <span style="opacity:0.3;">|</span>
          <span>💎 유물 <b style="color:var(--gold);">${seenItems}</b>/<span style="color:var(--text-dim)">${totalItems}</span></span>
          <span style="opacity:0.3;">|</span>
          <span style="color:var(--cyan);">총 발견률 ${discoveryPct}%</span>
        `;
      }

      if (_codexTab === 'enemies') {
        const regionNames = ['잔향의 숲', '침묵의 도시', '기억의 미궁', '신의 무덤', '에코의 핵심'];
        const regionColors = ['#44ff88', '#7b2fff', '#ff88cc', '#ff4444', '#00ffcc'];

        const allEnemies = Object.values(data.enemies);
        const byRegion = {};
        allEnemies.forEach(e => {
          const r = e.region ?? 0;
          if (!byRegion[r]) byRegion[r] = [];
          byRegion[r].push(e);
        });

        contentEl.innerHTML = Object.entries(byRegion).map(([regionIdx, enemies]) => {
          const rColor = regionColors[regionIdx] || '#888';
          const rName = regionNames[regionIdx] || `지역 ${regionIdx}`;
          const cards = enemies.map(e => {
            const seen = codex.enemies.has(e.id);
            const isBoss = e.isBoss;
            return `<div style="background:var(--glass);border:1px solid ${seen ? (isBoss ? 'rgba(240,180,41,0.4)' : 'rgba(123,47,255,0.25)') : 'rgba(60,60,80,0.4)'};border-radius:12px;padding:14px;width:140px;min-height:160px;
              display:flex;flex-direction:column;align-items:center;gap:6px;transition:transform 0.2s;position:relative;"
              onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
              ${isBoss ? `<div style="position:absolute;top:6px;right:6px;font-size:9px;color:var(--gold);font-family:'Cinzel',serif;">BOSS</div>` : ''}
              <div style="font-size:${seen ? '36px' : '28px'};filter:${seen ? 'none' : 'grayscale(1) brightness(0.3)'};">${seen ? e.icon : '❓'}</div>
              <div style="font-family:'Cinzel',serif;font-size:${seen ? '10px' : '9px'};font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;line-height:1.3;">
                ${seen ? e.name : '???'}
              </div>
              ${seen ? `
                <div style="width:100%;background:rgba(255,51,102,0.1);border-radius:4px;padding:4px 6px;font-size:9px;color:var(--text-dim);line-height:1.6;">
                  <div>❤️ HP <span style="color:var(--white);">${e.maxHp}</span></div>
                  <div>⚔️ ATK <span style="color:var(--white);">${e.atk}</span></div>
                  <div>💰 ${e.gold}골드 / ⭐ ${e.xp}XP</div>
                </div>
              ` : `<div style="font-size:9px;color:var(--text-dim);text-align:center;margin-top:4px;">조우하면 해금</div>`}
              <div style="font-size:8px;color:${seen ? rColor : 'var(--text-dim)'};font-family:'Cinzel',serif;margin-top:auto;">${seen ? rName : '???'}</div>
            </div>`;
          }).join('');
          return `<div style="margin-bottom:28px;">
            <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:${rColor};margin-bottom:12px;border-bottom:1px solid ${rColor}22;padding-bottom:8px;">
              ◈ ${rName} <span style="opacity:0.5;font-size:9px;">(${enemies.filter(e => codex.enemies.has(e.id)).length}/${enemies.length})</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">${cards}</div>
          </div>`;
        }).join('');
      } else if (_codexTab === 'cards') {
        const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        const rarityColor = { legendary: '#c084fc', rare: 'var(--gold)', uncommon: 'var(--echo-bright)', common: 'var(--text-dim)' };
        const rarityBorder = { legendary: 'rgba(192,132,252,0.4)', rare: 'rgba(240,180,41,0.35)', uncommon: 'rgba(123,47,255,0.3)', common: 'var(--border)' };
        const typeColor = { ATTACK: '#ff6688', SKILL: '#66bbff', POWER: 'var(--gold)' };

        const allCards = Object.values(data.cards).sort((a, b) => {
          const ra = rarityOrder[a.rarity || 'common'] ?? 3;
          const rb = rarityOrder[b.rarity || 'common'] ?? 3;
          return ra - rb || (a.name || '').localeCompare(b.name || '');
        });

        const byRarity = { legendary: [], rare: [], uncommon: [], common: [] };
        allCards.forEach(c => { const r = c.rarity || 'common'; if (byRarity[r]) byRarity[r].push(c); });
        const rarityLabel = { legendary: '전설', rare: '희귀', uncommon: '비범', common: '일반' };

        contentEl.innerHTML = Object.entries(byRarity).filter(([, arr]) => arr.length).map(([r, cards]) => {
          const rColor = rarityColor[r];
          const items = cards.map(card => {
            const seen = codex.cards.has(card.id);
            const tc = typeColor[card.type] || 'var(--echo)';
            return `<div style="background:var(--glass);border:1px solid ${seen ? rarityBorder[r] : 'rgba(60,60,80,0.3)'};border-radius:10px;padding:10px 8px;
              width:90px;min-height:140px;display:flex;flex-direction:column;align-items:center;gap:4px;
              transition:transform 0.15s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
              <div style="font-size:${seen ? '24px' : '20px'};margin:8px 0 4px;filter:${seen ? 'none' : 'grayscale(1) brightness(0.25)'};">${seen ? card.icon : '❓'}</div>
              <div style="font-family:'Cinzel',serif;font-size:8px;font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;line-height:1.3;">${seen ? card.name : '???'}</div>
              ${seen ? `
                <div style="font-size:8px;color:var(--text-dim);text-align:center;line-height:1.4;flex:1;">${globalObj.DescriptionUtils ? globalObj.DescriptionUtils.highlight(card.desc) : card.desc}</div>
                <div style="display:flex;gap:4px;align-items:center;margin-top:auto;">
                  <span style="width:16px;height:16px;border-radius:50%;background:rgba(123,47,255,0.3);border:1px solid var(--echo);display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--white);">${card.cost}</span>
                  <span style="font-size:7px;color:${tc};">${card.type}</span>
                </div>
              ` : `<div style="font-size:8px;color:var(--text-dim);text-align:center;margin-top:auto;">사용하면 해금</div>`}
            </div>`;
          }).join('');
          return `<div style="margin-bottom:24px;">
            <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:${rColor};margin-bottom:10px;border-bottom:1px solid ${rColor}22;padding-bottom:7px;">
              ◈ ${rarityLabel[r]} <span style="opacity:0.5;font-size:9px;">(${cards.filter(c => codex.cards.has(c.id)).length}/${cards.length})</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">${items}</div>
          </div>`;
        }).join('');
      } else if (_codexTab === 'items') {
        const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        const rarityColor = { legendary: '#c084fc', rare: 'var(--gold)', uncommon: 'var(--echo-bright)', common: 'var(--text-dim)' };
        const rarityBorder = { legendary: 'rgba(192,132,252,0.4)', rare: 'rgba(240,180,41,0.35)', uncommon: 'rgba(123,47,255,0.3)', common: 'var(--border)' };
        const rarityLabel = { legendary: '전설', rare: '희귀', uncommon: '비범', common: '일반' };

        const allItems = Object.values(data.items).sort((a, b) => {
          const ra = rarityOrder[a.rarity || 'common'] ?? 3;
          const rb = rarityOrder[b.rarity || 'common'] ?? 3;
          return ra - rb;
        });

        const byRarity = { legendary: [], rare: [], uncommon: [], common: [] };
        allItems.forEach(it => { const r = it.rarity || 'common'; if (byRarity[r]) byRarity[r].push(it); });

        contentEl.innerHTML = Object.entries(byRarity).filter(([, arr]) => arr.length).map(([r, items]) => {
          const rColor = rarityColor[r];
          const cards = items.map(item => {
            const seen = codex.items.has(item.id);
            return `<div style="background:var(--glass);border:1px solid ${seen ? rarityBorder[r] : 'rgba(60,60,80,0.3)'};border-radius:12px;padding:12px 10px;
              width:130px;min-height:140px;display:flex;flex-direction:column;align-items:center;gap:6px;
              transition:transform 0.15s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform=''">
              <div style="font-size:${seen ? '30px' : '24px'};margin:4px 0;filter:${seen ? 'none' : 'grayscale(1) brightness(0.2)'};">${seen ? item.icon : '❓'}</div>
               <div style="font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;line-height:1.3;">
                ${seen ? item.name : '???'}
              </div>
              ${seen ? `<div style="font-size:9px;color:var(--text-dim);text-align:center;line-height:1.5;flex:1;">${globalObj.DescriptionUtils ? globalObj.DescriptionUtils.highlight(item.desc) : item.desc}</div>`
                : `<div style="font-size:8px;color:var(--text-dim);text-align:center;margin-top:auto;">획득하면 해금</div>`}
              <div style="font-size:8px;color:${rColor};font-family:'Cinzel',serif;margin-top:auto;">${rarityLabel[r]}</div>
            </div>`;
          }).join('');
          return `<div style="margin-bottom:24px;">
            <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:${rColor};margin-bottom:10px;border-bottom:1px solid ${rColor}22;padding-bottom:7px;">
              ◈ ${rarityLabel[r]} <span style="opacity:0.5;font-size:9px;">(${items.filter(it => codex.items.has(it.id)).length}/${items.length})</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">${cards}</div>
          </div>`;
        }).join('');
      }
    },
  };

  globalObj.CodexUI = CodexUI;
})(window);
