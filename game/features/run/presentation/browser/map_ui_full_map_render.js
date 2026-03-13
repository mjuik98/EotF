import { getMapNodeTypeOrder } from '../../domain/map_node_content.js';

export const FULL_MAP_HOVER_THRESHOLD = 18;

export function groupNodesByFloor(nodes = []) {
  const byFloor = new Map();
  nodes.forEach((node) => {
    const floorNodes = byFloor.get(node.floor);
    if (floorNodes) floorNodes.push(node);
    else byFloor.set(node.floor, [node]);
  });
  return byFloor;
}

export function getVisibleFloors(gs) {
  const floors = new Set();
  const mapNodes = gs?.mapNodes || [];
  const currentNodeId = gs?.currentNode?.id;
  if (!mapNodes.length) return floors;
  mapNodes.forEach((node) => {
    if (node?.visited || node?.id === currentNodeId) floors.add(node.floor);
  });
  if (Number.isFinite(gs?.currentFloor)) floors.add(gs.currentFloor);
  return floors;
}

export function getLinkedChildren(node, nodesByFloor, nodesById) {
  if (!node) return [];
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.map((childId) => nodesById.get(childId)).filter(Boolean);
  }
  return nodesByFloor.get(node.floor + 1) || [];
}

export function findClosestNodeEntry(entries, x, y, threshold) {
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

export function getNodeStatusText(node) {
  if (!node) return '';
  if (node.visited) return 'Visited';
  if (node.accessible) return 'Reachable';
  return 'Hidden';
}

export function createFullMapLayout(doc, { ch, cw, nodeMeta, onClose, regionName, titleText }) {
  const overlay = doc.createElement('div');
  overlay.id = 'fullMapOverlay';
  overlay.style.cssText = `
        position:fixed; inset:0; z-index:300;
        background:rgba(5,5,18,0.96); backdrop-filter:blur(12px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:default; animation:fadeInDown 0.3s ease both;
      `;

  const title = doc.createElement('div');
  title.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.3em;color:var(--echo-bright,#b388ff);margin-bottom:20px;";
  title.textContent = titleText || regionName || 'Region';
  overlay.appendChild(title);

  const canvasContainer = doc.createElement('div');
  canvasContainer.style.cssText = `
      width:${cw}px; height:${ch}px; overflow-y:auto; overflow-x:hidden;
      border:1px solid rgba(123,47,255,0.25); border-radius:12px;
      background:rgba(0,0,0,0.45); scrollbar-width:thin;
      scrollbar-color:rgba(123,47,255,0.4) transparent;
    `;

  const canvas = doc.createElement('canvas');
  canvas.width = cw;
  canvas.style.display = 'block';
  canvasContainer.appendChild(canvas);
  overlay.appendChild(canvasContainer);

  const glitchCanvas = doc.createElement('canvas');
  glitchCanvas.width = cw;
  glitchCanvas.height = ch;
  glitchCanvas.style.cssText = `position:absolute; top:calc(50% - ${ch / 2}px); left:calc(50% - ${cw / 2}px); pointer-events:none; z-index:500; opacity:0;`;
  overlay.appendChild(glitchCanvas);

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
  tooltipTitle.style.cssText = 'font-weight:700;margin-bottom:6px;font-size:14px;';
  const tooltipDesc = doc.createElement('div');
  tooltipDesc.style.cssText = 'color:rgba(255,255,255,0.85);line-height:1.5;margin-bottom:8px;';
  const tooltipStatus = doc.createElement('div');
  tooltipStatus.style.cssText = 'color:rgba(255,255,255,0.6);font-size:11px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);';
  tooltip.append(tooltipTitle, tooltipDesc, tooltipStatus);
  overlay.appendChild(tooltip);

  const legend = doc.createElement('div');
  legend.style.cssText = 'display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;justify-content:center;';
  getMapNodeTypeOrder().forEach((type) => {
    const meta = nodeMeta[type];
    if (!meta) return;
    const item = doc.createElement('span');
    item.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:12px;color:${meta.color || '#fff'};opacity:0.8;`;
    item.textContent = `${meta.icon || '?'} ${meta.label || 'Node'}`;
    legend.appendChild(item);
  });
  overlay.appendChild(legend);

  const closeBtn = doc.createElement('button');
  closeBtn.className = 'action-btn action-btn-secondary';
  closeBtn.innerHTML = 'Close<span class="kbd-hint">ESC</span>';
  closeBtn.style.marginTop = '20px';
  closeBtn.onclick = onClose;
  overlay.appendChild(closeBtn);

  return {
    canvas,
    canvasContainer,
    closeBtn,
    glitchCanvas,
    legend,
    overlay,
    tooltip,
    tooltipDesc,
    tooltipStatus,
    tooltipTitle,
  };
}

export function createFullMapParticles(count, cw, contentHeight, random = Math.random) {
  const particles = [];
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: random() * cw,
      y: random() * contentHeight,
      r: random() * 2 + 1,
      vy: -0.2 - random() * 0.5,
      vx: (random() - 0.5) * 0.3,
    });
  }
  return particles;
}

export function createFullMapScene(gs, cw, contentHeight, padX) {
  const mapNodes = gs.mapNodes;
  const nodeMap = new Map(mapNodes.map((node) => [node.id, node]));
  const nodesByFloor = groupNodesByFloor(mapNodes);
  const visibleFloors = getVisibleFloors(gs);
  const visibleNodes = mapNodes.filter((node) => visibleFloors.has(node.floor));
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const nodeX = (node) => padX + (cw - padX * 2) * (node.pos + 1) / (node.total + 1);
  const nodeY = (node) => contentHeight - 65 - 110 * node.floor;
  const nodeEntries = visibleNodes.map((node) => ({
    node,
    x: nodeX(node),
    y: nodeY(node),
  }));

  return {
    nodeEntries,
    nodeEntryById: new Map(nodeEntries.map((entry) => [entry.node.id, entry])),
    nodeMap,
    nodeX,
    nodeY,
    nodesByFloor,
    visibleNodeIds,
  };
}

export function drawFullMapFrame({
  ch,
  contentHeight,
  ctx,
  cw,
  floorSpacing,
  gctx,
  glitchCanvas,
  glitchState,
  gs,
  nodeMeta,
  padX,
  particles,
  scene,
  now = Date.now(),
  random = Math.random,
}) {
  ctx.clearRect(0, 0, cw, contentHeight);

  particles.forEach((particle) => {
    particle.y += particle.vy;
    particle.x += particle.vx;
    if (particle.y < 0) particle.y = contentHeight;
    if (particle.x < 0) particle.x = cw;
    if (particle.x > cw) particle.x = 0;
    ctx.fillStyle = `rgba(155, 79, 255, ${0.12 + random() * 0.05})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const mapNodes = gs.mapNodes;
  const currentFloor = gs.currentFloor;
  const currentNodeId = gs.currentNode?.id;
  const maxFloorNum = Math.max(...mapNodes.map((node) => node.floor));
  for (let floor = 0; floor <= maxFloorNum; floor += 1) {
    const fy = contentHeight - 65 - floorSpacing * floor;
    const isCurrentFloor = floor === currentFloor;
    ctx.strokeStyle = isCurrentFloor ? 'rgba(0, 255, 204, 0.2)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX - 25, fy);
    ctx.lineTo(cw - 25, fy);
    ctx.stroke();

    ctx.fillStyle = isCurrentFloor ? '#00ffcc' : 'rgba(255,255,255,0.25)';
    ctx.font = isCurrentFloor ? 'bold 16px "Share Tech Mono"' : '12px "Share Tech Mono"';
    ctx.textAlign = 'right';
    ctx.fillText(`${floor}F`, padX - 35, fy + 5);
  }

  mapNodes.forEach((node) => {
    if (!scene.visibleNodeIds.has(node.id)) return;
    const linkedChildren = getLinkedChildren(node, scene.nodesByFloor, scene.nodeMap);
    if (!linkedChildren.length) return;
    const entry = scene.nodeEntryById.get(node.id);
    if (!entry) return;
    linkedChildren.forEach((child) => {
      if (!scene.visibleNodeIds.has(child.id)) return;
      const childEntry = scene.nodeEntryById.get(child.id);
      if (!childEntry || !(node.visited && child.visited)) return;
      ctx.beginPath();
      ctx.moveTo(entry.x, entry.y);
      ctx.lineTo(childEntry.x, childEntry.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  });

  const pulseVal = Math.sin(now / 450) * 0.5 + 0.5;
  scene.nodeEntries.forEach((entry) => {
    const { node, x, y } = entry;
    const metaInfo = nodeMeta[node.type] || { color: '#666', icon: '?' };
    const isPlayerAt = currentNodeId === node.id;
    let radius = 16;
    if (node.type === 'boss') radius = 25;
    else if (node.type === 'mini_boss') radius = 22;
    else if (node.type === 'elite') radius = 20;

    if (isPlayerAt) {
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 18 + pulseVal * 12;
      ctx.beginPath();
      ctx.arc(x, y, radius + 6 + pulseVal * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 204, 0.18)';
      ctx.fill();
    }

    ctx.save();
    if (node.visited && !isPlayerAt) {
      ctx.globalAlpha = 0.8;
      ctx.filter = 'grayscale(30%) brightness(0.9)';
    }

    const isTarget = node.accessible && !node.visited && node.floor === currentFloor + 1;
    ctx.fillStyle = isPlayerAt
      ? '#00ffcc'
      : (isTarget ? '#fff' : (node.visited ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'));
    ctx.font = `bold ${radius * 1.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(metaInfo.icon || '?', x, y);

    if (node.floor > gs.currentFloor + 1) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.75, (node.floor - currentFloor - 0.4) * 0.45)})`;
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  });

  if (glitchState.timer > 0) {
    gctx?.clearRect(0, 0, cw, ch);
    if (glitchCanvas) glitchCanvas.style.opacity = (glitchState.timer / 20).toString();
    for (let i = 0; i < 6; i += 1) {
      gctx.fillStyle = `rgba(155, 79, 255, ${0.2 + random() * 0.2})`;
      gctx.fillRect(random() * cw, random() * ch, random() * 120, random() * 4);
    }
    glitchState.timer -= 1;
  } else if (glitchCanvas) {
    glitchCanvas.style.opacity = '0';
  }
}

export function updateFullMapTooltip(
  refs,
  node,
  event,
  nodeMeta,
  view = globalThis,
) {
  const {
    tooltip,
    tooltipDesc,
    tooltipStatus,
    tooltipTitle,
  } = refs;

  if (!node || !event) {
    tooltip.style.opacity = '0';
    return;
  }

  const meta = nodeMeta[node.type] || { icon: '?', label: 'Node', color: '#fff', desc: '' };
  tooltipTitle.style.color = meta.color || '#fff';
  tooltipTitle.textContent = `${meta.icon || '?'} ${meta.label || 'Node'}`;
  tooltipDesc.textContent = meta.desc || 'Move to this node next.';
  tooltipStatus.textContent = `${node.floor}F - ${getNodeStatusText(node)}`;
  tooltip.style.opacity = '1';

  const rect = tooltip.getBoundingClientRect();
  let left = event.clientX + 20;
  let top = event.clientY + 20;
  const winW = Number(view.innerWidth || 1280);
  const winH = Number(view.innerHeight || 720);
  if (left + rect.width > winW) left = event.clientX - rect.width - 20;
  if (top + rect.height > winH) top = event.clientY - rect.height - 20;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}
