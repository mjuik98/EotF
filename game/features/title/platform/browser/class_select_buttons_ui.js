import { DescriptionUtils } from '../../../ui/ports/public_text_support_capabilities.js';

import {
  buildItemDetailViewModel,
  applyItemDetailPanelStyles,
  createManagedItemDetailSurface,
  setItemDetailPanelState,
} from './relic_detail_shared_ui.js';
import {
  bindClassRelicDetailTrigger,
  bindClassTraitTooltip,
} from './class_select_button_bindings.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function buildStartRelicDetail(itemId, item) {
  return buildItemDetailViewModel(
    itemId,
    item,
    { items: { [itemId]: item } },
    {
      rarity: String(item?.rarity || 'common').toLowerCase(),
      triggerText: '시작 유물',
    },
  );
}

export function renderClassSelectButtons(container, deps = {}) {
  if (!container) {
    console.error('[ClassSelectUI] No container found for rendering buttons');
    return;
  }

  const data = deps.data;
  if (!data?.classes) return;

  const doc = getDoc(deps);
  const showTooltip = deps.showTooltip;
  const hideTooltip = deps.hideTooltip;
  container.innerHTML = '';
  const relicDetailPanel = doc.createElement('div');
  relicDetailPanel.id = 'classSelectRelicDetail';
  relicDetailPanel.className = 'class-select-relic-panel';
  setItemDetailPanelState(relicDetailPanel, { open: false });
  const relicDetailList = doc.createElement('div');
  relicDetailPanel.appendChild(relicDetailList);
  applyItemDetailPanelStyles(relicDetailPanel, relicDetailList, { variant: 'inline' });
  const relicEntries = [];
  const detailSurface = createManagedItemDetailSurface({
    doc,
    detailPanel: relicDetailPanel,
    detailPanelList: relicDetailList,
    escapeHotkeyKey: 'classSelectRelicDetail',
    escapePriority: 350,
    escapeScopes: ['title'],
    entries: () => relicEntries,
    variant: 'inline',
  });
  let firstRelicDetail = null;

  Object.values(data.classes).forEach((cls) => {
    const startItemKey = cls.startRelic;
    const startItem = data.items?.[startItemKey];
    const itemInfo = startItem ? `${startItem.icon} 시작 유물: ${startItem.name}` : '';

    const btn = doc.createElement('button');
    btn.id = `class_${cls.id}`;
    btn.className = 'class-btn';
    btn.dataset.class = cls.id;

    btn.innerHTML = `
      <div class="class-btn-icon-container">
        <span class="class-btn-emoji">${cls.emoji}</span>
      </div>
      <div class="class-btn-name">${cls.name}</div>
      <div class="class-btn-style">${cls.style}</div>
      <div class="class-btn-desc">${DescriptionUtils.highlight(cls.desc || '')}</div>
      <div class="class-btn-trait class-btn-starting-relic">✦ 고유 특성: ${cls.traitName}</div>
      <div class="class-btn-relic class-btn-starting-relic">${itemInfo}</div>
    `;

    const traitEl = btn.querySelector('.class-btn-trait');
    bindClassTraitTooltip(traitEl, cls, { showTooltip, hideTooltip });

    const relicEl = btn.querySelector('.class-btn-relic');
    if (relicEl && startItem) {
      const relicBinding = bindClassRelicDetailTrigger(relicEl, {
        activeEntry: relicEl,
        item: startItem,
        itemId: startItemKey,
        detailSurface,
        renderDetail: buildStartRelicDetail,
      });
      relicEntries.push(relicEl);
      if (!firstRelicDetail && relicBinding) firstRelicDetail = relicBinding;
    }

    container.appendChild(btn);
  });

  if (firstRelicDetail) {
    detailSurface.show({
      activeEntry: firstRelicDetail.activeEntry,
      detail: buildStartRelicDetail(firstRelicDetail.itemId, firstRelicDetail.item),
      itemId: firstRelicDetail.itemId,
    });
    container.appendChild(relicDetailPanel);
  }
}
