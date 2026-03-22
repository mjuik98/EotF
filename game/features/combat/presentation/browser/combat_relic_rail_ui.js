const RARITY_SORT_ORDER = {
  legendary: 0,
  epic: 1,
  rare: 2,
  uncommon: 3,
  common: 4,
};

function normalizeRarity(rarity) {
  return String(rarity || 'common').toLowerCase();
}

function isTouchLikeViewport(win) {
  if (!win) return false;
  return 'ontouchstart' in win || Number(win?.innerWidth || 0) < 900;
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');
  const detailPanelList = detailPanel ? doc?.getElementById?.('combatRelicPanelList') : null;
  const win = deps?.win || doc?.defaultView || null;

  const showItemTooltip = deps?.showItemTooltip || null;
  const hideItemTooltip = deps?.hideItemTooltip || null;
  const touchLikeViewport = isTouchLikeViewport(win);

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];

  if (countEl) countEl.textContent = String(items.length);

  if (detailPanel?.dataset) {
    detailPanel.dataset.open = 'false';
  }
  if (detailPanelList) detailPanelList.textContent = '';

  if (!slotsEl) return;
  slotsEl.textContent = '';

  const sortedItems = [...items].filter((itemId) => {
    return !!data?.items?.[itemId];
  });

  const slotSortedItems = [...sortedItems].sort((leftId, rightId) => {
    const left = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[leftId]?.rarity)] ?? 3;
    const right = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[rightId]?.rarity)] ?? 3;
    return left - right;
  });

  slotSortedItems.forEach((itemId) => {
    const item = data?.items?.[itemId];
    if (!item) return;

    const slot = doc.createElement('button');
    slot.type = 'button';
    slot.textContent = item.icon || '';

    if (typeof showItemTooltip === 'function') {
      slot.addEventListener('mouseenter', (event) => {
        showItemTooltip(event, itemId);
      });
      slot.addEventListener('focus', (event) => {
        showItemTooltip(event, itemId);
      });
    }

    if (typeof hideItemTooltip === 'function') {
      slot.addEventListener('mouseleave', () => {
        hideItemTooltip();
      });
      slot.addEventListener('blur', () => {
        hideItemTooltip();
      });
    }

    if (touchLikeViewport && typeof showItemTooltip === 'function') {
      slot.addEventListener('click', (event) => {
        event?.preventDefault?.();
        showItemTooltip(event, itemId);
      });
    }

    slotsEl.appendChild(slot);
  });
}
