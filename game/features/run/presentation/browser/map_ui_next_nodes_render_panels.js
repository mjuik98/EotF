import {
  MAP_NODE_TYPE_VISUAL_FALLBACK,
  NODE_EXTENSIONS,
  REWARD_CLASS_MAP,
  hexToRgb,
  runOnNextFrame,
  stripHtml,
} from './map_ui_next_nodes_render_helpers.js';
import {
  resolveItemDetailState,
  buildItemDetailViewModel,
  applyItemDetailPanelStyles,
  createManagedItemDetailSurface,
  getItemDetailNavIndex,
  isItemDetailCommitKey,
} from './relic_detail_shared_ui.js';

function regionIcon(name, fallback = '🧭') {
  const firstChar = Array.from(String(name || '').trim())[0] || '';
  return /\p{Extended_Pictographic}/u.test(firstChar) ? firstChar : fallback;
}

function buildRuleBanner(doc, regionData) {
  const banner = doc.createElement('div');
  banner.className = 'nc-rule-banner';
  const inner = doc.createElement('div');
  inner.className = 'nc-rule-inner';

  const icon = doc.createElement('span');
  icon.className = 'nc-rule-icon';
  icon.textContent = regionIcon(regionData?.name);

  const label = doc.createElement('span');
  label.className = 'nc-rule-label';
  label.textContent = regionData?.rule || '기본 규칙';

  const separator = doc.createElement('div');
  separator.className = 'nc-rule-sep';

  const desc = doc.createElement('span');
  desc.className = 'nc-rule-desc';
  desc.textContent = stripHtml(regionData?.ruleDesc || (regionData?.rule ? `${regionData.rule}이 적용됩니다.` : '')) || '별도 제약 없이 탐색과 전투가 이어집니다.';

  inner.append(icon, label, separator, desc);
  banner.appendChild(inner);
  return banner;
}

export function buildBottomDock(doc, regionData, options = {}) {
  const { nodeCount = 0, onShowFullMap = null, onToggleDeckView = null } = options;
  const bar = doc.createElement('div');
  bar.className = 'nc-bottom-bar';
  const items = [
    { keys: ['M'], label: '전체 지도', action: onShowFullMap },
    { keys: ['TAB'], label: '덱 보기', action: onToggleDeckView },
    { keys: Array.from({ length: Math.max(1, Math.min(3, nodeCount)) }, (_, index) => String(index + 1)), label: '경로 선택', action: null },
    { keys: ['ESC'], label: '설정', action: null },
  ];

  items.forEach((item, index) => {
    const entry = doc.createElement('div');
    entry.className = 'nc-bottom-item';
    if (typeof item.action === 'function') {
      entry.classList.add('is-actionable');
      entry.tabIndex = 0;
      entry.setAttribute('role', 'button');
      entry.addEventListener('click', () => item.action());
      entry.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        item.action();
      });
    }

    item.keys.forEach((key) => {
      const keyEl = doc.createElement('span');
      keyEl.className = 'nc-bottom-kbd';
      keyEl.textContent = key;
      entry.appendChild(keyEl);
    });

    const label = doc.createElement('span');
    label.className = 'nc-bottom-label';
    label.textContent = item.label;
    entry.appendChild(label);
    bar.appendChild(entry);

    if (index < items.length - 1) {
      const sep = doc.createElement('div');
      sep.className = 'nc-bottom-sep';
      bar.appendChild(sep);
    }
  });

  const dock = doc.createElement('div');
  dock.id = 'ncBottomDock';
  dock.className = 'nc-bottom-dock';
  dock.append(buildRuleBanner(doc, regionData), bar);
  return dock;
}

const FLOATING_RELIC_DETAIL_BREAKPOINT = 1180;
const FLOATING_RELIC_DETAIL_WIDTH = 240;
const FLOATING_RELIC_DETAIL_GAP = 14;
const FLOATING_RELIC_DETAIL_MIN_TOP = 56;
const FLOATING_RELIC_DETAIL_EDGE_PADDING = 12;

function getElementRect(element) {
  return typeof element?.getBoundingClientRect === 'function'
    ? element.getBoundingClientRect()
    : null;
}

function resolveRelicDetailPlacement(panel, detailPanel, win) {
  const viewportWidth = Number(win?.innerWidth) || 0;
  if (viewportWidth <= FLOATING_RELIC_DETAIL_BREAKPOINT) return 'inline';

  const panelRect = getElementRect(panel);
  const detailRect = getElementRect(detailPanel);
  const detailWidth = detailRect?.width || FLOATING_RELIC_DETAIL_WIDTH;
  if (!panelRect?.left) return 'floating-left';
  return panelRect.left >= detailWidth + 24 ? 'floating-left' : 'inline';
}

