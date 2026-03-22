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
  renderItemDetailPanelContent,
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
  title.textContent = '현재 유물';
  panel.appendChild(title);

  const scrollWrap = doc.createElement('div');
  scrollWrap.className = 'nc-relic-scroll-wrap';
  const list = doc.createElement('div');
  list.className = 'nc-relic-list';
  const detailPanel = doc.createElement('div');
  detailPanel.className = 'nc-relic-detail';
  detailPanel.id = 'mapRelicDetailPanel';
  detailPanel.dataset.open = 'false';
  const detailList = doc.createElement('div');
  detailList.className = 'nc-relic-detail-list';
  detailPanel.appendChild(detailList);
  applyItemDetailPanelStyles(detailPanel, detailList, { variant: 'compact' });

  const markActiveSlot = (activeSlot) => {
    for (const slot of list.children || []) {
      if (!slot?.dataset) continue;
      if (slot === activeSlot) {
        slot.dataset.active = 'true';
        slot.setAttribute('aria-pressed', 'true');
      } else {
        delete slot.dataset.active;
        slot.setAttribute('aria-pressed', 'false');
      }
    }
  };

  const renderDetail = (itemId, item, activeSlot) => {
    const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
    const detail = buildItemDetailViewModel(itemId, item, data, state);
    renderItemDetailPanelContent(doc, detailList, detail, { variant: 'compact' });
    detailPanel.dataset.open = 'true';
    markActiveSlot(activeSlot);
  };

  if (items.length === 0) {
    const empty = doc.createElement('div');
    empty.className = 'nc-relic-empty';
    empty.textContent = '보유 유물 없음';
    list.appendChild(empty);
  } else {
    const sortedItems = [...items].sort((leftId, rightId) => (rarityOrder[data?.items?.[leftId]?.rarity || 'common'] ?? 3) - (rarityOrder[data?.items?.[rightId]?.rarity || 'common'] ?? 3));
    let firstRenderable = null;
    const slotNodes = [];
    sortedItems.forEach((itemId, index) => {
      const item = data?.items?.[itemId];
      if (!item) return;
      if (!firstRenderable) firstRenderable = { itemId, item };
      const rarity = String(item.rarity || 'common').toLowerCase();
      const meta = rarityMeta[rarity] || rarityMeta.common;
      const triggers = Array.isArray(item.trigger) ? item.trigger : [item.trigger];
      const isActive = triggers.some((trigger) => activeTriggers.has(String(trigger || '').toLowerCase()));
      const rawDesc = stripHtml(item.desc, 220);
      const summary = rawDesc.length > 28 ? `${rawDesc.slice(0, 28).trim()}…` : rawDesc;

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
      const effect = doc.createElement('div');
      effect.className = 'nc-relic-effect';
      effect.textContent = summary || '효과 정보 없음';
      info.append(name, effect);

      const pip = doc.createElement('div');
      pip.className = 'nc-relic-pip';
      pip.style.cssText = `background:${meta.pip};box-shadow:0 0 5px ${meta.pip};`;
      const selectSlot = () => renderDetail(itemId, item, slot);
      slot.addEventListener('mouseenter', selectSlot);
      slot.addEventListener('focus', selectSlot);
      slot.addEventListener('click', selectSlot);
      slot.addEventListener('keydown', (event) => {
        const nextIndex = getItemDetailNavIndex(event?.key, index, slotNodes.length || sortedItems.length);
        if (nextIndex >= 0) {
          event?.preventDefault?.();
          const nextSlot = slotNodes[nextIndex];
          const nextItemId = sortedItems[nextIndex];
          const nextItem = data?.items?.[nextItemId];
          if (!nextSlot || !nextItem) return;
          nextSlot.focus?.();
          renderDetail(nextItemId, nextItem, nextSlot);
          return;
        }
        if (isItemDetailCommitKey(event?.key)) {
          event?.preventDefault?.();
          selectSlot();
        }
      });

      slot.append(iconWrap, info, pip);
      list.appendChild(slot);
      slotNodes.push(slot);
    });
    if (firstRenderable) {
      const firstSlot = list.children[0] || null;
      renderDetail(firstRenderable.itemId, firstRenderable.item, firstSlot);
    }
  }

  scrollWrap.appendChild(list);
  panel.appendChild(scrollWrap);
  if (items.length > 0) panel.appendChild(detailPanel);

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
