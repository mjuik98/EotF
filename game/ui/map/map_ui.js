import { GS } from '../../core/game_state.js';


const NODE_TYPE_CONFIG = {
  combat: { color: '#ff3366', icon: 'C' },
  elite: { color: '#f0b429', icon: 'E' },
  mini_boss: { color: '#ff6600', icon: 'M' },
  boss: { color: '#7b2fff', icon: 'B' },
  event: { color: '#00ffcc', icon: '?' },
  shop: { color: '#f0b429', icon: '$' },
  rest: { color: '#44ff88', icon: '+' },
};

const MINIMAP_HOVER_THRESHOLD = 12;
const FULL_MAP_HOVER_THRESHOLD = 18;
const NODE_TYPE_ORDER = ['combat', 'elite', 'mini_boss', 'boss', 'event', 'shop', 'rest'];

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

function _getVisibleFloors(gs) {
  const floors = new Set();
  if (!gs?.mapNodes?.length) return floors;
  gs.mapNodes.forEach((node) => {
    if (node?.visited || node?.id === gs.currentNode?.id) {
      floors.add(node.floor);
    }
  });
  if (Number.isFinite(gs?.currentFloor)) {
    floors.add(gs.currentFloor);
  }
  return floors;
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
    const visibleFloors = _getVisibleFloors(gs);
    const visibleNodeIds = new Set(
      gs.mapNodes
        .filter((node) => visibleFloors.has(node.floor))
        .map((node) => node.id),
    );

    // 연결선 그리기
    gs.mapNodes.forEach(node => {
      if (!visibleNodeIds.has(node.id)) return;
      const linkedChildren = _getLinkedChildren(node, nodesByFloor, nodesById);
      if (!linkedChildren.length) return;
      const nx = w * (node.pos + 1) / (node.total + 1);
      const ny = h - 10 - floorH * node.floor;

      linkedChildren.forEach((child) => {
        if (!visibleNodeIds.has(child.id)) return;
        const cx2 = w * (child.pos + 1) / (child.total + 1);
        const cy2 = h - 10 - floorH * child.floor;

        const isVisited = node.visited && child.visited;
        const isCurrentMove = node.id === gs.currentNode?.id && child.accessible;

        // [단순화] 이미 지나온 노드들 간의 경로(Visited)만 보라색 실선으로 표시
        if (isVisited) {
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(cx2, cy2);
          ctx.strokeStyle = 'rgba(123, 47, 255, 0.4)'; // 투명도 약간 조정
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.stroke();
        }
      });
    });

    // 노드 그리기
    gs.mapNodes.forEach(node => {
      if (!visibleNodeIds.has(node.id)) return;
      const nx = w * (node.pos + 1) / (node.total + 1);
      const ny = h - 10 - floorH * node.floor;
      const r = node.type === 'boss' ? 8 : (node.type === 'mini_boss' ? 7 : 5);
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
      } else if (node.accessible && !node.visited && node.floor === gs.currentFloor + 1) {
        // [단순화] 이동 가능한 다음 노드만 살짝 노출
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 0;
      } else if (node.visited) {
        // [반전] 방문한 노드는 좀 더 잘 보이게 (0.7)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 0;
      } else {
        // [반전] 지나친 노드 및 비활성 노드는 거의 안 보이게 (0.1)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = 0;
      }

      ctx.font = `bold ${r * 1.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nodeMetaInfo.icon || '?', nx, ny);
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      ctx.globalAlpha = 1.0; // 복구

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
    const getRegionData = deps.getRegionData || globalThis.getRegionData;
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
        background:rgba(5,5,18,0.96); backdrop-filter:blur(12px);
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
      if (typeof animFrame === 'number') {
        cancelAnimationFrame(animFrame);
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
    const getRegionData = deps.getRegionData || globalThis.getRegionData;
    const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: '지역' };
    title.textContent = `📍 ${regionData.name} — ${gs.currentFloor || 0}층`;
    overlay.appendChild(title);

    // 캔버스
    // [개선 3] 맵 세로 스크롤 지원 컨테이너
    const viewportW = Number(globalThis.innerWidth || 1280);
    const viewportH = Number(globalThis.innerHeight || 720);
    const cw = Math.min(720, viewportW - 60);
    const ch = Math.min(600, viewportH - 200);
    const canvasContainer = doc.createElement('div');
    canvasContainer.style.cssText = `
      width:${cw}px; height:${ch}px; overflow-y:auto; overflow-x:hidden;
      border:1px solid rgba(123,47,255,0.25); border-radius:12px;
      background:rgba(0,0,0,0.45); scrollbar-width:thin;
      scrollbar-color:rgba(123,47,255,0.4) transparent;
    `;

    const canvas = doc.createElement('canvas');
    const maxFloorNum = Math.max(...gs.mapNodes.map(n => n.floor));
    const floorSpacing = 110;
    const contentHeight = Math.max(ch, (maxFloorNum + 1) * floorSpacing + 80);
    canvas.width = cw;
    canvas.height = contentHeight;
    canvas.style.display = 'block';
    canvasContainer.appendChild(canvas);
    overlay.appendChild(canvasContainer);

    // [연출 4] 디지털 클리치 효과용 캔버스 (오버레이)
    const glitchCanvas = doc.createElement('canvas');
    glitchCanvas.width = cw; glitchCanvas.height = ch;
    glitchCanvas.style.cssText = `position:absolute; top:calc(50% - ${ch / 2}px); left:calc(50% - ${cw / 2}px); pointer-events:none; z-index:500; opacity:0;`;
    overlay.appendChild(glitchCanvas);
    const gctx = glitchCanvas.getContext('2d');
    let glitchTimer = 22;

    // [연출 1] 파티클 초기화 (지역별 테마)
    const particles = [];
    const particleColor = 'rgba(155, 79, 255, ';
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * cw,
        y: Math.random() * contentHeight,
        r: Math.random() * 2 + 1,
        vy: -0.2 - Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        life: Math.random(),
      });
    }

    const tooltip = doc.createElement('div');
    tooltip.style.cssText = `
      position:fixed; z-index:1000; pointer-events:none;
      background:rgba(5,5,18,0.95); border:1px solid rgba(123,47,255,0.7);
      border-radius:8px; padding:12px 16px; font-family:'Share Tech Mono',monospace;
      font-size:12px; color:#fff; transition:opacity 0.15s; opacity:0;
      box-shadow: 0 0 20px rgba(123,47,255,0.5);
      max-width: 260px;
    `;
    const tooltipTitle = doc.createElement('div');
    tooltipTitle.style.cssText = `font-weight:700;margin-bottom:6px;font-size:14px;`;
    const tooltipDesc = doc.createElement('div');
    tooltipDesc.style.cssText = `color:rgba(255,255,255,0.85);line-height:1.5;margin-bottom:8px;`;
    const tooltipStatus = doc.createElement('div');
    tooltipStatus.style.cssText = `color:rgba(255,255,255,0.6);font-size:11px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);`;
    tooltip.append(tooltipTitle, tooltipDesc, tooltipStatus);
    overlay.appendChild(tooltip);

    const ctx = canvas.getContext('2d');
    const padX = 60;
    const nodeMeta = _resolveNodeMeta(deps);
    const nodeMap = new Map(gs.mapNodes.map(node => [node.id, node]));
    const nodesByFloor = _groupNodesByFloor(gs.mapNodes);
    const visibleFloors = _getVisibleFloors(gs);
    const visibleNodes = gs.mapNodes.filter((node) => visibleFloors.has(node.floor));
    const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));

    const nodeX = (node) => padX + (cw - padX * 2) * (node.pos + 1) / (node.total + 1);
    const nodeY = (node) => contentHeight - 65 - floorSpacing * node.floor;
    const nodeEntries = visibleNodes.map(node => ({
      node,
      x: nodeX(node),
      y: nodeY(node),
    }));
    const nodeEntryById = new Map(nodeEntries.map(entry => [entry.node.id, entry]));

    // flowOffset 제거 (미사용)
    let animFrame = null;

    const draw = () => {
      if (closed) return;
      ctx.clearRect(0, 0, cw, contentHeight);

      // [연출 1] 배경 파티클 상시 렌더링
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < 0) p.y = contentHeight;
        if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
        ctx.fillStyle = particleColor + (0.12 + Math.random() * 0.05) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      // [개선 2] 층 인디케이터 강조
      for (let f = 0; f <= maxFloorNum; f++) {
        const fy = contentHeight - 65 - floorSpacing * f;
        const isCurrentFloor = f === gs.currentFloor;

        ctx.strokeStyle = isCurrentFloor ? 'rgba(0, 255, 204, 0.2)' : 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(padX - 25, fy); ctx.lineTo(cw - 25, fy); ctx.stroke();

        ctx.fillStyle = isCurrentFloor ? '#00ffcc' : 'rgba(255,255,255,0.25)';
        ctx.font = isCurrentFloor ? 'bold 16px "Share Tech Mono"' : '12px "Share Tech Mono"';
        ctx.textAlign = 'right';
        ctx.fillText(`${f}F`, padX - 35, fy + 5);
      }

      // [연출 2] 경로 연결선 단순화 (지난 경로만 점선 표시)
      gs.mapNodes.forEach(node => {
        if (!visibleNodeIds.has(node.id)) return;
        const linkedChildren = _getLinkedChildren(node, nodesByFloor, nodeMap);
        if (!linkedChildren.length) return;
        const entry = nodeEntryById.get(node.id);
        if (!entry) return;
        linkedChildren.forEach(child => {
          if (!visibleNodeIds.has(child.id)) return;
          const cEntry = nodeEntryById.get(child.id);
          if (!cEntry) return;

          const isVisited = node.visited && child.visited;

          if (isVisited) {
            ctx.beginPath(); ctx.moveTo(entry.x, entry.y); ctx.lineTo(cEntry.x, cEntry.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 8]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });
      });

      // [개선 1] 노드 중요도별 시각화
      const nowTs = Date.now();
      const pulseVal = Math.sin(nowTs / 450) * 0.5 + 0.5;

      nodeEntries.forEach(entry => {
        const { node, x, y } = entry;
        const metaInfo = nodeMeta[node.type] || { color: '#666', icon: '?' };
        const isPlayerAt = gs.currentNode?.id === node.id;

        let radius = 16;
        if (node.type === 'boss') radius = 25;
        else if (node.type === 'mini_boss') radius = 22;
        else if (node.type === 'elite') radius = 20;

        if (isPlayerAt) {
          ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 18 + pulseVal * 12;
          ctx.beginPath(); ctx.arc(x, y, radius + 6 + pulseVal * 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 255, 204, 0.18)'; ctx.fill();
        }

        ctx.save();
        if (node.visited && !isPlayerAt) {
          ctx.globalAlpha = 0.8; // [반전] 방문 노드 시안성 강화
          ctx.filter = 'grayscale(30%) brightness(0.9)'; // 흑백화 완화
        }

        // 아이콘 텍스트
        const isTarget = node.accessible && !node.visited && node.floor === gs.currentFloor + 1;
        const isInactive = !isPlayerAt && !isTarget;
        ctx.fillStyle = isPlayerAt ? '#00ffcc' : (isTarget ? '#fff' : (node.visited ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'));
        ctx.font = `bold ${radius * 1.6}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(metaInfo.icon || '?', x, y);

        // [연출 3] 포그 오브 워 (가려진 먼 층)
        if (node.floor > gs.currentFloor + 1) {
          ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.75, (node.floor - gs.currentFloor - 0.4) * 0.45)})`;
          ctx.beginPath(); ctx.arc(x, y, radius + 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore(); ctx.shadowBlur = 0;
      });

      // [연출 4] 클리치 효과 처리
      if (glitchTimer > 0) {
        gctx.clearRect(0, 0, cw, ch);
        glitchCanvas.style.opacity = (glitchTimer / 20).toString();
        for (let i = 0; i < 6; i++) {
          gctx.fillStyle = `rgba(155, 79, 255, ${0.2 + Math.random() * 0.2})`;
          gctx.fillRect(Math.random() * cw, Math.random() * ch, Math.random() * 120, Math.random() * 4);
        }
        glitchTimer--;
      } else {
        glitchCanvas.style.opacity = '0';
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw(); // 애니메이션 루프 시작

    const updateTooltip = (node, event) => {
      if (!node || !event) { tooltip.style.opacity = '0'; return; }
      const meta = nodeMeta[node.type] || { icon: '?', label: '노드', color: '#fff', desc: '' };
      tooltipTitle.style.color = meta.color || '#fff';
      tooltipTitle.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
      tooltipDesc.textContent = meta.desc || '다음 위치로 이동합니다.';
      tooltipStatus.textContent = `${node.floor}층 — ${_getNodeStatusText(node)}`;
      tooltip.style.opacity = '1';

      const rectT = tooltip.getBoundingClientRect();
      let lx = event.clientX + 20;
      let ly = event.clientY + 20;
      const viewportW = Number(globalThis.innerWidth || 1280);
      const viewportH = Number(globalThis.innerHeight || 720);
      if (lx + rectT.width > viewportW) lx = event.clientX - rectT.width - 20;
      if (ly + rectT.height > viewportH) ly = event.clientY - rectT.height - 20;
      tooltip.style.left = `${lx}px`; tooltip.style.top = `${ly}px`;
    };

    canvas.addEventListener('mousemove', (e) => {
      const rectC = canvas.getBoundingClientRect();
      const mx = (e.clientX - rectC.left);
      const my = (e.clientY - rectC.top);
      const closest = _findClosestNodeEntry(nodeEntries, mx, my, FULL_MAP_HOVER_THRESHOLD + 5);
      updateTooltip(closest?.node || null, e);
      canvas.style.cursor = closest ? 'pointer' : 'default';
    });
    canvas.addEventListener('mouseleave', () => updateTooltip(null));

    // 범례
    const legend = doc.createElement('div');
    legend.style.cssText = `display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;justify-content:center;`;
    NODE_TYPE_ORDER.forEach(type => {
      const meta = nodeMeta[type]; if (!meta) return;
      const item = doc.createElement('span');
      item.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:12px;color:${meta.color || '#fff'};opacity:0.8;`;
      item.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
      legend.appendChild(item);
    });
    overlay.appendChild(legend);

    const closeBtn = doc.createElement('button');
    closeBtn.className = 'action-btn action-btn-secondary';
    closeBtn.innerHTML = '닫기<span class="kbd-hint">ESC</span>';
    closeBtn.style.marginTop = '20px';

    // [연출 4] 닫기 시 클리치 효과 후 제거 로직 (선택적) 또는 즉시 종료
    closeBtn.onclick = closeOverlay;
    overlay.appendChild(closeBtn);

    doc.body.appendChild(overlay);

    // [개선 3] 현재 층으로 스크롤 자동 이동
    const startY = nodeY({ floor: gs.currentFloor });
    canvasContainer.scrollTop = startY - ch / 2;
  },
};
