import { GS } from '../../core/game_state.js';


const NODE_TYPE_CONFIG = {
  combat: { color: '#ff3366', icon: 'C' },
  elite: { color: '#f0b429', icon: 'E' },
  boss: { color: '#7b2fff', icon: 'B' },
  event: { color: '#00ffcc', icon: '?' },
  shop: { color: '#f0b429', icon: '$' },
  rest: { color: '#44ff88', icon: '+' },
};

const MINIMAP_HOVER_THRESHOLD = 12;
const FULL_MAP_HOVER_THRESHOLD = 18;
const NODE_TYPE_ORDER = ['combat', 'elite', 'boss', 'event', 'shop', 'rest'];

function _getDoc(deps) {
  return deps?.doc || document;
}

function _resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});
}

function _groupNodesByFloor(nodes = []) {
  const byFloor = new Map();
  nodes.forEach((node) => {
    const floorNodes = byFloor.get(node.floor);
    if (floorNodes) {
      floorNodes.push(node);
    } else {
      byFloor.set(node.floor, [node]);
    }
  });
  return byFloor;
}

function _getLinkedChildren(node, nodesByFloor, nodesById) {
  if (!node) return [];
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.map(childId => nodesById.get(childId)).filter(Boolean);
  }
  return nodesByFloor.get(node.floor + 1) || [];
}

function _toCanvasCoords(canvas, event) {
  if (!canvas || !event) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function _findClosestNodeEntry(entries, x, y, threshold) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const thresholdSq = threshold * threshold;
  let best = null;
  let bestSq = thresholdSq;
  entries.forEach((entry) => {
    const dx = entry.x - x;
    const dy = entry.y - y;
    const distSq = dx * dx + dy * dy;
    if (distSq <= bestSq) {
      best = entry;
      bestSq = distSq;
    }
  });
  return best;
}

function _getNodeStatusText(node) {
  if (!node) return '';
  if (node.visited) return '✅ 방문함';
  if (node.accessible) return '🔓 이동 가능';
  return '🔒 잠김';
}

function _updateMinimapHint(canvas, node, nodeMeta) {
  const hint = canvas?._minimapHintEl;
  if (!hint) return;
  if (!node) {
    hint.textContent = '';
    hint.style.opacity = '0';
    return;
  }
  const meta = nodeMeta?.[node.type] || {};
  hint.textContent = `${meta.icon || '?'} ${meta.label || '노드'} — ${node.floor}층`;
  hint.style.opacity = '1';
}

function _bindMinimapHover(canvas) {
  if (!canvas || canvas._minimapHoverPatched) return;
  canvas._minimapHoverPatched = true;

  canvas.addEventListener('mousemove', (event) => {
    const hoverData = canvas._minimapHoverData;
    if (!hoverData?.entries?.length) {
      canvas.style.cursor = 'default';
      _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const point = _toCanvasCoords(canvas, event);
    if (!point) {
      canvas.style.cursor = 'default';
      _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const closest = _findClosestNodeEntry(
      hoverData.entries,
      point.x,
      point.y,
      hoverData.threshold || MINIMAP_HOVER_THRESHOLD,
    );
    const nodeMeta = canvas._minimapNodeMeta || {};
    if (closest?.node) {
      canvas.style.cursor = 'pointer';
      _updateMinimapHint(canvas, closest.node, nodeMeta);
      return;
    }

    canvas.style.cursor = 'default';
    _updateMinimapHint(canvas, null, nodeMeta);
  });

  canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default';
    _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
  });
}

