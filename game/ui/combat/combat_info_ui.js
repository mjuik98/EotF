import { RARITY_SORT_ORDER, RARITY_TEXT_COLORS } from '../../../data/rarity_meta.js';
import { COMBAT_INFO_ITEM_RARITY_BORDER_COLORS } from '../../../data/ui_rarity_styles.js';
import { PLAYER_STATUS_FALLBACK_BUFF_KEYS } from '../../../data/status_key_data.js';
import { getStatusDisplayValue } from '../../utils/status_value_utils.js';

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
      const frag = doc.createDocumentFragment();
      keys.forEach(k => {
        const b = buffs[k];
        const info = _resolveStatusInfo(statusKr, k);
        const isBuff = info ? info.buff : PLAYER_STATUS_FALLBACK_BUFF_KEYS.includes(k);
        const label = info ? `${info.icon} ${info.name}` : k;
        const displayVal = getStatusDisplayValue(k, b, { allowDegradedSentinel: true });
        const stacks = displayVal !== '' ? ` (${displayVal})` : '';
        const desc = info?.desc || '';

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
