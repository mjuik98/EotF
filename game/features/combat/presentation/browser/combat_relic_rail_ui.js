import { RARITY_SORT_ORDER } from '../../../../../data/rarity_meta.js';

function resolveTooltipUI(deps) {
  return deps?.tooltipUI || deps?.TooltipUI || null;
}

function normalizeRarity(rarity) {
  return String(rarity || 'common').toLowerCase();
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const combatRelicRail = doc?.getElementById?.('combatRelicRail');
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');

  const tooltipUI = resolveTooltipUI(deps);
  const showItemTooltip = deps?.showItemTooltip || tooltipUI?.showItemTooltip || null;
  const hideItemTooltip = deps?.hideItemTooltip || tooltipUI?.hideItemTooltip || null;
  const win = deps?.win || doc?.defaultView || null;

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];
  const depsPayload = { doc, win, gs, data };

  if (detailPanel && detailPanel.dataset.open !== 'true') {
    detailPanel.dataset.open = 'false';
  }

  if (combatRelicRail && detailPanel && detailPanel.parentNode !== combatRelicRail) {
    combatRelicRail.appendChild(detailPanel);
  }

  if (countEl) {
    countEl.textContent = String(items.length);
  }

  if (detailPanel && countEl && countEl.parentNode !== detailPanel) {
    detailPanel.appendChild(countEl);
  }

  if (!slotsEl) return;

  slotsEl.textContent = '';
  if (detailPanel && slotsEl.parentNode !== detailPanel) {
    detailPanel.appendChild(slotsEl);
  }

  if (!items.length) {
    const none = doc.createElement('div');
    none.className = 'combat-relic-rail-empty';
    none.textContent = '보유 유물 없음';
    slotsEl.appendChild(none);
    return;
  }

  const sortedItems = [...items].sort((leftId, rightId) => {
    const leftRarity = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[leftId]?.rarity)] ?? 3;
    const rightRarity = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[rightId]?.rarity)] ?? 3;
    return leftRarity - rightRarity;
  });

  sortedItems.forEach((itemId) => {
    const item = data?.items?.[itemId];
    if (!item) return;

    const button = doc.createElement('button');
    const rarity = normalizeRarity(item.rarity);
    button.className = `combat-relic-btn ${item.rarity ? `relic-${rarity}` : 'relic-common'}`;
    button.type = 'button';
    button.dataset.item = itemId;
    button.textContent = item.icon || '?';

    if (typeof showItemTooltip === 'function') {
      button.addEventListener('mouseenter', (event) => {
        showItemTooltip(event, itemId, depsPayload);
      });
    }

    if (typeof hideItemTooltip === 'function') {
      button.addEventListener('mouseleave', () => {
        hideItemTooltip(depsPayload);
      });
    }

    slotsEl.appendChild(button);
  });
}
