import { getMapNodeVisualFallback } from '../../domain/map_node_content.js';
import { canShowNextNodeOverlay } from '../../../../shared/state/runtime_session_selectors.js';
import {
  applyHpDangerClass,
  buildBottomDock,
  buildFloorBar,
  buildNextNodeCard,
  buildRelicPanel,
  ensureOverlayStructure,
  getRegionShortName,
  hexToRgb,
  runOnNextFrame,
} from './map_ui_next_nodes_render.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || {};
}

function cleanupNextNodeOverlay(doc) {
  const overlay = doc?.getElementById?.('nodeCardOverlay');
  if (overlay?._ncKey) {
    doc.removeEventListener('keydown', overlay._ncKey);
    overlay._ncKey = null;
  }
}

function resolveTooltipUI(deps = {}) {
  return deps.tooltipUI
    || deps.TooltipUI
    || null;
}

function playSelectAnim(doc, card, rgb, onDone, deps = {}) {
  if (!doc?.body || !card?.getBoundingClientRect) {
    onDone?.();
    return;
  }

  let overlay = doc.getElementById('ncSelectOverlay');
  let flash = doc.getElementById('ncSelectFlash');

  if (!overlay) {
    overlay = doc.createElement('div');
    overlay.id = 'ncSelectOverlay';
    flash = doc.createElement('div');
    flash.id = 'ncSelectFlash';
    overlay.appendChild(flash);
    doc.body.appendChild(overlay);
  } else if (!flash) {
    flash = doc.createElement('div');
    flash.id = 'ncSelectFlash';
    overlay.appendChild(flash);
  }

  overlay.classList.add('active');
  const rect = card.getBoundingClientRect();
  const clone = card.cloneNode(true);
  clone.classList.add('nc-select-clone');
  clone.classList.add('is-cloned');
  clone.style.position = 'fixed';
  clone.style.margin = '0';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.transition = 'all 0.45s cubic-bezier(0.23, 1, 0.32, 1)';

  overlay.appendChild(clone);
  const prevVisibility = card.style.visibility;
  card.style.visibility = 'hidden';

  runOnNextFrame(() => runOnNextFrame(() => {
    const targetWidth = Math.min(rect.width * 1.12, 340);
    const targetHeight = rect.height * 1.08;
    const win = deps.win || { innerWidth: 1280, innerHeight: 720 };

    clone.style.left = `${((win.innerWidth || 1280) - targetWidth) / 2}px`;
    clone.style.top = `${((win.innerHeight || 720) - targetHeight) / 2}px`;
    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
  }, deps), deps);

  setTimeout(() => {
    if (flash) flash.style.background = `rgba(${rgb},.2)`;
    clone.style.opacity = '0';
    clone.style.transform = 'scale(1.12)';

    setTimeout(() => {
      if (flash) flash.style.background = 'transparent';
      overlay.classList.remove('active');
      clone.remove();
      card.style.visibility = prevVisibility;
      onDone?.();
    }, 300);
  }, 400);
}

export function getAccessibleNextNodes(gs) {
  if (!gs?.mapNodes?.length) return [];
  const nextFloor = Number(gs.currentFloor) + 1;
  const mapNodes = gs.mapNodes;
  return mapNodes.filter((node) => node.floor === nextFloor && node.accessible && !node.visited);
}

