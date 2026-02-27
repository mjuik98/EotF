import { DescriptionUtils } from '../../utils/description_utils.js';


let _codexTab = 'enemies';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const CodexUI = {
  openCodex(deps = {}) {
    const gs = deps.gs || (typeof window !== 'undefined' ? window.GS : null);
    const data = deps.data || (typeof window !== 'undefined' ? window.DATA : null);

    if (gs && !gs.meta) gs.meta = {};
    if (gs && gs.meta && !gs.meta.codex) {
      gs.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
    }

    const codex = gs?.meta?.codex || { enemies: new Set(), cards: new Set(), items: new Set() };
    // Ensure normalization here too just in case
    if (gs?.meta?.codex) {
      if (Array.isArray(gs.meta.codex.enemies)) gs.meta.codex.enemies = new Set(gs.meta.codex.enemies);
      if (Array.isArray(gs.meta.codex.cards)) gs.meta.codex.cards = new Set(gs.meta.codex.cards);
      if (Array.isArray(gs.meta.codex.items)) gs.meta.codex.items = new Set(gs.meta.codex.items);
    }
    const doc = _getDoc(deps);
    const modal = doc.getElementById('codexModal');
    if (modal) modal.style.display = 'block';

    // Ensure data is passed to setCodexTab
    this.setCodexTab('enemies', { ...deps, gs, data });
  },

  closeCodex(deps = {}) {
    const doc = deps?.doc || document;
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
    const gs = deps.gs || (typeof GS !== 'undefined' ? GS : null);
    const data = deps.data || (typeof DATA !== 'undefined' ? DATA : null);
    if (!gs?.meta || !data?.enemies || !data?.cards || !data?.items) return;

    const codex = gs.meta.codex || { enemies: new Set(), cards: new Set(), items: new Set() };
    const doc = _getDoc(deps);
    const progressEl = doc.getElementById('codexProgress');
    const contentEl = doc.getElementById('codexContent');
    if (!contentEl) return;

    // Fix: Clear content immediately to avoid duplication when switching tabs
    contentEl.textContent = '';

    const totalEnemies = Object.keys(data.enemies).length;
    const totalCards = Object.keys(data.cards).length;
    const totalItems = Object.keys(data.items).length;
    const seenEnemies = new Set(Array.from(codex.enemies).filter(id => data.enemies[id])).size;
    const seenCards = new Set(Array.from(codex.cards).filter(id => data.cards[id])).size;
    const seenItems = new Set(Array.from(codex.items).filter(id => data.items[id])).size;
    const totalAll = totalEnemies + totalCards + totalItems;
    const seenAll = seenEnemies + seenCards + seenItems;
    const discoveryPct = totalAll > 0 ? Math.round((seenAll / totalAll) * 100) : 0;

    if (progressEl) {
      progressEl.textContent = '';

      const createPart = (icon, label, current, total, color) => {
        const span = doc.createElement('span');
        const b = doc.createElement('b');
        b.style.color = color;
        b.textContent = current;
        const totalSpan = doc.createElement('span');
        totalSpan.style.color = 'var(--text-dim)';
        totalSpan.textContent = `/${total}`;
        span.append(doc.createTextNode(`${icon} ${label} `), b, totalSpan);
        return span;
      };

      const sep = () => {
        const s = doc.createElement('span');
        s.style.opacity = '0.3';
        s.textContent = '|';
        return s;
      };

      progressEl.append(
        createPart('👾', '적', seenEnemies, totalEnemies, 'var(--danger)'),
        sep(),
        createPart('🃏', '카드', seenCards, totalCards, 'var(--echo)'),
        sep(),
        createPart('💎', '유물', seenItems, totalItems, 'var(--gold)'),
        sep()
      );

      const discovery = doc.createElement('span');
      discovery.style.color = 'var(--cyan)';
      discovery.textContent = `총 발견률 ${discoveryPct}%`;
      progressEl.appendChild(discovery);
    }

    if (_codexTab === 'enemies') {
      const regionNames = ['잔향의 숲', '침묵의 도시', '기억의 미궁', '신의 무덤', '메아리의 근원'];
      const regionColors = ['#44ff88', '#7b2fff', '#ff88cc', '#ff4444', '#00ffcc'];

      const allEnemies = Object.values(data.enemies);
      const byRegion = {};
      allEnemies.forEach(e => {
        const r = e.region !== undefined && e.region !== null ? e.region : 'unassigned';
        if (!byRegion[r]) byRegion[r] = [];
        byRegion[r].push(e);
      });

      // 지역 내에서 등급순 정렬: 일반 -> 정예 -> 보스
      Object.keys(byRegion).forEach(r => {
        byRegion[r].sort((a, b) => {
          const getRank = (e) => e.isBoss ? 2 : (e.isElite ? 1 : 0);
          return getRank(a) - getRank(b) || (a.hp - b.hp);
        });
      });

      Object.entries(byRegion).forEach(([regionIdx, enemies]) => {
        const rColor = regionColors[regionIdx] || '#888';
        const rName = regionNames[regionIdx] || `지역 ${regionIdx}`;

        const section = doc.createElement('div');
        section.style.marginBottom = '28px';

        const header = doc.createElement('div');
        header.style.cssText = `font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:${rColor};margin-bottom:12px;border-bottom:1px solid ${rColor}22;padding-bottom:8px;`;
        header.textContent = `◈ ${rName} `;
        const stats = doc.createElement('span');
        stats.style.cssText = 'opacity:0.5;font-size:9px;';
        stats.textContent = `(${enemies.filter(e => codex.enemies.has(e.id)).length}/${enemies.length})`;
        header.appendChild(stats);
        section.appendChild(header);

        const grid = doc.createElement('div');
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

        enemies.forEach(e => {
          const seen = codex.enemies.has(e.id);
          const isBoss = e.isBoss;
          const card = doc.createElement('div');
          card.style.cssText = `background:var(--glass);border:1px solid ${seen ? (isBoss ? 'rgba(240,180,41,0.5)' : 'rgba(123,47,255,0.25)') : 'rgba(60,60,80,0.4)'};border-radius:16px;padding:20px 16px;width:160px;min-height:220px;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all 0.2s;position:relative;`;

          card.onmouseenter = () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
          };
          card.onmouseleave = () => {
            card.style.transform = '';
            card.style.boxShadow = '';
          };

          if (isBoss) {
            const bossLabel = doc.createElement('div');
            bossLabel.style.cssText = "position:absolute;top:8px;right:8px;font-size:10px;color:var(--gold);font-family:'Cinzel',serif;font-weight:bold;";
            bossLabel.textContent = 'BOSS';
            card.appendChild(bossLabel);
          }

          const iconCont = doc.createElement('div');
          iconCont.style.cssText = 'width:100%;height:80px;display:flex;align-items:center;justify-content:center;margin:8px 0;';
          const icon = doc.createElement('div');
          if (seen) {
            icon.style.fontSize = '48px';
            icon.textContent = e.icon;
          } else {
            icon.style.cssText = 'font-size:40px;filter:grayscale(1) brightness(0.25);';
            icon.textContent = '❓';
          }
          iconCont.appendChild(icon);
          card.appendChild(iconCont);

          const name = doc.createElement('div');
          name.style.cssText = `font-family:'Cinzel',serif;font-size:${seen ? '13px' : '11px'};font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;line-height:1.3;`;
          name.textContent = seen ? e.name : '???';
          card.appendChild(name);

          if (seen) {
            const statsDiv = doc.createElement('div');
            statsDiv.style.cssText = 'width:100%;background:rgba(255,51,102,0.1);border-radius:8px;padding:8px 10px;font-size:11px;color:var(--text);line-height:1.7;';

            const line = (l, v) => {
              const d = doc.createElement('div');
              d.style.display = 'flex'; d.style.justifyContent = 'space-between';
              const ls = doc.createElement('span'); ls.textContent = l;
              const vs = doc.createElement('span'); vs.style.cssText = 'color:var(--white);font-weight:bold;'; vs.textContent = v;
              d.append(ls, vs);
              return d;
            };

            statsDiv.appendChild(line('❤️ HP', e.maxHp));
            statsDiv.appendChild(line('⚔️ ATK', e.atk));

            const footer = doc.createElement('div');
            footer.style.cssText = 'font-size:10px;color:var(--text-dim);margin-top:4px;text-align:center;';
            footer.textContent = `💰 ${e.gold}G / ⭐ ${e.xp}XP`;
            statsDiv.appendChild(footer);
            card.appendChild(statsDiv);
          } else {
            const hint = doc.createElement('div');
            hint.style.cssText = 'font-size:11px;color:var(--text-dim);text-align:center;margin-top:8px;';
            hint.textContent = '조우하면 해금';
            card.appendChild(hint);
          }

          const footerTag = doc.createElement('div');
          footerTag.style.cssText = `font-size:10px;color:${seen ? rColor : 'var(--text-dim)'};font-family:'Cinzel',serif;margin-top:auto;opacity:0.8;`;
          footerTag.textContent = seen ? rName : '???';
          card.appendChild(footerTag);

          grid.appendChild(card);
        });

        section.appendChild(grid);
        contentEl.appendChild(section);
      });
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

      Object.entries(byRarity).filter(([, arr]) => arr.length).forEach(([r, cards]) => {
        const rColor = rarityColor[r];
        const section = doc.createElement('div');
        section.style.marginBottom = '24px';

        const header = doc.createElement('div');
        header.style.cssText = `font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:${rColor};margin-bottom:10px;border-bottom:1px solid ${rColor}22;padding-bottom:7px;`;
        header.textContent = `◈ ${rarityLabel[r]} `;
        const stats = doc.createElement('span');
        stats.style.cssText = 'opacity:0.5;font-size:9px;';
        stats.textContent = `(${cards.filter(c => codex.cards.has(c.id)).length}/${cards.length})`;
        header.appendChild(stats);
        section.appendChild(header);

        const grid = doc.createElement('div');
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

        cards.forEach(card => {
          const seen = codex.cards.has(card.id);
          const tc = typeColor[card.type] || 'var(--echo)';
          const item = doc.createElement('div');
          item.style.cssText = `background:var(--glass);border:1px solid ${seen ? rarityBorder[r] : 'rgba(60,60,80,0.3)'};border-radius:14px;padding:14px 12px;width:120px;min-height:190px;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all 0.15s;`;

          item.onmouseenter = () => {
            item.style.transform = 'translateY(-3px)';
            item.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
          };
          item.onmouseleave = () => {
            item.style.transform = '';
            item.style.boxShadow = '';
          };

          const iconCont = doc.createElement('div');
          iconCont.style.cssText = 'width:100%;height:60px;display:flex;align-items:center;justify-content:center;margin:6px 0;';
          const icon = doc.createElement('div');
          if (seen) {
            icon.style.fontSize = '36px';
            icon.textContent = card.icon;
          } else {
            icon.style.cssText = 'font-size:30px;filter:grayscale(1) brightness(0.25);';
            icon.textContent = '❓';
          }
          iconCont.appendChild(icon);
          item.appendChild(iconCont);

          const name = doc.createElement('div');
          name.style.cssText = `font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;line-height:1.3;`;
          name.textContent = seen ? card.name : '???';
          item.appendChild(name);

          if (seen) {
            const desc = doc.createElement('div');
            desc.style.cssText = 'font-size:10px;color:var(--text);text-align:center;line-height:1.5;flex:1;';
            if (window.DescriptionUtils) {
              desc.innerHTML = window.DescriptionUtils.highlight(card.desc);
            } else if (typeof DescriptionUtils !== 'undefined' && DescriptionUtils.highlight) {
              desc.innerHTML = DescriptionUtils.highlight(card.desc);
            } else {
              desc.textContent = card.desc;
            }

            const meta = doc.createElement('div');
            meta.style.cssText = 'display:flex;gap:6px;align-items:center;margin-top:auto;';

            const cost = doc.createElement('span');
            cost.style.cssText = 'width:20px;height:20px;border-radius:50%;background:rgba(123,47,255,0.3);border:1px solid var(--echo);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--white);font-weight:bold;';
            cost.textContent = card.cost;

            const type = doc.createElement('span');
            type.style.cssText = `font-size:9px;color:${tc};font-weight:bold;`;
            type.textContent = card.type;

            meta.append(cost, type);
            item.append(desc, meta);
          } else {
            const hint = doc.createElement('div');
            hint.style.cssText = 'font-size:10px;color:var(--text-dim);text-align:center;margin-top:auto;';
            hint.textContent = '사용하면 해금';
            item.appendChild(hint);
          }
          grid.appendChild(item);
        });

        section.appendChild(grid);
        contentEl.appendChild(section);
      });
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

      Object.entries(byRarity).filter(([, arr]) => arr.length).forEach(([r, items]) => {
        const rColor = rarityColor[r];
        const section = doc.createElement('div');
        section.style.marginBottom = '24px';

        const header = doc.createElement('div');
        header.style.cssText = `font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:${rColor};margin-bottom:10px;border-bottom:1px solid ${rColor}22;padding-bottom:7px;`;
        header.textContent = `◈ ${rarityLabel[r]} `;
        const stats = doc.createElement('span');
        stats.style.cssText = 'opacity:0.5;font-size:9px;';
        stats.textContent = `(${items.filter(it => codex.items.has(it.id)).length}/${items.length})`;
        header.appendChild(stats);
        section.appendChild(header);

        const grid = doc.createElement('div');
        grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';

        items.forEach(itemInfo => {
          const seen = codex.items.has(itemInfo.id);
          const iCard = doc.createElement('div');
          iCard.style.cssText = `background:var(--glass);border:1px solid ${seen ? rarityBorder[r] : 'rgba(60,60,80,0.3)'};border-radius:16px;padding:16px 14px;width:150px;min-height:180px;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all 0.15s;`;

          iCard.onmouseenter = () => {
            iCard.style.transform = 'translateY(-3px)';
            iCard.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
          };
          iCard.onmouseleave = () => {
            iCard.style.transform = '';
            iCard.style.boxShadow = '';
          };

          const iconCont = doc.createElement('div');
          iconCont.style.cssText = 'width:100%;height:70px;display:flex;align-items:center;justify-content:center;margin:6px 0;';
          const icon = doc.createElement('div');
          if (seen) {
            icon.style.fontSize = '42px';
            icon.textContent = itemInfo.icon;
          } else {
            icon.style.cssText = 'font-size:36px;filter:grayscale(1) brightness(0.2);';
            icon.textContent = '❓';
          }
          iconCont.appendChild(icon);
          iCard.appendChild(iconCont);

          const name = doc.createElement('div');
          name.style.cssText = `font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:${seen ? 'var(--white)' : 'var(--text-dim)'};text-align:center;line-height:1.3;`;
          name.textContent = seen ? itemInfo.name : '???';
          iCard.appendChild(name);

          if (seen) {
            const desc = doc.createElement('div');
            desc.style.cssText = 'font-size:11px;color:var(--text);text-align:center;line-height:1.6;flex:1;';
            if (window.DescriptionUtils) {
              desc.innerHTML = window.DescriptionUtils.highlight(itemInfo.desc);
            } else if (typeof DescriptionUtils !== 'undefined' && DescriptionUtils.highlight) {
              desc.innerHTML = DescriptionUtils.highlight(itemInfo.desc);
            } else {
              desc.textContent = itemInfo.desc;
            }
            iCard.appendChild(desc);
          } else {
            const hint = doc.createElement('div');
            hint.style.cssText = 'font-size:10px;color:var(--text-dim);text-align:center;margin-top:auto;';
            hint.textContent = '획득하면 해금';
            iCard.appendChild(hint);
          }

          const rTag = doc.createElement('div');
          rTag.style.cssText = `font-size:10px;color:${rColor};font-family:'Cinzel',serif;margin-top:auto;opacity:0.8;font-weight:bold;`;
          rTag.textContent = rarityLabel[r];
          iCard.appendChild(rTag);

          grid.appendChild(iCard);
        });

        section.appendChild(grid);
        contentEl.appendChild(section);
      });
    }
  },
};
