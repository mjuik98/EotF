import { getMapNodeVisualFallback } from '../../domain/map_node_content.js';
import { canShowNextNodeOverlay } from '../../ports/presentation_shared_state_capabilities.js';
import {
  bindNextNodeCardInteractions,
  createNextNodeOverlayKeyHandler,
} from './map_ui_next_nodes_interactions.js';
import {
  cleanupNextNodeOverlay,
  getDoc,
  resolveNodeMeta,
  resolveTooltipUI,
} from './map_ui_next_nodes_overlay_helpers.js';
import {
  applyHpDangerClass,
  buildBottomDock,
  buildFloorBar,
  buildNextNodeCard,
  buildRelicPanel,
  ensureOverlayStructure,
  getRegionShortName,
  hexToRgb,
} from './map_ui_next_nodes_render.js';

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
  const accent = regionData.accent || '#7b2fff';
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
  const dot = doc.createElement('div');
  dot.className = 'nc-region-dot';
  const tagText = doc.createElement('span');
  tagText.textContent = shortRegionName;
  tag.append(dot, tagText);

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
    const { card } = buildNextNodeCard(doc, {
      node,
      index,
      meta,
    });
    bindNextNodeCardInteractions({
      card,
      deps,
      doc,
      hoverTint,
      meta,
      moveToNodeHandlerName,
      node,
      win,
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

  const keyHandler = createNextNodeOverlayKeyHandler({
    deps,
    doc,
    moveToNodeHandlerName,
    nodeMeta,
    nodes,
    overlay,
    row,
    toggleDeckView,
    win,
  });
  doc.addEventListener('keydown', keyHandler);
  overlay._ncKey = keyHandler;

  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'row';
  overlay.style.alignItems = 'stretch';
  overlay.style.pointerEvents = 'auto';

  const firstCard = typeof row.querySelectorAll === 'function'
    ? row.querySelectorAll('.node-card')[0]
    : null;
  firstCard?.focus?.();
}