export function updateNextNodesOverlay(deps = {}) {
  const gs = deps.gs;
  if (!gs) return;

  const doc = getDoc(deps);
  const nodes = getAccessibleNextNodes(gs);
  const overlay = doc.getElementById('nodeCardOverlay');
  if (!overlay) return;

  const { row, title } = ensureOverlayStructure(doc, overlay);
  if (!canShowNextNodeOverlay(gs, nodes)) {
    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';
    overlay.classList.remove('nc-danger-critical', 'nc-danger-low');
    cleanupNextNodeOverlay(doc);
    return;
  }

  const getFloorStatusText = deps.getFloorStatusText;
  const getRegionData = deps.getRegionData;
  const moveToNodeHandlerName = deps.moveToNodeHandlerName || 'moveToNode';
  const nodeMeta = resolveNodeMeta(deps);
  const data = deps.data || {};
  const regionData = (typeof getRegionData === 'function'
    ? getRegionData(gs.currentRegion, gs)
    : null) || { name: '지역' };
  const shortRegionName = getRegionShortName(regionData.name) || regionData.name || '지역';
  const accent = regionData.accent || nodeMeta[nodes[0]?.type]?.color || '#44aa66';
  const accentRgb = hexToRgb(accent);
  const tooltipUI = resolveTooltipUI(deps);
  const win = deps.win || { innerWidth: 1280, innerHeight: 720 };

  if (title) {
    title.style.display = 'none';
    if (typeof getFloorStatusText === 'function') {
      title.textContent = `${getFloorStatusText(gs.currentRegion, gs.currentFloor)} - 이동 경로를 선택하세요`;
    }
  }

  doc.getElementById('ncMainArea')?.remove();
  doc.getElementById('ncBottomDock')?.remove();
  doc.getElementById('ncRelicPanel')?.remove();
  doc.getElementById('ncHoverTint')?.remove();
  cleanupNextNodeOverlay(doc);

  overlay.style.setProperty('--nc-accent', accent);
  overlay.style.setProperty('--nc-accent-rgb', accentRgb);

  const hoverTint = doc.createElement('div');
  hoverTint.id = 'ncHoverTint';
  hoverTint.className = 'nc-hover-tint';
  overlay.insertBefore(hoverTint, overlay.firstChild);

  const mainArea = doc.createElement('div');
  mainArea.id = 'ncMainArea';
  mainArea.className = 'nc-main-area';
  mainArea.appendChild(buildFloorBar(doc, gs, regionData, nodeMeta));
  applyHpDangerClass(overlay, gs);

  const titleArea = doc.createElement('div');
  titleArea.className = 'nc-title-area';

  const tag = doc.createElement('div');
  tag.className = 'nc-region-tag';
  tag.tabIndex = 0;
  tag.setAttribute('role', 'note');
  const dot = doc.createElement('div');
  dot.className = 'nc-region-dot';
  const tagText = doc.createElement('span');
  tagText.textContent = `${shortRegionName} · ${regionData.rule || '이동 경로'}`;
  tag.append(dot, tagText);
  const tagTooltipTitle = `${regionData.name || shortRegionName} - ${regionData.rule || '기본 규칙'}`;
  const tagTooltipBody = regionData.ruleDesc || regionData.desc || '이 지역의 규칙 설명이 아직 준비되지 않았습니다.';
  const showRegionTooltip = (event) => {
    if (typeof tooltipUI?.showGeneralTooltip !== 'function') return;
    tooltipUI.showGeneralTooltip(event, tagTooltipTitle, tagTooltipBody, { doc, win });
  };
  const hideRegionTooltip = () => {
    if (typeof tooltipUI?.hideGeneralTooltip !== 'function') return;
    tooltipUI.hideGeneralTooltip({ doc, win });
  };
  tag.addEventListener('mouseenter', showRegionTooltip);
  tag.addEventListener('mouseleave', hideRegionTooltip);
  tag.addEventListener('focus', showRegionTooltip);
  tag.addEventListener('blur', hideRegionTooltip);

  const subtitle = doc.createElement('div');
  subtitle.className = 'nc-subtitle';
  subtitle.textContent = '이동 경로를 선택하세요';

  titleArea.append(tag, subtitle);
  mainArea.appendChild(titleArea);

  row.textContent = '';
  row.className = 'node-card-row-special';

  nodes.forEach((node, index) => {
    if (index > 0) {
      const divider = doc.createElement('div');
      divider.className = 'nc-or-divider';
      divider.innerHTML = [
        '<div class="nc-or-line"></div>',
        '<div class="nc-or-text">OR</div>',
        '<div class="nc-or-line"></div>',
      ].join('');
      row.appendChild(divider);
    }

    const meta = nodeMeta[node.type] || nodeMeta.combat || {
      color: getMapNodeVisualFallback(node.type)?.color || '#7b2fff',
      icon: getMapNodeVisualFallback(node.type)?.icon || '?',
      label: node.type,
      desc: '다음 경로를 준비합니다.',
    };
    const { card, rgb } = buildNextNodeCard(doc, {
      node,
      index,
      meta,
      shortRegionName,
    });

    const triggerMove = () => {
      if (typeof deps.moveToNode === 'function') {
        deps.moveToNode(node.id);
        return;
      }
      const handler = win[moveToNodeHandlerName];
      if (typeof handler === 'function') handler(node.id);
    };

    card.addEventListener('mouseenter', () => {
      hoverTint.style.background = `radial-gradient(ellipse at 50% 58%,rgba(${rgb},.065) 0%,transparent 62%)`;
    });
    card.addEventListener('mouseleave', () => {
      hoverTint.style.background = 'transparent';
    });
    card.addEventListener('click', () => {
      playSelectAnim(doc, card, rgb, triggerMove, deps);
    });

    row.appendChild(card);
  });

  mainArea.appendChild(row);
  overlay.appendChild(mainArea);

  const relicPanel = buildRelicPanel(doc, gs, data, tooltipUI, deps);
  relicPanel.id = 'ncRelicPanel';
  overlay.appendChild(relicPanel);

  const toggleDeckView = () => {
    const deckModal = doc.getElementById('deckViewModal');
    const isOpen = deckModal?.classList?.contains('active');
    if (isOpen) {
      deps.closeDeckView?.();
    } else {
      deps.showDeckView?.();
    }
  };

  overlay.appendChild(buildBottomDock(doc, regionData, {
    nodeCount: nodes.length,
    onShowFullMap: typeof deps.showFullMap === 'function' ? () => deps.showFullMap() : null,
    onToggleDeckView: (typeof deps.showDeckView === 'function' || typeof deps.closeDeckView === 'function')
      ? toggleDeckView
      : null,
  }));

  const keyHandler = (event) => {
    if (overlay.style.display === 'none') return;
    if (event.key === 'm' || event.key === 'M') {
      if (typeof deps.showFullMap === 'function') {
        deps.showFullMap();
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Tab') {
      if (typeof deps.showDeckView === 'function' || typeof deps.closeDeckView === 'function') {
        event.preventDefault();
        toggleDeckView();
      }
      return;
    }
    const index = parseInt(event.key, 10) - 1;
    if (!Number.isFinite(index) || index < 0 || index >= nodes.length) return;
    const cards = typeof row.querySelectorAll === 'function'
      ? Array.from(row.querySelectorAll('.node-card'))
      : Array.from(row.children || []).filter((child) => String(child.className || '').includes('node-card'));
    const targetCard = cards[index];
    if (!targetCard) return;

    const meta = nodeMeta[nodes[index].type] || nodeMeta.combat || { color: '#7b2fff' };
    const rgb = hexToRgb(meta.color);
    playSelectAnim(doc, targetCard, rgb, () => {
      if (typeof deps.moveToNode === 'function') {
        deps.moveToNode(nodes[index].id);
        return;
      }
      const handler = win[moveToNodeHandlerName];
      if (typeof handler === 'function') handler(nodes[index].id);
    }, deps);
  };
  doc.addEventListener('keydown', keyHandler);
  overlay._ncKey = keyHandler;

  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'row';
  overlay.style.alignItems = 'stretch';
  overlay.style.pointerEvents = 'auto';
}
