import {
  DEBUFF_STATUS_KEYS,
  getEnemyStatusMeta,
  getEnemyStatusName,
  getPlayerStatusMeta,
} from '../../ports/presentation/public_combat_status_support_capabilities.js';
import { bindTooltipTrigger } from '../../../ui/ports/public_tooltip_support_capabilities.js';

export function buildEnemyStatusBadges(statusEffects, doc, handlers = {}) {
  const statusEntries = statusEffects ? Object.entries(statusEffects) : [];
  const fragment = doc.createDocumentFragment();

  statusEntries.forEach(([statusKey, statusValue]) => {
    if (statusKey === 'poisonDuration') return;

    const meta = getEnemyStatusMeta(statusKey);
    const playerMeta = getPlayerStatusMeta(statusKey);
    const label = playerMeta?.name || meta?.name || getEnemyStatusName(statusKey) || statusKey;
    const icon = meta?.icon || '?';
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
    const ariaLabel = `${label}${durationText ? ` ${durationText}` : ''}`;
    bindTooltipTrigger(badge, {
      label: ariaLabel,
      show(event) {
        handlers.onShowStatusTooltip?.(event, statusKey, statusValue, {
          doc,
          poisonDuration: statusEffects.poisonDuration,
        });
      },
      hide() {
        handlers.onHideStatusTooltip?.({ doc });
      },
    });

    fragment.appendChild(badge);
    fragment.appendChild(doc.createTextNode(' '));
  });

  return fragment;
}
