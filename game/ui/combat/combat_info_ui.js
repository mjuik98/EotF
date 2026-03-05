import { RARITY_SORT_ORDER, RARITY_TEXT_COLORS } from '../../../data/rarity_meta.js';
import { COMBAT_INFO_ITEM_RARITY_BORDER_COLORS } from '../../../data/ui_rarity_styles.js';

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

function _resolveStatusInfo(statusMap, statusKey) {
  const key = String(statusKey || '');
  return statusMap?.[key] || statusMap?.[key.replace(/_plus$/i, '')] || null;
}

const _INFINITE_STATUS_KEYS = new Set([
  'resonance',
  'time_warp',
  'blessing_of_light',
  'berserk_mode',
  'unbreakable_wall',
]);

function _resolveStatusDisplayValue(statusKey, buff) {
  const stacks = Number(buff?.stacks || 0);
  if (!Number.isFinite(stacks) || stacks <= 0) return '';
  const key = String(statusKey || '').replace(/_plus$/i, '');
  const isInfiniteLike = !!buff?.permanent
    || stacks >= 99
    || (_INFINITE_STATUS_KEYS.has(key) && stacks >= 90);
  if (!isInfiniteLike) return stacks;

  const numericCandidates = [];

  if (key === 'blessing_of_light') numericCandidates.push(buff?.healPerTurn);
  if (key === 'time_warp') numericCandidates.push(buff?.energyPerTurn, buff?.nextEnergy);
  if (key === 'berserk_mode') numericCandidates.push(buff?.atkGrowth);
  if (key === 'divine_grace') numericCandidates.push(buff?.shieldBonus);
  if (key === 'soul_armor') numericCandidates.push(buff?.echoRegen);
  if (key === 'resonance' || key === 'acceleration') numericCandidates.push(buff?.dmgBonus);
  if (key === 'unbreakable_wall') numericCandidates.push(Math.max(1, Math.floor(stacks / 99)));

  numericCandidates.push(
    buff?.healPerTurn,
    buff?.energyPerTurn,
    buff?.nextEnergy,
    buff?.atkGrowth,
    buff?.shieldBonus,
    buff?.echoRegen,
    buff?.dmgBonus,
    buff?.amount,
    buff?.value,
  );

  const found = numericCandidates.find(v => Number.isFinite(v) && Number(v) > 0);
  return Number.isFinite(found) ? Math.floor(Number(found)) : '';
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
        resonance: '공격마다 위력 상승',
        acceleration: '이번 턴 피해 증가',
        soul_armor: '피해 감소',
        vanish: '다음 공격 크리티컬',
        immune: '이번 턴 피해 무효',
        shadow_atk: '그림자 공격 강화',
        mirror: '피해 반사',
        zeroCost: '카드 비용 0',
        dodge: '다음 적 공격 1회 회피',
        weakened: '공격력 50% 감소',
        slowed: '행동 지연',
        burning: '매 턴 5 화염 피해',
        cursed: '효과 감소',
        poisoned: '턴 시작 시 독 스택 × 5 피해',
        stunned: '행동 불가',
      };
      const frag = doc.createDocumentFragment();
      keys.forEach(k => {
        const b = buffs[k];
        const info = _resolveStatusInfo(statusKr, k);
        const isBuff = info ? info.buff : ['resonance', 'acceleration', 'soul_armor', 'vanish', 'immune', 'shadow_atk'].includes(k);
        const label = info ? `${info.icon} ${info.name}` : k;
        const displayVal = _resolveStatusDisplayValue(k, b);
        const stacks = displayVal !== '' ? ` (${displayVal})` : '';
        const desc = info?.desc || descMap[k] || '';

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
      const rarityBorderCol = COMBAT_INFO_ITEM_RARITY_BORDER_COLORS;
      const sorted = [...items].sort((a, b) => (RARITY_SORT_ORDER[data.items[a]?.rarity || 'common'] ?? 3) - (RARITY_SORT_ORDER[data.items[b]?.rarity || 'common'] ?? 3));

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
        name.style.cssText = `font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:${RARITY_TEXT_COLORS[rc] || 'var(--white)'};line-height:1.5;`;
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
