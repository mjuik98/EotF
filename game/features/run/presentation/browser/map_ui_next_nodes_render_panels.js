import {
  MAP_NODE_TYPE_VISUAL_FALLBACK,
  NODE_EXTENSIONS,
  REWARD_CLASS_MAP,
  hexToRgb,
  runOnNextFrame,
} from './map_ui_next_nodes_render_helpers.js';
import { buildBottomDock } from './map_bottom_dock.js';
import {
  applyRelicDetailLayout,
} from './map_relic_detail_layout.js';
import { createRelicDetailSurfaceRuntime } from './map_ui_next_nodes_relic_detail_surface.js';
import { renderRelicSlots } from './map_ui_next_nodes_relic_slots.js';

export { buildBottomDock };

function animateRelicDetailPanel(detailPanel, deps = {}) {
  if (!detailPanel) return;
  const floating = detailPanel.dataset?.placement === 'floating-left';
  detailPanel.style.transform = floating ? 'translateX(10px) scale(.985)' : 'translateY(4px)';
  runOnNextFrame(() => {
    detailPanel.style.transform = floating ? 'translateX(0) scale(1)' : 'translateY(0)';
  }, deps);
}

export function buildRelicPanel(doc, gs, data, tooltipUI, deps = {}) {
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
  let detailPanel = null;
  const setTitleHintVisible = (visible) => {
    titleHint.style.opacity = visible ? '1' : '0';
  };

  if (items.length === 0) {
    const empty = doc.createElement('div');
    empty.className = 'nc-relic-empty';
    empty.textContent = '보유 유물 없음';
    list.appendChild(empty);
  } else {
    const detailRuntime = createRelicDetailSurfaceRuntime({
      doc,
      win,
      panel,
      list,
      data,
      gs,
      setBonusSystem,
      deps,
      onAnimate: (detailPanel) => animateRelicDetailPanel(detailPanel, deps),
      onTitleHintVisible: setTitleHintVisible,
    });

    renderRelicSlots(doc, list, items, data, {
      detailSurfaceState: detailRuntime.detailSurfaceState,
      renderDetail: detailRuntime.renderDetail,
      scheduleDetailClear: detailRuntime.scheduleDetailClear,
      clearDetail: detailRuntime.clearDetail,
    });

    detailPanel = detailRuntime.detailPanel;
    applyRelicDetailLayout(panel, detailPanel, win, list.children[0] || null);
  }

  scrollWrap.appendChild(list);
  panel.appendChild(scrollWrap);
  if (detailPanel) panel.appendChild(detailPanel);
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
