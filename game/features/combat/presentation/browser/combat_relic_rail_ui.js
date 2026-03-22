import { RARITY_SORT_ORDER } from '../../../../../data/rarity_meta.js';

function normalizeRarity(rarity) {
  return String(rarity || 'common').toLowerCase();
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');

  const showItemTooltip = deps?.showItemTooltip || null;
  const hideItemTooltip = deps?.hideItemTooltip || null;

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];

  if (countEl) countEl.textContent = String(items.length);

  if (detailPanel && detailPanel.dataset.open !== 'true') {
    detailPanel.dataset.open = 'false';
  }

  if (!slotsEl) return;
  slotsEl.textContent = '';

  [...items]
    .sort((leftId, rightId) => {
      const left = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[leftId]?.rarity)] ?? 3;
      const right = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[rightId]?.rarity)] ?? 3;
      return left - right;
    })
    .forEach((itemId) => {
      const item = data?.items?.[itemId];
      if (!item) return;

      const slot = doc.createElement('button');
      slot.type = 'button';
      slot.textContent = item.icon || '';

      if (typeof showItemTooltip === 'function') {
        slot.addEventListener('mouseenter', (event) => {
          showItemTooltip(event, itemId);
        });
      }

      if (typeof hideItemTooltip === 'function') {
        slot.addEventListener('mouseleave', () => {
          hideItemTooltip();
        });
      }

      slotsEl.appendChild(slot);
    });
}
