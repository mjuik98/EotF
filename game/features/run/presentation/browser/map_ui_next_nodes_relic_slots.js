import { stripHtml } from './map_ui_next_nodes_render_helpers.js';
import {
  getItemDetailNavIndex,
  isItemDetailCommitKey,
} from './relic_detail_shared_ui.js';

const RARITY_META = {
  legendary: { pip: '#c084fc', rgb: '192, 132, 252' },
  boss: { pip: '#ff3366', rgb: '255, 51, 102' },
  rare: { pip: '#f0b429', rgb: '240, 180, 41' },
  uncommon: { pip: '#00ffcc', rgb: '0, 255, 204' },
  common: { pip: '#8c9fc8', rgb: '140, 159, 200' },
};

const RARITY_ORDER = { legendary: 0, boss: 0, rare: 1, uncommon: 2, common: 3 };
const ACTIVE_TRIGGERS = new Set(['combat_start', 'floor_start', 'on_enter']);

function getResolvedRelicItems(items, data) {
  return [...items]
    .sort((leftId, rightId) => {
      const leftRarity = data?.items?.[leftId]?.rarity || 'common';
      const rightRarity = data?.items?.[rightId]?.rarity || 'common';
      return (RARITY_ORDER[leftRarity] ?? 3) - (RARITY_ORDER[rightRarity] ?? 3);
    })
    .map((itemId) => ({ itemId, item: data?.items?.[itemId] }))
    .filter(({ item }) => Boolean(item));
}

export function renderRelicSlots(doc, list, items, data, controls = {}) {
  const {
    detailSurfaceState,
    renderDetail,
    scheduleDetailClear,
    clearDetail,
  } = controls;
  const resolvedItems = getResolvedRelicItems(items, data);
  const slotNodes = [];

  resolvedItems.forEach(({ itemId, item }, index) => {
    const rarity = String(item.rarity || 'common').toLowerCase();
    const meta = RARITY_META[rarity] || RARITY_META.common;
    const triggers = Array.isArray(item.trigger) ? item.trigger : [item.trigger];
    const isActive = triggers.some((trigger) => ACTIVE_TRIGGERS.has(String(trigger || '').toLowerCase()));
    const rawDesc = stripHtml(item.desc, 220);

    const slot = doc.createElement('div');
    slot.className = `nc-relic-slot rarity-${rarity}${isActive ? ' is-active' : ''}`;
    slot.style.setProperty('--rl-rgb', meta.rgb);
    slot.tabIndex = 0;
    slot.setAttribute('role', 'button');
    slot.setAttribute('aria-pressed', 'false');
    slot.setAttribute('aria-controls', 'mapRelicDetailPanel');
    slot.setAttribute('aria-label', `${item.name || itemId}: ${rawDesc || ''}`);

    const iconWrap = doc.createElement('div');
    iconWrap.className = 'nc-relic-icon-wrap';
    iconWrap.textContent = item.icon || '✦';

    const info = doc.createElement('div');
    info.className = 'nc-relic-info';
    const name = doc.createElement('div');
    name.className = 'nc-relic-name';
    name.textContent = item.name || itemId;
    info.append(name);

    const pip = doc.createElement('div');
    pip.className = 'nc-relic-pip';
    pip.style.cssText = `background:${meta.pip};box-shadow:0 0 5px ${meta.pip};`;

    const previewSlot = () => {
      if (detailSurfaceState?.isPinned?.()) return;
      renderDetail?.(itemId, item, slot, { pinned: false });
    };
    const clearPreviewSlot = (event) => {
      scheduleDetailClear?.(event);
    };
    const togglePinnedSlot = () => {
      const isPinned = detailSurfaceState?.isPinned?.() === true;
      const isSameItem = detailSurfaceState?.getValue?.('itemId', '') === itemId;
      if (isPinned && isSameItem) {
        clearDetail?.();
        return;
      }
      renderDetail?.(itemId, item, slot, { pinned: true });
    };

    slot.addEventListener('mouseenter', previewSlot);
    slot.addEventListener('mouseleave', clearPreviewSlot);
    slot.addEventListener('focus', previewSlot);
    slot.addEventListener('blur', clearPreviewSlot);
    slot.addEventListener('click', togglePinnedSlot);
    slot.addEventListener('keydown', (event) => {
      const nextIndex = getItemDetailNavIndex(event?.key, index, slotNodes.length || resolvedItems.length);
      if (nextIndex >= 0) {
        event?.preventDefault?.();
        const nextSlot = slotNodes[nextIndex];
        const nextEntry = resolvedItems[nextIndex];
        if (!nextSlot || !nextEntry?.item) return;
        nextSlot.focus?.();
        if (detailSurfaceState?.isPinned?.()) return;
        renderDetail?.(nextEntry.itemId, nextEntry.item, nextSlot, { pinned: false });
        return;
      }
      if (isItemDetailCommitKey(event?.key)) {
        event?.preventDefault?.();
        togglePinnedSlot();
        return;
      }
      if (event?.key === 'Escape') {
        event?.preventDefault?.();
        clearDetail?.();
      }
    });

    slot.append(iconWrap, info, pip);
    list.appendChild(slot);
    slotNodes.push(slot);
  });

  return slotNodes;
}