export const MapUI = {
  renderMinimap(deps = {}) {
    const gs = deps.gs;
    const canvas = deps.minimapCanvas;
    const ctx = deps.minimapCtx;
    if (!gs || !canvas || !ctx || !gs.mapNodes.length) {
      if (canvas?._minimapHintEl) {
        _updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      }
      return;
    }

    const doc = _getDoc(deps);
    const nodeMeta = _resolveNodeMeta(deps);
    const minimapHint = deps.minimapNodeHint || doc.getElementById('minimapNodeHint');
    canvas._minimapHintEl = minimapHint || null;
    canvas._minimapNodeMeta = nodeMeta;
    _bindMinimapHover(canvas);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, w, h);

    const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
    const floorH = (h - 20) / (maxFloor + 1);
    const nodeEntries = [];
    const nodesByFloor = _groupNodesByFloor(gs.mapNodes);
    const nodesById = new Map(gs.mapNodes.map(node => [node.id, node]));

    // 연결선 그리기
    gs.mapNodes.forEach(node => {
      const linkedChildren = _getLinkedChildren(node, nodesByFloor, nodesById);
      if (!linkedChildren.length) return;
      const nx = w * (node.pos + 1) / (node.total + 1);
      const ny = h - 10 - floorH * node.floor;

      linkedChildren.forEach((child) => {
        const cx2 = w * (child.pos + 1) / (child.total + 1);
        const cy2 = h - 10 - floorH * child.floor;

        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(cx2, cy2);

        const isVisited = node.visited && child.visited;
        const isNext = node.visited && child.accessible;
        const isCurrentPath = node.id === gs.currentNode?.id || child.id === gs.currentNode?.id;

        if (isCurrentPath) {
          // 현재 위치 연결선 - 강조
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.9)';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(0, 255, 204, 0.8)';
          ctx.shadowBlur = 8;
        } else if (isVisited) {
          // 방문한 경로 - 밝은 청록색
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.6)';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        } else if (isNext) {
          // 다음 이동 가능 - 보라색
          ctx.strokeStyle = 'rgba(123, 47, 255, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 0;
        } else {
          // 방문 안 함 - 어두운 회색
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 0.5;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // 리셋
      });
    });

    // 노드 그리기
    gs.mapNodes.forEach(node => {
      const nx = w * (node.pos + 1) / (node.total + 1);
      const ny = h - 10 - floorH * node.floor;
      const r = node.type === 'boss' ? 8 : 5;
      const isCurrent = gs.currentNode?.id === node.id;
      nodeEntries.push({ node, x: nx, y: ny });

      // 노드 아이콘/이모지 렌더링
      const nodeMetaInfo = nodeMeta[node.type] || { icon: '?' };

      // 방문한 노드 - 밝은 청록색, 현재 위치 - 흰색 글로우, 그 외 - 회색
      if (isCurrent) {
        // 현재 위치 - 흰색 글로우
        ctx.beginPath();
        ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#fff';
      } else if (node.visited) {
        // 방문한 노드 - 밝은 청록색
        ctx.shadowColor = 'rgba(0, 255, 204, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = 'rgba(0, 255, 204, 0.9)';
      } else if (node.accessible && !node.visited) {
        // 이동 가능 - 펄스 강조
        const pulse = Math.sin(Date.now() / 500 + node.floor * 0.8 + node.pos) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + pulse * 0.35})`;
        ctx.shadowColor = `rgba(123, 47, 255, ${0.4 + pulse * 0.5})`;
        ctx.shadowBlur = 6 + pulse * 10;
      } else {
        // 방문 불가 - 어두운 회색
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.shadowBlur = 0;
      }

      ctx.font = `bold ${r * 1.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nodeMetaInfo.icon || '?', nx, ny);
      ctx.shadowBlur = 0; // 리셋
      ctx.shadowColor = 'transparent';

      // 현재 위치 추가 강조
      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    canvas._minimapHoverData = {
      entries: nodeEntries,
      threshold: MINIMAP_HOVER_THRESHOLD,
    };
  },

  updateNextNodes(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    const doc = _getDoc(deps);
    const nextFloor = gs.currentFloor + 1;
    const nodes = gs.mapNodes.filter(n => n.floor === nextFloor && n.accessible && !n.visited);

    const overlay = doc.getElementById('nodeCardOverlay');
    const row = doc.getElementById('nodeCardRow');
    const title = doc.getElementById('nodeCardTitle');
    if (!overlay || !row) return;
    if (
      gs.currentScreen !== 'game' ||
      gs.combat.active ||
      gs._nodeMoveLock ||
      gs._rewardLock ||
      gs._endCombatScheduled ||
      gs._endCombatRunning
    ) {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      return;
    }

    if (nodes.length === 0) {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      return;
    }

    const getFloorStatusText = deps.getFloorStatusText;
    const getRegionData = deps.getRegionData || window.getRegionData;
    if (title && typeof getFloorStatusText === 'function') {
      title.textContent = `${getFloorStatusText(gs.currentRegion, gs.currentFloor)} - 이동 경로를 선택하세요`;
    }

    const moveToNodeHandlerName = deps.moveToNodeHandlerName || 'moveToNode';
    const nodeMeta = deps.nodeMeta || {};

    row.textContent = '';
    nodes.forEach((n, idx) => {
      const m = nodeMeta[n.type] || nodeMeta.combat || {
        color: '#ff3366',
        icon: NODE_TYPE_CONFIG.combat.icon,
        label: '전투',
        desc: '다음 교전을 준비합니다.',
      };
      const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: '지역' };
      const pos = ['A', 'B', 'C', 'D'][n.pos] || String(n.pos + 1);

      const card = doc.createElement('div');
      card.className = 'node-card';
      card.style.setProperty('--node-color', m.color);
      card.style.animationDelay = `${idx * 0.07}s`;

      card.addEventListener('click', () => {
        const handler = window[moveToNodeHandlerName];
        if (typeof handler === 'function') handler(n.id);
      });

      const icon = doc.createElement('div');
      icon.className = 'node-card-icon';
      icon.textContent = m.icon || NODE_TYPE_CONFIG[n.type]?.icon || '?';

      const label = doc.createElement('div');
      label.className = 'node-card-label';
      label.textContent = m.label || '노드';

      const sub = doc.createElement('div');
      sub.className = 'node-card-sub';
      sub.textContent = `${regionData.name} ${n.floor}층 — ${pos}구역`;

      const desc = doc.createElement('div');
      desc.className = 'node-card-desc';
      desc.textContent = m.desc || '다음 위치로 이동합니다.';

      const cta = doc.createElement('div');
      cta.className = 'node-card-cta';
      cta.textContent = '선택';

      card.append(icon, label, sub, desc, cta);
      row.appendChild(card);
    });

    overlay.style.display = 'flex';
    overlay.style.pointerEvents = 'auto';
  },

  /** 미니맵 클릭 시 전체 지도를 큰 오버레이로 표시 */
  showFullMap(deps = {}) {
    const gs = deps.gs;
    const doc = _getDoc(deps);
    if (!gs || !gs.mapNodes.length) return;

    // 기존 오버레이가 있으면 토글(닫기)
    const existing = doc.getElementById('fullMapOverlay');
    if (existing) {
      if (typeof existing._closeFullMap === 'function') existing._closeFullMap();
      else existing.remove();
      return;
    }

    const overlay = doc.createElement('div');
    overlay.id = 'fullMapOverlay';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:300;
        background:rgba(5,5,18,0.95); backdrop-filter:blur(12px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:default; animation:fadeInDown 0.3s ease both;
      `;
    let closed = false;
    let onOverlayKeyDown = null;
    const closeOverlay = () => {
      if (closed) return;
      closed = true;
      if (onOverlayKeyDown) {
        doc.removeEventListener('keydown', onOverlayKeyDown, true);
      }
      overlay.remove();
    };
    overlay._closeFullMap = closeOverlay;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
    onOverlayKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      closeOverlay();
    };
    doc.addEventListener('keydown', onOverlayKeyDown, true);

    // 타이틀
    const title = doc.createElement('div');
    title.style.cssText = `font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.3em;color:var(--echo-bright,#b388ff);margin-bottom:20px;`;
    const getRegionData = deps.getRegionData || window.getRegionData;
    const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: '지역' };
    title.textContent = `📍 ${regionData.name} — ${gs.currentFloor || 0}층`;
    overlay.appendChild(title);

    // 캔버스
    const canvas = doc.createElement('canvas');
    const cw = Math.min(700, window.innerWidth - 60);
    const ch = Math.min(580, window.innerHeight - 160);
    canvas.width = cw; canvas.height = ch;
    canvas.style.cssText = `border:1px solid rgba(123,47,255,0.3);border-radius:12px;background:rgba(0,0,0,0.6);`;
    overlay.appendChild(canvas);

    const tooltip = doc.createElement('div');
    tooltip.style.cssText = `
      position:fixed; z-index:400; pointer-events:none;
      background:rgba(5,5,18,0.95); border:1px solid rgba(123,47,255,0.6);
      border-radius:8px; padding:10px 14px; font-family:'Share Tech Mono',monospace;
      font-size:12px; color:#fff; transition:opacity 0.15s; opacity:0;
      box-shadow: 0 0 16px rgba(123,47,255,0.4);
      max-width: 260px;
    `;
    const tooltipTitle = doc.createElement('div');
    tooltipTitle.style.cssText = `font-weight:700;margin-bottom:5px;`;
    const tooltipDesc = doc.createElement('div');
    tooltipDesc.style.cssText = `color:rgba(255,255,255,0.82);line-height:1.4;margin-bottom:6px;`;
    const tooltipStatus = doc.createElement('div');
    tooltipStatus.style.cssText = `color:rgba(255,255,255,0.68);font-size:11px;`;
    tooltip.append(tooltipTitle, tooltipDesc, tooltipStatus);
    overlay.appendChild(tooltip);

    const ctx = canvas.getContext('2d');
    const maxFloor = Math.max(...gs.mapNodes.map(n => n.floor));
    const padY = 35;
    const padX = 50;
    const floorH = (ch - padY * 2) / Math.max(maxFloor, 1);
    const nodeMeta = _resolveNodeMeta(deps);
    const nodeMap = new Map(gs.mapNodes.map(node => [node.id, node]));
    const nodesByFloor = _groupNodesByFloor(gs.mapNodes);

    // 층 라벨 (좌측)
    for (let f = 0; f <= maxFloor; f++) {
      const fy = ch - padY - floorH * f;
      ctx.fillStyle = (f === gs.currentFloor) ? '#00ffcc' : 'rgba(255,255,255,0.2)';
      ctx.font = '11px "Share Tech Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`${f}F`, 8, fy);
      // 수평 가이드 라인
      ctx.beginPath();
      ctx.moveTo(padX - 10, fy);
      ctx.lineTo(cw - 10, fy);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 노드 위치 계산 함수
    const nodeX = (node) => padX + (cw - padX * 2) * (node.pos + 1) / (node.total + 1);
    const nodeY = (node) => ch - padY - floorH * node.floor;
    const nodeEntries = gs.mapNodes.map(node => ({
      node,
      x: nodeX(node),
      y: nodeY(node),
    }));
    const nodeEntryById = new Map(nodeEntries.map(entry => [entry.node.id, entry]));

    // 연결선 그리기
    gs.mapNodes.forEach(node => {
      const linkedChildren = _getLinkedChildren(node, nodesByFloor, nodeMap);
      if (!linkedChildren.length) return;
      const nodeEntry = nodeEntryById.get(node.id);
      if (!nodeEntry) return;
      const nx = nodeEntry.x;
      const ny = nodeEntry.y;
      linkedChildren.forEach((child) => {
        if (!child) return;
        const childEntry = nodeEntryById.get(child.id);
        if (!childEntry) return;
        const cx2 = childEntry.x;
        const cy2 = childEntry.y;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(cx2, cy2);

        const isPath = node.visited && child.visited;
        const isNext = node.visited && child.accessible;
        const isVisitedPath = node.visited && (child.visited || child.id === gs.currentNode?.id);

        if (isVisitedPath || isPath) {
          ctx.strokeStyle = 'rgba(0, 255, 204, 0.62)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0, 255, 204, 0.45)';
          ctx.shadowBlur = 4;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;

          const midX = (nx + cx2) / 2;
          const midY = (ny + cy2) / 2;
          ctx.fillStyle = 'rgba(0,255,204,0.78)';
          ctx.beginPath();
          ctx.arc(midX, midY, 2.4, 0, Math.PI * 2);
          ctx.fill();
          return;
        } else if (isNext) {
          ctx.strokeStyle = 'rgba(123, 47, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]); // 잠긴 경로는 점선 처리
        }
        ctx.stroke();
        ctx.setLineDash([]); // 리셋
      });
    });

    // 노드 그리기
    nodeEntries.forEach(entry => {
      const { node, x: nx, y: ny } = entry;
      const meta = nodeMeta[node.type] || { color: '#666', icon: '?', label: '?' };
      const isCurrent = gs.currentNode?.id === node.id;
      const r = node.type === 'boss' ? 18 : 14;
      const isPastVisited = node.visited && !isCurrent && node.floor < gs.currentFloor;
      const isForwardNode = !node.visited && node.floor > gs.currentFloor;

      ctx.save();
      if (isPastVisited) {
        ctx.globalAlpha = 0.32;
        ctx.filter = 'grayscale(85%) brightness(0.55)';
      }

      // 글로우 효과 (현재 위치만 최소화)
      if (isCurrent) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,204,0.2)';
        ctx.fill();
      }

      // 노드 원 장식 제거 (외곽선 및 배경 채우기 모두 제거)
      // 오직 이모지와 현재 위치 글로우만 남김

      if (node.accessible && !node.visited) {
        ctx.beginPath();
        ctx.arc(nx, ny, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(123,47,255,0.65)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 아이콘
      if (isCurrent) {
        ctx.fillStyle = '#000';
      } else if (node.accessible && !node.visited) {
        ctx.fillStyle = '#ffffff';
      } else if (isForwardNode) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
      } else if (node.visited) {
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
      }
      ctx.font = `bold ${r * 1.8}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(meta.icon || NODE_TYPE_CONFIG[node.type]?.icon || '?', nx, ny);
      ctx.restore();
    });

    const updateTooltip = (node, event) => {
      if (!node || !event) {
        tooltip.style.opacity = '0';
        return;
      }
      const meta = nodeMeta[node.type] || { icon: '?', label: '노드', color: '#ffffff', desc: '다음 위치로 이동합니다.' };
      tooltipTitle.style.color = meta.color || '#ffffff';
      tooltipTitle.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
      tooltipDesc.textContent = meta.desc || '다음 위치로 이동합니다.';
      tooltipStatus.textContent = `${node.floor}층 — ${_getNodeStatusText(node)}`;
      tooltip.style.opacity = '1';

      const margin = 12;
      const offsetX = 18;
      const offsetY = 16;
      let left = event.clientX + offsetX;
      let top = event.clientY + offsetY;
      const vw = doc.documentElement?.clientWidth || doc.body?.clientWidth || canvas.width;
      const vh = doc.documentElement?.clientHeight || doc.body?.clientHeight || canvas.height;
      const rect = tooltip.getBoundingClientRect();
      if (left + rect.width + margin > vw) {
        left = Math.max(margin, event.clientX - rect.width - offsetX);
      }
      if (top + rect.height + margin > vh) {
        top = Math.max(margin, event.clientY - rect.height - offsetY);
      }
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };

    canvas.addEventListener('mousemove', (event) => {
      const point = _toCanvasCoords(canvas, event);
      if (!point) {
        updateTooltip(null, event);
        return;
      }
      const closest = _findClosestNodeEntry(nodeEntries, point.x, point.y, FULL_MAP_HOVER_THRESHOLD);
      updateTooltip(closest?.node || null, event);
    });
    canvas.addEventListener('mouseleave', () => updateTooltip(null, null));

    // 범례
    const legend = doc.createElement('div');
    legend.style.cssText = `display:flex;gap:14px;margin-top:14px;flex-wrap:wrap;justify-content:center;`;
    NODE_TYPE_ORDER.forEach((type) => {
      const meta = nodeMeta[type];
      if (!meta) return;
      const item = doc.createElement('span');
      item.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:11px;color:${meta.color || '#fff'};`;
      item.textContent = `${meta.icon || NODE_TYPE_CONFIG[type]?.icon || '?'} ${meta.label || '노드'}`;
      legend.appendChild(item);
    });
    overlay.appendChild(legend);

    const hint = doc.createElement('div');
    hint.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:10px;`;
    hint.textContent = '배경 클릭 또는 ESC로 닫기';
    overlay.appendChild(hint);

    const closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'premium-btn close-btn battle-chronicle-close-btn';
    closeBtn.textContent = '닫기';
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      closeOverlay();
    });
    overlay.appendChild(closeBtn);

    doc.body.appendChild(overlay);
  },
};
