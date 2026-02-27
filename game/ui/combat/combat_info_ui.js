let _combatInfoOpen = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _applyClosedState(doc) {
  const panel = doc.getElementById('combatInfoPanel');
  const tab = doc.getElementById('combatInfoTab');
  if (panel) panel.style.left = '-260px';
  if (tab) {
    tab.style.left = '0';
    tab.textContent = '📋 정보';
  }
}

export const CombatInfoUI = {
  reset(deps = {}) {
    _combatInfoOpen = false;
    const doc = _getDoc(deps);
    _applyClosedState(doc);
  },

  toggle(deps = {}) {
    const doc = _getDoc(deps);
    const panel = doc.getElementById('combatInfoPanel');
    const tab = doc.getElementById('combatInfoTab');
    if (!panel) return;

    _combatInfoOpen = !_combatInfoOpen;
    if (_combatInfoOpen) {
      panel.style.left = '0px';
      if (tab) {
        tab.style.left = '256px';
        tab.textContent = '✕ 닫기';
      }
      this.refresh(deps);
    } else {
      _applyClosedState(doc);
    }
  },

  refresh(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const statusKr = deps.statusKr;
    if (!gs?.player || !data?.items || !statusKr) return;

    const doc = _getDoc(deps);
    const statusEl = doc.getElementById('combatStatusList');
    const itemEl = doc.getElementById('combatItemList');
    if (!statusEl || !itemEl) return;

    const buffs = gs.player.buffs;
    const keys = Object.keys(buffs);
    const rarityBuff = 'rgba(0,255,100,0.1)';
    const rarityDebuff = 'rgba(255,60,60,0.1)';

    statusEl.textContent = '';
    if (!keys.length) {
      const none = doc.createElement('span');
      none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
      none.textContent = '없음';
      statusEl.appendChild(none);
    } else {
      const descMap = {
        momentum: '공격 시 피해 증가',
        soul_armor: '피해 감소',
        vanish: '다음 공격 크리티컬',
        immune: '이번 턴 피해 무효',
        shadow_atk: '그림자 공격 강화',
        mirror: '피해 반사',
        zeroCost: '카드 비용 0',
        weakened: '공격력 50% 감소',
        slowed: '행동 지연',
        burning: '매 턴 5 화염 피해',
        cursed: '효과 감소',
        poisoned: '매 턴 독 피해',
        stunned: '행동 불가',
      };
      const frag = doc.createDocumentFragment();
      keys.forEach(k => {
        const b = buffs[k];
        const info = statusKr[k];
        const isBuff = info ? info.buff : ['momentum', 'soul_armor', 'vanish', 'immune', 'shadow_atk'].includes(k);
        const label = info ? `${info.icon} ${info.name}` : k;
        const stacks = b.stacks > 0 ? ` (${b.stacks})` : '';
        const desc = descMap[k] || '';

        const badge = doc.createElement('div');
        badge.title = desc;
        badge.style.cssText = `
            background:${isBuff ? rarityBuff : rarityDebuff};
            border:1px solid ${isBuff ? 'rgba(0,255,100,0.3)' : 'rgba(255,60,60,0.3)'};
            border-radius:6px; padding:4px 9px; font-size:10px;
            color:${isBuff ? '#55ff99' : '#ff6677'}; cursor:default;
          `;
        badge.textContent = `${label}${stacks}`;
        frag.appendChild(badge);
      });
      statusEl.appendChild(frag);
    }

    const items = gs.player.items;
    itemEl.textContent = '';
    if (!items.length) {
      const none = doc.createElement('span');
      none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
      none.textContent = '없음';
      itemEl.appendChild(none);
    } else {
      const rarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };
      const rarityBorderCol = { common: 'rgba(150,150,180,0.2)', uncommon: 'rgba(123,47,255,0.35)', rare: 'rgba(240,180,41,0.4)', legendary: 'rgba(192,132,252,0.5)' };
      const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
      const sorted = [...items].sort((a, b) => (rarityOrder[data.items[a]?.rarity || 'common'] ?? 3) - (rarityOrder[data.items[b]?.rarity || 'common'] ?? 3));

      const frag = doc.createDocumentFragment();
      sorted.forEach(id => {
        const item = data.items[id];
        if (!item) return;
        const rc = item.rarity || 'common';

        const row = doc.createElement('div');
        row.style.cssText = `display:flex; gap:10px; align-items:flex-start; background:rgba(255,255,255,0.025); border:1px solid ${rarityBorderCol[rc]}; border-radius:8px; padding:8px 10px;`;

        const icon = doc.createElement('span');
        icon.style.cssText = 'font-size:20px;flex-shrink:0;line-height:1.2;';
        icon.textContent = item.icon;

        const info = doc.createElement('div');
        const name = doc.createElement('div');
        name.style.cssText = `font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:${rarityColor[rc]};line-height:1.5;`;
        name.textContent = item.name;
        const desc = doc.createElement('div');
        desc.style.cssText = 'font-size:9px;color:var(--text-dim);line-height:1.5;';
        desc.textContent = item.desc;

        info.append(name, desc);
        row.append(icon, info);
        frag.appendChild(row);
      });
      itemEl.appendChild(frag);
    }
  },
};
