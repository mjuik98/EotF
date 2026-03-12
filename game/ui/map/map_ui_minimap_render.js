import { getMapNodeVisualFallback } from '../../features/run/domain/map_node_content.js';

export const MINIMAP_HOVER_THRESHOLD = 12;

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
  if (!gs?.mapNodes?.length) return floors;
  gs.mapNodes.forEach((node) => {
    if (node?.visited || node?.id === gs.currentNode?.id) floors.add(node.floor);
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

export function toCanvasCoords(canvas, event) {
  if (!canvas || !event) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
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

export function updateMinimapHint(canvas, node, nodeMeta) {
  const hint = canvas?._minimapHintEl;
  if (!hint) return;
  if (!node) {
    hint.textContent = '';
    hint.style.opacity = '0';
    return;
  }
  const meta = nodeMeta?.[node.type] || {};
  hint.textContent = `${meta.icon || '?'} ${meta.label || 'Node'} - ${node.floor}F`;
  hint.style.opacity = '1';
}

export function bindMinimapHover(canvas) {
  if (!canvas || canvas._minimapHoverPatched) return;
  canvas._minimapHoverPatched = true;

  canvas.addEventListener('mousemove', (event) => {
    const hoverData = canvas._minimapHoverData;
    if (!hoverData?.entries?.length) {
      canvas.style.cursor = 'default';
      updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const point = toCanvasCoords(canvas, event);
    if (!point) {
      canvas.style.cursor = 'default';
      updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const closest = findClosestNodeEntry(
      hoverData.entries,
      point.x,
      point.y,
      hoverData.threshold || MINIMAP_HOVER_THRESHOLD,
    );
    const nodeMeta = canvas._minimapNodeMeta || {};
    if (closest?.node) {
      canvas.style.cursor = 'pointer';
      updateMinimapHint(canvas, closest.node, nodeMeta);
      return;
    }

    canvas.style.cursor = 'default';
    updateMinimapHint(canvas, null, nodeMeta);
  });

  canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default';
    updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
  });
}

export function buildMinimapScene(gs) {
  const nodesByFloor = groupNodesByFloor(gs.mapNodes);
  const nodesById = new Map(gs.mapNodes.map((node) => [node.id, node]));
  const visibleFloors = getVisibleFloors(gs);
  const visibleNodeIds = new Set(
    gs.mapNodes
      .filter((node) => visibleFloors.has(node.floor))
      .map((node) => node.id),
  );

  return {
    nodesByFloor,
    nodesById,
    visibleNodeIds,
  };
}

export function drawMinimapScene(ctx, canvas, gs, nodeMeta, scene) {
  const w = canvas.width;
  const h = canvas.height;
  const maxFloor = Math.max(...gs.mapNodes.map((node) => node.floor));
  const floorH = (h - 20) / (maxFloor + 1);
  const nodeEntries = [];

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, w, h);

  gs.mapNodes.forEach((node) => {
    if (!scene.visibleNodeIds.has(node.id)) return;
    const linkedChildren = getLinkedChildren(node, scene.nodesByFloor, scene.nodesById);
    if (!linkedChildren.length) return;
    const nx = w * (node.pos + 1) / (node.total + 1);
    const ny = h - 10 - floorH * node.floor;

    linkedChildren.forEach((child) => {
      if (!scene.visibleNodeIds.has(child.id)) return;
      const cx2 = w * (child.pos + 1) / (child.total + 1);
      const cy2 = h - 10 - floorH * child.floor;
      if (!(node.visited && child.visited)) return;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(cx2, cy2);
      ctx.strokeStyle = 'rgba(123, 47, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.stroke();
    });
  });

  gs.mapNodes.forEach((node) => {
    if (!scene.visibleNodeIds.has(node.id)) return;
    const nx = w * (node.pos + 1) / (node.total + 1);
    const ny = h - 10 - floorH * node.floor;
    const r = node.type === 'boss' ? 8 : (node.type === 'mini_boss' ? 7 : 5);
    const isCurrent = gs.currentNode?.id === node.id;
    nodeEntries.push({ node, x: nx, y: ny });

    const nodeMetaInfo = nodeMeta[node.type] || { icon: '?' };
    if (isCurrent) {
      ctx.beginPath();
      ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#fff';
    } else if (node.accessible && !node.visited && node.floor === gs.currentFloor + 1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 0;
    } else if (node.visited) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.shadowBlur = 0;
    }

    ctx.font = `bold ${r * 1.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nodeMetaInfo.icon || getMapNodeVisualFallback(node.type)?.icon || '?', nx, ny);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1;

    if (isCurrent) {
      ctx.beginPath();
      ctx.arc(nx, ny, r + 1, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  return {
    entries: nodeEntries,
    threshold: MINIMAP_HOVER_THRESHOLD,
  };
}
