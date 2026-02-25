import { DescriptionUtils } from './description_utils.js';


  let _tooltipTimer = null;
  let _itemTipEl = null;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getWin(deps) {
    return deps?.win || window;
  }

  const KEYWORD_MAP = {
    '소진': { title: '소진 (Exhaust)', text: '사용 후 이번 전투에서 제외(소멸)됩니다.' },
    '소각': { title: '소진 (Exhaust)', text: '사용 후 이번 전투에서 제외(소멸)됩니다.' },
    'Echo': { title: '잔향 (Echo)', text: '특수 효과 및 카드 발동에 사용되는 에너지 자원입니다.' },
    'Chain': { title: '체인 (Chain)', text: '연속 공격 횟수입니다. 3회 이상 쌓이면 추가 피해를 입힙니다.' },
    '침묵': { title: '침묵 (Silence)', text: '침묵 게이지입니다. 최대치(10) 도달 시 다음 공격이 강력해집니다.' },
    '모멘텀': { title: '모멘텀 (Momentum)', text: '공격력이 일시적으로 상승하는 상태입니다.' },
    '기절': { title: '기절 (Stun)', text: '적이 다음 턴에 행동을 취하지 못합니다.' },
    '약화': { title: '약화 (Weakened)', text: '대상의 공격력이 50% 감소합니다.' },
    '표식': { title: '처형 표식 (Marked)', text: '3턴 후 표식이 폭발하여 큰 피해(30)를 입힙니다.' },
    '독': { title: '독 (Poison)', text: '매 턴 시작 시 피해를 입습니다. 시간이 지날수록 피해가 서서히 줄어듭니다.' },
    '화염': { title: '화염 (Burning)', text: '매 턴 시작 시 고정 피해(5)를 입습니다.' },
    '면역': { title: '면역 (Immune)', text: '모든 피해와 상태이상의 영향을 받지 않습니다.' },
    '회피': { title: '회피 (Dodge)', text: '다음 적의 공격을 1회 완전 무효화합니다.' },
    '시간 왜곡': { title: '시간 왜곡 (Time Warp)', text: '공간을 비틀어 매 턴 시작 시 추가 에너지를 얻습니다.' },
    '드로우': { title: '드로우 (Draw)', text: '덱에서 카드를 손패로 가져옵니다.' }
  };

  export const TooltipUI = {
    showTooltip(event, cardId, deps = {}) {
      const data = deps.data;
      const gs = deps.gs;
      if (!data?.cards || !gs) return;

      // 특수 툴팁: 스킬 소각
      if (cardId === 'remove_card') {
        this.showGeneralTooltip(event, '🔥 스킬 소각', '덱에서 원하는 카드 1장을 영구히 제거합니다.<br><br>조건: 덱에 카드가 있어야 합니다.', deps);
        return;
      }

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
      doc.getElementById('ttDesc').innerHTML = window.DescriptionUtils ? window.DescriptionUtils.highlight(card.desc) : card.desc;
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

      // Sub-tooltip for keywords
      const st = doc.getElementById('subTooltip');
      if (st) {
        const foundKw = Object.keys(KEYWORD_MAP).find(kw => card.desc.includes(kw) || (card.exhaust && kw === '소진'));
        if (foundKw) {
          const kwData = KEYWORD_MAP[foundKw];
          doc.getElementById('stTitle').textContent = kwData.title;
          doc.getElementById('stContent').textContent = kwData.text;

          let stX = x + 172;
          let stY = y;
          if (stX + 180 > win.innerWidth) stX = x - 182;

          st.style.left = `${stX}px`;
          st.style.top = `${stY}px`;
          st.style.display = 'block';
        } else {
          st.style.display = 'none';
        }
      }
    },

    hideTooltip(deps = {}) {
      const doc = _getDoc(deps);
      _tooltipTimer = setTimeout(() => {
        doc.getElementById('cardTooltip')?.classList.remove('visible');
        const st = doc.getElementById('subTooltip');
        if (st) st.style.display = 'none';
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
        '<div style="font-size:11px;color:var(--text);line-height:1.65;border-top:1px solid var(--border);padding-top:8px;">' + (window.DescriptionUtils ? window.DescriptionUtils.highlight(item.desc) : item.desc) + '</div>' +
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
      if (_itemTipEl) _itemTipEl.remove();
      _itemTipEl = null;
    },

    showGeneralTooltip(event, title, content, deps = {}) {
      this.hideGeneralTooltip(deps);
      const doc = _getDoc(deps);
      const win = _getWin(deps);
      const el = doc.createElement('div');
      el.id = '_generalTip';
      el.style.cssText = [
        'position:fixed;z-index:10000;',
        'background:rgba(10,10,35,0.98);border:1px solid var(--echo);border-left:3px solid var(--echo);border-radius:8px;',
        'padding:12px;width:220px;pointer-events:none;',
        'backdrop-filter:blur(20px);',
        'box-shadow:0 10px 40px rgba(0,0,0,0.8);',
        'animation:fadeIn 0.15s ease both;',
      ].join('');

      el.innerHTML = `
        <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;letter-spacing:0.05em;">${title}</div>
        <div style="font-size:11px;color:var(--text);line-height:1.6;">${content}</div>
      `;

      const rect = event.currentTarget.getBoundingClientRect();
      const rightPanelWidth = 240; // 우측 패널 너비
      let x = rect.right + 10;
      let y = rect.top;

      // 우측 패널과의 충돌 확인
      if (x + 220 > win.innerWidth - rightPanelWidth) {
        x = rect.left - 230; // 왼쪽으로 표시
      }
      if (x < 6) x = 6; // 왼쪽 벽 충돌 방지

      if (y + 120 > win.innerHeight) y = win.innerHeight - 125;
      if (y < 6) y = 6;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      doc.body.appendChild(el);
      window._generalTipEl = el;
    },

    hideGeneralTooltip() {
      if (window._generalTipEl) {
        window._generalTipEl.remove();
        window._generalTipEl = null;
      }
    }
  };
