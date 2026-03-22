import {
  buildItemDetailViewModel,
  applyItemDetailPanelStyles,
  renderItemDetailPanelContent,
} from './relic_detail_shared_ui.js';

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
  relicDetailPanel.dataset.open = 'false';
  const relicDetailList = doc.createElement('div');
  relicDetailPanel.appendChild(relicDetailList);
  applyItemDetailPanelStyles(relicDetailPanel, relicDetailList, { variant: 'inline' });
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
      <div class="class-btn-desc">${cls.desc}</div>
      <div class="class-btn-trait class-btn-starting-relic">✦ 고유 특성: ${cls.traitName}</div>
      <div class="class-btn-relic class-btn-starting-relic">${itemInfo}</div>
    `;

    const traitEl = btn.querySelector('.class-btn-trait');
    if (traitEl) {
      traitEl.style.cursor = 'help';
      traitEl.addEventListener('mouseenter', (event) => {
        event.stopPropagation();
        showTooltip?.(event, cls.traitTitle, cls.traitDesc);
      });
      traitEl.addEventListener('mouseleave', () => hideTooltip?.());
    }

    const relicEl = btn.querySelector('.class-btn-relic');
    if (relicEl && startItem) {
      const renderRelicDetail = (event) => {
        event?.stopPropagation?.();
        renderItemDetailPanelContent(doc, relicDetailList, buildStartRelicDetail(startItemKey, startItem), { variant: 'inline' });
        relicDetailPanel.dataset.open = 'true';
      };
      relicEl.style.cursor = 'pointer';
      relicEl.setAttribute('tabindex', '0');
      relicEl.setAttribute('role', 'button');
      relicEl.setAttribute('aria-controls', 'classSelectRelicDetail');
      relicEl.addEventListener('mouseenter', renderRelicDetail);
      relicEl.addEventListener('focus', renderRelicDetail);
      relicEl.addEventListener('click', renderRelicDetail);
      if (!firstRelicDetail) {
        firstRelicDetail = { itemId: startItemKey, item: startItem };
      }
    }

    container.appendChild(btn);
  });

  if (firstRelicDetail) {
    renderItemDetailPanelContent(doc, relicDetailList, buildStartRelicDetail(firstRelicDetail.itemId, firstRelicDetail.item), { variant: 'inline' });
    relicDetailPanel.dataset.open = 'true';
    container.appendChild(relicDetailPanel);
  }
}
