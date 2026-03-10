import { PLAYER_STATUS_FALLBACK_BUFF_KEYS } from '../../../data/status_key_data.js';
import { getStatusDisplayValue } from '../../utils/status_value_utils.js';

function resolveStatusInfo(statusMap, statusKey) {
  const key = String(statusKey || '');
  return statusMap?.[key] || statusMap?.[key.replace(/_plus$/i, '')] || null;
}

export function renderCombatInfoStatuses({ doc, statusEl, buffs, statusKr }) {
  const keys = Object.keys(buffs || {});
  const rarityBuff = 'rgba(0,255,100,0.1)';
  const rarityDebuff = 'rgba(255,60,60,0.1)';

  statusEl.textContent = '';
  if (!keys.length) {
    const none = doc.createElement('span');
    none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
    none.textContent = '없음';
    statusEl.appendChild(none);
    return;
  }

  const frag = doc.createDocumentFragment();
  keys.forEach((key) => {
    const buff = buffs[key];
    const info = resolveStatusInfo(statusKr, key);
    const isBuff = info ? info.buff : PLAYER_STATUS_FALLBACK_BUFF_KEYS.includes(key);
    const label = info ? `${info.icon} ${info.name}` : key;
    const displayVal = getStatusDisplayValue(key, buff, { allowDegradedSentinel: true });
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