function resolveFloatingRelicDetailTop(panel, detailPanel, activeSlot) {
  const panelRect = getElementRect(panel);
  const detailRect = getElementRect(detailPanel);
  const slotRect = getElementRect(activeSlot);
  const detailHeight = detailRect?.height || detailPanel?.offsetHeight || 0;
  const panelHeight = panelRect?.height || panel?.clientHeight || 0;

  if (!panelRect || !slotRect || !detailHeight || !panelHeight) return FLOATING_RELIC_DETAIL_MIN_TOP;

  const idealTop = slotRect.top - panelRect.top + ((slotRect.height || 0) - detailHeight) / 2;
  const maxTop = Math.max(FLOATING_RELIC_DETAIL_MIN_TOP, panelHeight - detailHeight - FLOATING_RELIC_DETAIL_EDGE_PADDING);
  return Math.max(FLOATING_RELIC_DETAIL_MIN_TOP, Math.min(Math.round(idealTop), Math.round(maxTop)));
}

function applyRelicDetailLayout(panel, detailPanel, win, activeSlot = null) {
  if (!panel || !detailPanel) return;

  panel.style.position = 'relative';
  panel.style.overflow = 'visible';
  const placement = resolveRelicDetailPlacement(panel, detailPanel, win);
  detailPanel.dataset.placement = placement;
  detailPanel.style.transition = placement === 'floating-left'
    ? 'opacity .16s ease, transform .22s cubic-bezier(.22, 1, .36, 1)'
    : 'opacity .18s ease, transform .2s ease';
  detailPanel.style.transformOrigin = placement === 'floating-left' ? '100% 24px' : '50% 0';

  if (placement === 'floating-left') {
    detailPanel.style.position = 'absolute';
    detailPanel.style.top = `${resolveFloatingRelicDetailTop(panel, detailPanel, activeSlot)}px`;
    detailPanel.style.right = `calc(100% + ${FLOATING_RELIC_DETAIL_GAP}px)`;
    detailPanel.style.left = 'auto';
    detailPanel.style.bottom = 'auto';
    detailPanel.style.width = 'min(240px, calc(100vw - 48px))';
    detailPanel.style.marginTop = '0';
    detailPanel.style.zIndex = '2';
    return;
  }

  detailPanel.style.position = 'static';
  detailPanel.style.top = 'auto';
  detailPanel.style.right = 'auto';
  detailPanel.style.left = 'auto';
  detailPanel.style.bottom = 'auto';
  detailPanel.style.width = '100%';
  detailPanel.style.marginTop = '10px';
  detailPanel.style.zIndex = 'auto';
}

function animateRelicDetailPanel(detailPanel, deps = {}) {
  if (!detailPanel) return;
  const floating = detailPanel.dataset?.placement === 'floating-left';
  detailPanel.style.transform = floating ? 'translateX(10px) scale(.985)' : 'translateY(4px)';
  runOnNextFrame(() => {
    detailPanel.style.transform = floating ? 'translateX(0) scale(1)' : 'translateY(0)';
  }, deps);
}

