import {
  DEBUFF_STATUS_KEYS,
  getEnemyStatusMeta,
  getEnemyStatusName,
} from '../../ports/public_presentation_support_capabilities.js';

export function buildEnemyStatusBadges(statusEffects, doc, handlers = {}) {
  const statusEntries = statusEffects ? Object.entries(statusEffects) : [];
  const fragment = doc.createDocumentFragment();

  statusEntries.forEach(([statusKey, statusValue]) => {
    if (statusKey === 'poisonDuration') return;

    const label = getEnemyStatusName(statusKey) || statusKey;
    const icon = getEnemyStatusMeta(statusKey)?.icon || '?';
    const color = DEBUFF_STATUS_KEYS.includes(statusKey) ? '#ff6688' : '#88ccff';

    let displayDuration = statusValue;
    if (statusKey === 'poisoned' && statusEffects.poisonDuration !== undefined) {
      displayDuration = statusEffects.poisonDuration;
    }

    const durationText = displayDuration > 1 ? `(${displayDuration})` : '';
    const badge = doc.createElement('span');
    badge.className = 'enemy-status-badge';
    badge.style.cssText = `font-size:9px;background:rgba(255,255,255,0.05);border-radius:3px;padding:1px 4px;color:${color};cursor:help;`;
    badge.textContent = `${icon} ${label}${durationText}`;
    badge.addEventListener('mouseenter', (event) => handlers.onShowStatusTooltip?.(event, statusKey, statusValue, {
      doc,
      poisonDuration: statusEffects.poisonDuration,
    }));
    badge.addEventListener('mouseleave', () => handlers.onHideStatusTooltip?.({ doc }));

    fragment.appendChild(badge);
    fragment.appendChild(doc.createTextNode(' '));
  });

  return fragment;
}
