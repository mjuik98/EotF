import { buildItemTooltipFallbackText } from './item_tooltip_fallback_text.js';
import { getItemDetailNavIndex, isItemDetailCommitKey } from './item_detail_navigation.js';
import { resolveItemDetailState } from './item_detail_state.js';
import { buildItemDetailViewModel } from './item_detail_view_model.js';
import {
  applyItemDetailPanelStyles,
  renderItemDetailPanelContent,
} from './item_detail_panel_ui.js';

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

function setPanelOpen(detailPanel, isOpen, itemId = '', pinned = false) {
  if (!detailPanel?.dataset) return;
  detailPanel.dataset.open = isOpen ? 'true' : 'false';
  detailPanel.dataset.pinned = isOpen && pinned ? 'true' : 'false';
  if (isOpen && itemId) detailPanel.dataset.itemId = itemId;
  else delete detailPanel.dataset.itemId;
}

function markActiveSlot(slotsEl, activeSlot) {
  for (const slot of slotsEl?.children || []) {
    if (!slot) continue;
    if (slot === activeSlot) {
      if (slot.dataset) slot.dataset.active = 'true';
      slot.setAttribute?.('aria-pressed', 'true');
    } else {
      if (slot.dataset) delete slot.dataset.active;
      slot.setAttribute?.('aria-pressed', 'false');
    }
  }
}

function isPinned(detailPanel, itemId = '') {
  return detailPanel?.dataset?.open === 'true'
    && detailPanel?.dataset?.pinned === 'true'
    && detailPanel?.dataset?.itemId === itemId;
}

function renderDetailPanel({
  doc,
  detailPanel,
  detailPanelList,
  slotsEl,
  activeSlot,
  itemId,
  item,
  data,
  gs,
  setBonusSystem,
  pinned = false,
}) {
  if (!detailPanelList) {
    setPanelOpen(detailPanel, false);
    return;
  }

  const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
  const detail = buildItemDetailViewModel(itemId, item, data, state);
  renderItemDetailPanelContent(doc, detailPanelList, detail);
  setPanelOpen(detailPanel, true, itemId, pinned);
  markActiveSlot(slotsEl, activeSlot);
}

function closeDetailPanel(detailPanel, detailPanelList, slotsEl) {
  if (detailPanelList) detailPanelList.textContent = '';
  setPanelOpen(detailPanel, false);
  markActiveSlot(slotsEl, null);
}

function bindDismissHandlers({ doc, win, detailPanel, detailPanelList, slotsEl }) {
  if (!detailPanel) return;
  const prev = detailPanel.__combatRelicDismissHandlers;
  if (prev) {
    doc?.removeEventListener?.('pointerdown', prev.pointerdown, true);
    win?.removeEventListener?.('keydown', prev.keydown);
  }

  const pointerdown = (event) => {
    if (detailPanel?.dataset?.open !== 'true' || detailPanel?.dataset?.pinned !== 'true') return;
    const target = event?.target;
    if (slotsEl?.contains?.(target) || detailPanel?.contains?.(target)) return;
    closeDetailPanel(detailPanel, detailPanelList, slotsEl);
  };
  const keydown = (event) => {
    if (event?.key !== 'Escape' || detailPanel?.dataset?.open !== 'true') return;
    closeDetailPanel(detailPanel, detailPanelList, slotsEl);
  };

  doc?.addEventListener?.('pointerdown', pointerdown, true);
  win?.addEventListener?.('keydown', keydown);
  detailPanel.__combatRelicDismissHandlers = { pointerdown, keydown };
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');
  const detailPanelList = detailPanel ? doc?.getElementById?.('combatRelicPanelList') : null;
  const win = deps?.win || doc?.defaultView || null;

  const touchLikeViewport = isTouchLikeViewport(win);
  const setBonusSystem = deps?.setBonusSystem || null;

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];

  if (countEl) countEl.textContent = String(items.length);

  applyItemDetailPanelStyles(detailPanel, detailPanelList);
  closeDetailPanel(detailPanel, detailPanelList, slotsEl);
  bindDismissHandlers({ doc, win, detailPanel, detailPanelList, slotsEl });

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
  const slotNodes = [];

  slotSortedItems.forEach((itemId, index) => {
    const item = data?.items?.[itemId];
    if (!item) return;

    const slot = doc.createElement('button');
    slot.type = 'button';
    slot.textContent = item.icon || '';
    slot.setAttribute('aria-label', buildItemTooltipFallbackText(item, itemId));
    slot.setAttribute('aria-controls', 'combatRelicPanel');
    slot.setAttribute('aria-pressed', 'false');

    slot.addEventListener('mouseenter', () => {
      renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem });
    });
    slot.addEventListener('focus', () => {
      renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem });
    });
    slot.addEventListener('mouseleave', () => {
      if (isPinned(detailPanel, itemId)) return;
      closeDetailPanel(detailPanel, detailPanelList, slotsEl);
    });
    slot.addEventListener('blur', () => {
      if (isPinned(detailPanel, itemId)) return;
      closeDetailPanel(detailPanel, detailPanelList, slotsEl);
    });

    slot.addEventListener('click', (event) => {
      if (touchLikeViewport) event?.preventDefault?.();
      if (isPinned(detailPanel, itemId)) {
        closeDetailPanel(detailPanel, detailPanelList, slotsEl);
        return;
      }
      renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem, pinned: true });
    });
    slot.addEventListener('keydown', (event) => {
      const nextIndex = getItemDetailNavIndex(event?.key, index, slotNodes.length || slotSortedItems.length);
      if (nextIndex >= 0) {
        event?.preventDefault?.();
        const nextSlot = slotNodes[nextIndex];
        const nextItemId = slotSortedItems[nextIndex];
        const nextItem = data?.items?.[nextItemId];
        if (!nextSlot || !nextItem) return;
        nextSlot.focus?.();
        renderDetailPanel({
          doc,
          detailPanel,
          detailPanelList,
          slotsEl,
          activeSlot: nextSlot,
          itemId: nextItemId,
          item: nextItem,
          data,
          gs,
          setBonusSystem,
          pinned: detailPanel?.dataset?.pinned === 'true',
        });
        return;
      }
      if (isItemDetailCommitKey(event?.key)) {
        event?.preventDefault?.();
        if (isPinned(detailPanel, itemId)) {
          closeDetailPanel(detailPanel, detailPanelList, slotsEl);
          return;
        }
        renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem, pinned: true });
      }
    });

    slotsEl.appendChild(slot);
    slotNodes.push(slot);
  });
}
