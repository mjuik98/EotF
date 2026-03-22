import { RARITY_SORT_ORDER } from '../../../../../data/rarity_meta.js';

function normalizeRarity(rarity) {
  return String(rarity || 'common').toLowerCase();
}

const COMBAT_RELIC_TRIGGERS = new Set(['combat_start', 'turn_start', 'turn_end', 'on_enter']);

function normalizeTrigger(trigger) {
  return String(trigger || '').toLowerCase().trim();
}

function hasCombatTrigger(item) {
  const triggerValue = item?.trigger;
  if (triggerValue == null) return false;
  const values = Array.isArray(triggerValue) ? triggerValue : [triggerValue];
  return values.some((trigger) => COMBAT_RELIC_TRIGGERS.has(normalizeTrigger(trigger)));
}

function renderRelicPanel(doc, detailPanel, detailPanelList, sortedItems, data) {
  if (!detailPanel || !detailPanelList) return;

  detailPanelList.textContent = '';
  sortedItems.forEach((itemId) => {
    const item = data?.items?.[itemId];
    if (!item) return;

    const entry = doc.createElement('div');
    entry.textContent = `${item?.name || itemId} - ${item?.desc || '효과 정보 없음'}`;
    detailPanelList.appendChild(entry);
  });
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');
  const detailPanelList = detailPanel
    ? doc?.getElementById?.('combatRelicPanelList') || detailPanel
    : null;

  const showItemTooltip = deps?.showItemTooltip || null;
  const hideItemTooltip = deps?.hideItemTooltip || null;

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];

  if (countEl) countEl.textContent = String(items.length);

  if (detailPanel && detailPanel.dataset.open !== 'true') {
    detailPanel.dataset.open = 'false';
  }

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

  const panelSortedItems = [...sortedItems].sort((leftId, rightId) => {
    const leftItem = data?.items?.[leftId];
    const rightItem = data?.items?.[rightId];
    const leftCombat = hasCombatTrigger(leftItem) ? 1 : 0;
    const rightCombat = hasCombatTrigger(rightItem) ? 1 : 0;
    if (leftCombat !== rightCombat) return rightCombat - leftCombat;

    const leftRarity = RARITY_SORT_ORDER[normalizeRarity(leftItem?.rarity)] ?? 3;
    const rightRarity = RARITY_SORT_ORDER[normalizeRarity(rightItem?.rarity)] ?? 3;
    if (leftRarity !== rightRarity) return leftRarity - rightRarity;

    return String(leftId).localeCompare(String(rightId));
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
      }

      if (typeof hideItemTooltip === 'function') {
        slot.addEventListener('mouseleave', () => {
          hideItemTooltip();
        });
      }

      if (detailPanel) {
        slot.addEventListener('click', () => {
          detailPanel.dataset.open = detailPanel.dataset.open === 'true' ? 'false' : 'true';
        });
      }

      slotsEl.appendChild(slot);
    });

  if (detailPanel && detailPanelList) {
    renderRelicPanel(doc, detailPanel, detailPanelList, panelSortedItems, data);
  }
}