export function buildRelicPanel(doc, gs, data, tooltipUI, deps = {}) {
  const rarityMeta = {
    legendary: { pip: '#c084fc', rgb: '192, 132, 252' },
    boss: { pip: '#ff3366', rgb: '255, 51, 102' },
    rare: { pip: '#f0b429', rgb: '240, 180, 41' },
    uncommon: { pip: '#00ffcc', rgb: '0, 255, 204' },
    common: { pip: '#8c9fc8', rgb: '140, 159, 200' },
  };
  const rarityOrder = { legendary: 0, boss: 0, rare: 1, uncommon: 2, common: 3 };
  const activeTriggers = new Set(['combat_start', 'floor_start', 'on_enter']);
  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];
  const win = deps?.win || doc?.defaultView || null;
  const setBonusSystem = deps?.setBonusSystem || null;
  const panel = doc.createElement('div');
  panel.className = 'nc-relic-panel';

  const title = doc.createElement('div');
  title.className = 'nc-relic-panel-title';
  title.style.display = 'flex';
  title.style.flexDirection = 'column';
  title.style.gap = '5px';
  const titleLabel = doc.createElement('span');
  titleLabel.textContent = '현재 유물';
  const titleHint = doc.createElement('span');
  titleHint.textContent = '유물에 마우스를 올리거나 선택하면 상세가 표시됩니다.';
  titleHint.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:.08em;line-height:1.5;color:rgba(176,180,216,.52);text-transform:none;transition:opacity .18s ease;';
  title.append(titleLabel, titleHint);
  panel.appendChild(title);

  const scrollWrap = doc.createElement('div');
  scrollWrap.className = 'nc-relic-scroll-wrap';
  const list = doc.createElement('div');
  list.className = 'nc-relic-list';
  const detailPanel = doc.createElement('div');
  detailPanel.className = 'nc-relic-detail';
  detailPanel.id = 'mapRelicDetailPanel';
  detailPanel.dataset.open = 'false';
  detailPanel.dataset.pinned = 'false';
  const detailList = doc.createElement('div');
  detailList.className = 'nc-relic-detail-list';
  detailPanel.appendChild(detailList);
  applyItemDetailPanelStyles(detailPanel, detailList, { variant: 'compact' });
  const detailSurface = createManagedItemDetailSurface({
    doc,
    detailPanel,
    detailPanelList: detailList,
    entriesRoot: list,
    variant: 'compact',
  });
  const setTitleHintVisible = (visible) => {
    titleHint.style.opacity = visible ? '1' : '0';
  };
  const clearDetail = () => {
    detailSurface.clear();
    setTitleHintVisible(true);
  };

  const renderDetail = (itemId, item, activeSlot, options = {}) => {
    const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
    const detail = buildItemDetailViewModel(itemId, item, data, state);
    detailSurface.show({
      activeEntry: activeSlot,
      detail,
      itemId,
      pinned: options.pinned === true,
    });
    setTitleHintVisible(false);
    applyRelicDetailLayout(panel, detailPanel, win, activeSlot);
    animateRelicDetailPanel(detailPanel, deps);
    runOnNextFrame(() => applyRelicDetailLayout(panel, detailPanel, win, activeSlot), deps);
  };

  if (items.length === 0) {
    const empty = doc.createElement('div');
    empty.className = 'nc-relic-empty';
    empty.textContent = '보유 유물 없음';
    list.appendChild(empty);
  } else {
    const sortedItems = [...items].sort((leftId, rightId) => (rarityOrder[data?.items?.[leftId]?.rarity || 'common'] ?? 3) - (rarityOrder[data?.items?.[rightId]?.rarity || 'common'] ?? 3));
    const slotNodes = [];
    sortedItems.forEach((itemId, index) => {
      const item = data?.items?.[itemId];
      if (!item) return;
      const rarity = String(item.rarity || 'common').toLowerCase();
      const meta = rarityMeta[rarity] || rarityMeta.common;
      const triggers = Array.isArray(item.trigger) ? item.trigger : [item.trigger];
      const isActive = triggers.some((trigger) => activeTriggers.has(String(trigger || '').toLowerCase()));
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
        if (detailPanel.dataset?.pinned === 'true') return;
        renderDetail(itemId, item, slot, { pinned: false });
      };
      const clearPreviewSlot = () => {
        if (detailPanel.dataset?.pinned === 'true') return;
        clearDetail();
      };
      const togglePinnedSlot = () => {
        const isPinned = detailPanel.dataset?.pinned === 'true';
        const isSameItem = detailPanel.dataset?.itemId === itemId;
        if (isPinned && isSameItem) {
          clearDetail();
          return;
        }
        renderDetail(itemId, item, slot, { pinned: true });
      };
      slot.addEventListener('mouseenter', previewSlot);
      slot.addEventListener('mouseleave', clearPreviewSlot);
      slot.addEventListener('focus', previewSlot);
      slot.addEventListener('blur', clearPreviewSlot);
      slot.addEventListener('click', togglePinnedSlot);
      slot.addEventListener('keydown', (event) => {
        const nextIndex = getItemDetailNavIndex(event?.key, index, slotNodes.length || sortedItems.length);
        if (nextIndex >= 0) {
          event?.preventDefault?.();
          const nextSlot = slotNodes[nextIndex];
          const nextItemId = sortedItems[nextIndex];
          const nextItem = data?.items?.[nextItemId];
          if (!nextSlot || !nextItem) return;
          nextSlot.focus?.();
          if (detailPanel.dataset?.pinned === 'true') return;
          renderDetail(nextItemId, nextItem, nextSlot, { pinned: false });
          return;
        }
        if (isItemDetailCommitKey(event?.key)) {
          event?.preventDefault?.();
          togglePinnedSlot();
          return;
        }
        if (event?.key === 'Escape') {
          event?.preventDefault?.();
          clearDetail();
        }
      });

      slot.append(iconWrap, info, pip);
      list.appendChild(slot);
      slotNodes.push(slot);
    });
  }

  scrollWrap.appendChild(list);
  panel.appendChild(scrollWrap);
  if (items.length > 0) panel.appendChild(detailPanel);
  applyRelicDetailLayout(panel, detailPanel, win, list.children[0] || null);
  setTitleHintVisible(items.length > 0);

  const updateFades = () => {
    if (!scrollWrap.classList?.toggle) return;
    const { scrollTop = 0, scrollHeight = 0, clientHeight = 0 } = scrollWrap;
    scrollWrap.classList.toggle('show-top', scrollTop > 8);
    scrollWrap.classList.toggle('show-bottom', scrollTop + clientHeight < scrollHeight - 8);
  };
  const handleWheel = (event) => {
    const canScroll = (scrollWrap.scrollHeight || 0) > (scrollWrap.clientHeight || 0) + 4;
    if (!canScroll) return;
    event.preventDefault?.();
    scrollWrap.scrollTop = (scrollWrap.scrollTop || 0) + (event.deltaY || 0);
    updateFades();
  };
  scrollWrap.addEventListener?.('scroll', updateFades, { passive: true });
  scrollWrap.addEventListener?.('wheel', handleWheel, { passive: false });
  runOnNextFrame(updateFades, deps);

  return panel;
}

