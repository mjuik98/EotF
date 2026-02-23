'use strict';

(function initTooltipUI(globalObj) {
  let _tooltipTimer = null;
  let _itemTipEl = null;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getWin(deps) {
    return deps?.win || window;
  }

  const TooltipUI = {
    showTooltip(event, cardId, deps = {}) {
      const data = deps.data;
      const gs = deps.gs;
      if (!data?.cards || !gs) return;

      const card = data.cards[cardId];
      if (!card) return;
      clearTimeout(_tooltipTimer);
      const doc = _getDoc(deps);
      const win = _getWin(deps);
      const tt = doc.getElementById('cardTooltip');
      if (!tt) return;

      doc.getElementById('ttIcon').textContent = card.icon;
      doc.getElementById('ttCost').textContent = card.cost;
      doc.getElementById('ttName').textContent = card.name;
      doc.getElementById('ttType').textContent = card.type;
      doc.getElementById('ttDesc').textContent = card.desc;
      const rarityEl = doc.getElementById('ttRarity');
      rarityEl.textContent = (card.rarity || 'common').toUpperCase();
      rarityEl.className = `card-tooltip-rarity rarity-${card.rarity || 'common'}`;

      const predEl = doc.getElementById('ttPredicted');
      if (predEl && gs.combat?.active && card.type === 'ATTACK' && card.dmg) {
        const baseDmg = card.dmg;
        const momentum = gs.getBuff?.('momentum');
        const momBonus = momentum ? (momentum.dmgBonus || 0) : 0;
        const chainBonus = gs.player.echoChain >= 3 ? Math.floor(baseDmg * 0.2) : 0;
        const total = baseDmg + momBonus + chainBonus;
        let tip = `⚔ 예상 피해: <b>${total}</b>`;
        if (momBonus > 0) tip += ` <span style="color:rgba(255,120,120,0.8);font-size:9px;">(+${momBonus} 모멘텀)</span>`;
        if (chainBonus > 0) tip += ` <span style="color:rgba(0,255,204,0.8);font-size:9px;">(+${chainBonus} 체인)</span>`;
        predEl.innerHTML = tip;
        predEl.style.display = '';
      } else if (predEl) {
        predEl.style.display = 'none';
      }

      const rect = event.currentTarget.getBoundingClientRect();
      let x = rect.right + 12;
      let y = rect.top;
      if (x + 170 > win.innerWidth) x = rect.left - 172;
      if (y + 260 > win.innerHeight) y = win.innerHeight - 265;
      tt.style.left = `${x}px`;
      tt.style.top = `${y}px`;
      tt.classList.add('visible');
    },

    hideTooltip(deps = {}) {
      const doc = _getDoc(deps);
      _tooltipTimer = setTimeout(() => {
        doc.getElementById('cardTooltip')?.classList.remove('visible');
      }, 80);
    },

    attachCardTooltips(deps = {}) {
      const doc = _getDoc(deps);
      doc.querySelectorAll('#combatHandCards .card, #deckModalCards > div').forEach(el => {
        el.addEventListener('mouseenter', (e) => {
          const onclick = el.getAttribute('onclick') || '';
          const m = onclick.match(/playCard\('([^']+)'/);
          if (m) this.showTooltip(e, m[1], deps);
        });
        el.addEventListener('mouseleave', () => this.hideTooltip(deps));
      });
    },

    showItemTooltip(event, itemId, deps = {}) {
      const data = deps.data;
      const gs = deps.gs;
      const setBonusSystem = deps.setBonusSystem;
      if (!data?.items || !gs || !setBonusSystem?.sets) return;

      const item = data.items[itemId];
      if (!item) return;
      this.hideItemTooltip(deps);

      const doc = _getDoc(deps);
      const win = _getWin(deps);
      const el = doc.createElement('div');
      el.id = '_itemTip';
      el.style.cssText = [
        'position:fixed;z-index:950;',
        'background:var(--panel);border:1px solid rgba(240,180,41,0.35);border-radius:12px;',
        'padding:14px 14px 12px;width:200px;pointer-events:none;',
        'backdrop-filter:blur(24px);',
        'box-shadow:0 12px 40px rgba(0,0,0,0.7),0 0 20px rgba(240,180,41,0.1);',
        'animation:fadeIn 0.15s ease both;',
      ].join('');
      const triggerMap = {
        combat_start: '전투 시작 시',
        card_play: '카드 사용 시',
        turn_start: '턴 시작 시',
        damage_taken: '피해 받을 때',
        boss_start: '보스 조우 시',
        combat_end: '전투 종료 시',
      };
      const triggerText = item.trigger ? (triggerMap[item.trigger] || item.trigger) : '패시브';
      const tipRarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };
      const tipRarityLabel = { common: '일반', uncommon: '고급', rare: '희귀', legendary: '전설' };
      const tipR = item.rarity || 'common';
      const tipBorder = tipR === 'legendary' ? 'rgba(192,132,252,0.4)' : tipR === 'rare' ? 'rgba(240,180,41,0.35)' : tipR === 'uncommon' ? 'rgba(123,47,255,0.35)' : 'var(--border)';
      el.style.borderColor = tipBorder;
      el.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
          '<div style="font-size:28px;line-height:1;filter:' + (tipR === 'legendary' ? 'drop-shadow(0 0 8px rgba(192,132,252,0.7))' : 'none') + ';">' + item.icon + '</div>' +
          '<div>' +
            '<div style="font-family:\'Cinzel\',serif;font-size:12px;font-weight:700;color:' + (tipRarityColor[tipR] || 'var(--white)') + ';">' + item.name + '</div>' +
            '<div style="display:flex;gap:6px;align-items:center;margin-top:3px;">' +
              '<span style="font-family:\'Cinzel\',serif;font-size:7px;letter-spacing:0.15em;background:rgba(123,47,255,0.15);border-radius:3px;padding:1px 5px;color:' + (tipRarityColor[tipR]) + ';">' + (tipRarityLabel[tipR] || tipR) + '</span>' +
              '<span style="font-family:\'Cinzel\',serif;font-size:7px;letter-spacing:0.1em;color:var(--text-dim);">' + triggerText + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text);line-height:1.65;border-top:1px solid var(--border);padding-top:8px;">' + item.desc + '</div>' +
        (() => {
          const setEntry = Object.entries(setBonusSystem.sets).find(([, s]) => s.items.includes(itemId));
          if (!setEntry) return '';
          const [, setData] = setEntry;
          const owned = gs.player.items.filter(id => setData.items.includes(id)).length;
          const total = setData.items.length;
          const setColor = owned >= 3 ? 'var(--gold)' : owned >= 2 ? 'var(--cyan)' : 'rgba(0,255,204,0.4)';
          const b2 = setData.bonuses[2]?.label || '';
          const b3 = setData.bonuses[3]?.label || '';
          return `<div style="margin-top:8px;padding:6px 8px;background:rgba(0,255,204,0.05);border:1px solid rgba(0,255,204,0.2);border-radius:6px;">
            <div style="font-family:Cinzel,serif;font-size:8px;letter-spacing:0.15em;color:${setColor};margin-bottom:3px;">✦ 세트: ${setData.name} [${owned}/${total}]</div>
            <div style="font-size:9px;color:${owned >= 2 ? 'var(--cyan)' : 'var(--text-dim)'};margin-bottom:1px;">2개: ${b2}</div>
            <div style="font-size:9px;color:${owned >= 3 ? 'var(--gold)' : 'var(--text-dim)'};">3개: ${b3}</div>
          </div>`;
        })();

      const rect = event.currentTarget.getBoundingClientRect();
      let x = rect.right + 10;
      let y = rect.top - 10;
      if (x + 212 > win.innerWidth) x = rect.left - 214;
      if (y + 140 > win.innerHeight) y = win.innerHeight - 145;
      el.style.left = `${Math.max(6, x)}px`;
      el.style.top = `${Math.max(6, y)}px`;
      doc.body.appendChild(el);
      _itemTipEl = el;
    },

    hideItemTooltip() {
      if (_itemTipEl) {
        _itemTipEl.remove();
        _itemTipEl = null;
      }
    },
  };

  globalObj.TooltipUI = TooltipUI;
})(window);
