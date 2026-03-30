import { buildItemTooltipFallbackText } from './item_tooltip_fallback_text.js';
import { bindTooltipTrigger } from '../../../ui/ports/public_tooltip_support_capabilities.js';
import { getItemDetailNavIndex, isItemDetailCommitKey } from './item_detail_navigation.js';
import {
  applyCombatRelicPanelVisuals,
  applyCombatRelicSlotVisuals,
} from './combat_relic_visuals.js';
import { resolveItemDetailState } from './item_detail_state.js';
import { buildItemDetailViewModel } from './item_detail_view_model.js';
import {
  applyItemDetailPanelStyles,
  createManagedItemDetailSurface,
} from './item_detail_panel_ui.js';

const RARITY_SORT_ORDER = {
  boss: 0,
  legendary: 1,
  special: 2,
  rare: 3,
  uncommon: 4,
  common: 5,
};

function isPinned(detailPanel, itemId = '') {
  return detailPanel?.dataset?.open === 'true'
    && detailPanel?.dataset?.pinned === 'true'
    && detailPanel?.dataset?.itemId === itemId;
}

function supportsPointerPin(win) {
  return !!win && ('ontouchstart' in win || Number(win?.innerWidth || 0) < 900);
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');
  const detailPanelList = detailPanel ? doc?.getElementById?.('combatRelicPanelList') : null;
  const win = deps?.win || doc?.defaultView || null;
  const allowPointerPin = supportsPointerPin(win);

  const setBonusSystem = deps?.setBonusSystem || null;
  const detailSurface = createManagedItemDetailSurface({
    doc,
    win,
    detailPanel,
    detailPanelList,
    escapeHotkeyKey: 'combatRelicDetail',
    escapePriority: 350,
    escapeScopes: ['run'],
    entriesRoot: slotsEl,
    variant: 'combat',
    strategy: {
      beforeClear({ detailPanel: activePanel }) {
        if (!activePanel?.dataset) return;
        delete activePanel.dataset.rarity;
        delete activePanel.dataset.setState;
        applyCombatRelicPanelVisuals(activePanel);
      },
      afterShow({ detailPanel: activePanel, rarity = '', setState = '' }) {
        if (!activePanel?.dataset) return;
        if (rarity) activePanel.dataset.rarity = rarity;
        else delete activePanel.dataset.rarity;
        if (setState) activePanel.dataset.setState = setState;
        else delete activePanel.dataset.setState;
        applyCombatRelicPanelVisuals(activePanel, rarity);
      },
      shouldDismiss({ event, reason, detailPanel: activePanel }) {
        if (activePanel?.dataset?.open !== 'true') return false;
        if (reason === 'keydown') return event?.key === 'Escape';
        if (activePanel?.dataset?.pinned !== 'true') return false;
        const target = event?.target;
        return !slotsEl?.contains?.(target) && !activePanel?.contains?.(target);
      },
      onDismiss({ clear }) {
        clear();
      },
    },
  });
  const showDetail = (itemId, item, activeSlot, pinned = false) => {
    const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
    detailSurface.show({
      activeEntry: activeSlot,
      detail: buildItemDetailViewModel(itemId, item, data, state),
      itemId,
      pinned,
      rarity: activeSlot?.dataset?.rarity || String(state?.rarity || item?.rarity || 'common').toLowerCase(),
      setState: activeSlot?.dataset?.setState || '',
    });
  };

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];

  if (countEl) countEl.textContent = String(items.length);

  applyItemDetailPanelStyles(detailPanel, detailPanelList);
  detailSurface.clear();
  if (detailPanel) {
    detailPanel.__combatRelicDismissHandlers?.();
    detailPanel.__combatRelicDismissHandlers = detailSurface.bindDismiss();
  }

  if (!slotsEl) return;
  slotsEl.textContent = '';

  const sortedItems = [...items].filter((itemId) => !!data?.items?.[itemId]);

  const slotSortedItems = [...sortedItems].sort((leftId, rightId) => {
    const left = RARITY_SORT_ORDER[String(data?.items?.[leftId]?.rarity || 'common').toLowerCase()] ?? 3;
    const right = RARITY_SORT_ORDER[String(data?.items?.[rightId]?.rarity || 'common').toLowerCase()] ?? 3;
    return left - right;
  });
  const slotNodes = [];

  slotSortedItems.forEach((itemId, index) => {
    const item = data?.items?.[itemId];
    if (!item) return;
    const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
    const rarity = String(state?.rarity || item?.rarity || 'common').toLowerCase();
    const setTotal = Array.isArray(state?.setDef?.items) ? state.setDef.items.length : 0;
    const setState = setTotal > 0
      ? (state.setCount >= setTotal ? 'active' : state.setCount > 0 ? 'partial' : '')
      : '';

    const slot = doc.createElement('button');
    slot.type = 'button';
    slot.textContent = item.icon || '';
    slot.dataset.rarity = rarity;
    if (setState) slot.dataset.setState = setState;
    applyCombatRelicSlotVisuals(slot, rarity, setState, doc);
    slot.setAttribute('aria-label', buildItemTooltipFallbackText(item, itemId));
    slot.setAttribute('aria-controls', 'combatRelicPanel');
    slot.setAttribute('aria-pressed', 'false');
    const showSlotDetail = (activeSlot, pinned = false) => showDetail(itemId, item, activeSlot, pinned);
    const clearSlotDetail = () => {
      if (isPinned(detailPanel, itemId)) return;
      detailSurface.clear();
    };

    bindTooltipTrigger(slot, {
      label: buildItemTooltipFallbackText(item, itemId),
      show: () => {
        showSlotDetail(slot);
      },
      hide: clearSlotDetail,
    });

    slot.addEventListener('click', (event) => {
      if (allowPointerPin) {
        event?.preventDefault?.();
        if (isPinned(detailPanel, itemId)) {
          detailSurface.clear();
          return;
        }
        showSlotDetail(slot, true);
        return;
      }
      showSlotDetail(slot, false);
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
        showDetail(nextItemId, nextItem, nextSlot, detailPanel?.dataset?.pinned === 'true');
        return;
      }
      if (isItemDetailCommitKey(event?.key)) {
        event?.preventDefault?.();
        if (isPinned(detailPanel, itemId)) {
          detailSurface.clear();
          return;
        }
        showSlotDetail(slot, true);
      }
    });

    slotsEl.appendChild(slot);
    slotNodes.push(slot);
  });
}