export function buildNextNodeCard(doc, options = {}) {
  const { node, index = 0, meta = {} } = options;
  const ext = NODE_EXTENSIONS[node?.type] || NODE_EXTENSIONS.combat;
  const rgb = hexToRgb(meta.color);
  const pos = ['A', 'B', 'C', 'D', 'E'][node?.pos] || String((node?.pos || 0) + 1);
  const dangerLevel = ext.diff <= 0 ? 0 : (ext.diff < 50 ? 1 : (ext.diff < 75 ? 2 : 3));
  const rewardsHtml = ext.rewards.map((reward) => `<span class="nc-reward-tag ${REWARD_CLASS_MAP[reward] || 'gold'}">${reward}</span>`).join('');
  const traitsHtml = ext.traits.map((trait) => `<span class="nc-trait-tag${ext.diff === 0 ? ' neutral' : ''}">${trait}</span>`).join('');
  const skullsHtml = ext.diff > 0 ? `<div class="nc-danger-skulls">${[0, 1, 2].map((idx) => `<span class="nc-skull${idx < dangerLevel ? ' on' : ''}">☠</span>`).join('')}</div>` : '';

  const card = doc.createElement('div');
  card.className = 'node-card';
  card.dataset.cardIdx = String(index);
  card.dataset.nodeId = node.id;
  card.style.setProperty('--node-color', meta.color);
  card.style.setProperty('--node-rgb', rgb);
  card.style.animationDelay = `${index * 0.08}s`;
  card.innerHTML = `
    <div class="nc-kbd-badge">${index + 1}</div>
    ${ext.badge ? `<div class="nc-floor-badge">${node.floor}F</div>` : ''}
    <div class="nc-icon-area">
      <div class="nc-icon-bg"></div>
      <div class="nc-icon-grid"></div>
      <div class="node-card-icon">${meta.icon || MAP_NODE_TYPE_VISUAL_FALLBACK[node.type]?.icon || '?'}</div>
      ${skullsHtml}
    </div>
    <div class="nc-body">
      <div>
        <div class="node-card-label">${meta.label || '노드'}</div>
        <div class="node-card-sub">${pos} 경로</div>
      </div>
      <div class="node-card-desc">${meta.desc || '다음 위치로 이동합니다.'}</div>
      ${ext.preview ? `<div class="nc-preview-hint">예상: ${ext.preview}</div>` : ''}
      ${ext.diff > 0 ? `<div class="nc-diff-row"><span class="nc-diff-label">위험도</span><div class="nc-diff-track"><div class="nc-diff-fill" style="width:${ext.diff}%"></div></div><span class="nc-diff-val">${ext.diff}</span></div>` : ''}
      <div class="nc-info-grid">
        <div class="nc-info-cell">
          <span class="nc-info-cell-label">상대</span>
          <span class="nc-info-cell-value">${ext.enemies}</span>
        </div>
        <div class="nc-info-cell">
          <span class="nc-info-cell-label">특징</span>
          <div class="nc-traits-wrap">${traitsHtml}</div>
        </div>
      </div>
      <div class="nc-rewards-wrap">${rewardsHtml}</div>
    </div>
    <div class="node-card-cta">선택</div>
  `;

  return { card, rgb };
}
