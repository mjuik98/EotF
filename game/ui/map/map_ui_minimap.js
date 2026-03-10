import { MAP_NODE_TYPE_VISUAL_FALLBACK } from '../../../data/map_node_data.js';

const MINIMAP_HOVER_THRESHOLD = 12;

function getDoc(deps) {
  return deps?.doc || document;
}

function resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});
}

function groupNodesByFloor(nodes = []) {
  const byFloor = new Map();
  nodes.forEach((node) => {
    const floorNodes = byFloor.get(node.floor);
    if (floorNodes) floorNodes.push(node);
    else byFloor.set(node.floor, [node]);
  });
  return byFloor;
}

function getVisibleFloors(gs) {
  const floors = new Set();
  if (!gs?.mapNodes?.length) return floors;
  gs.mapNodes.forEach((node) => {
    if (node?.visited || node?.id === gs.currentNode?.id) floors.add(node.floor);
  });
  if (Number.isFinite(gs?.currentFloor)) floors.add(gs.currentFloor);
  return floors;
}

function getLinkedChildren(node, nodesByFloor, nodesById) {
  if (!node) return [];
  if (Array.isArray(node.children) && node.children.length > 0) {
    return node.children.map(childId => nodesById.get(childId)).filter(Boolean);
  }
  return nodesByFloor.get(node.floor + 1) || [];
}

function toCanvasCoords(canvas, event) {
  if (!canvas || !event) return null;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function findClosestNodeEntry(entries, x, y, threshold) {
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

function updateMinimapHint(canvas, node, nodeMeta) {
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

function bindMinimapHover(canvas) {
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

export function renderMinimapUI(deps = {}) {
  const gs = deps.gs;
  const canvas = deps.minimapCanvas;
  const ctx = deps.minimapCtx;
  if (!gs || !canvas || !ctx || !gs.mapNodes?.length) {
    if (canvas?._minimapHintEl) {
      updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
    }
    return;
  }

  const doc = getDoc(deps);
  const nodeMeta = resolveNodeMeta(deps);
  const minimapHint = deps.minimapNodeHint || doc.getElementById('minimapNodeHint');
  canvas._minimapHintEl = minimapHint || null;
  canvas._minimapNodeMeta = nodeMeta;
  bindMinimapHover(canvas);

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, w, h);

  const maxFloor = Math.max(...gs.mapNodes.map(node => node.floor));
  const floorH = (h - 20) / (maxFloor + 1);
  const nodeEntries = [];
  const nodesByFloor = groupNodesByFloor(gs.mapNodes);
  const nodesById = new Map(gs.mapNodes.map(node => [node.id, node]));
  const visibleFloors = getVisibleFloors(gs);
  const visibleNodeIds = new Set(
    gs.mapNodes
      .filter((node) => visibleFloors.has(node.floor))
      .map((node) => node.id),
  );

  gs.mapNodes.forEach((node) => {
    if (!visibleNodeIds.has(node.id)) return;
    const linkedChildren = getLinkedChildren(node, nodesByFloor, nodesById);
    if (!linkedChildren.length) return;
    const nx = w * (node.pos + 1) / (node.total + 1);
    const ny = h - 10 - floorH * node.floor;

    linkedChildren.forEach((child) => {
      if (!visibleNodeIds.has(child.id)) return;
      const cx2 = w * (child.pos + 1) / (child.total + 1);
      const cy2 = h - 10 - floorH * child.floor;
      const isVisited = node.visited && child.visited;
      if (!isVisited) return;
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
    if (!visibleNodeIds.has(node.id)) return;
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
    ctx.fillText(nodeMetaInfo.icon || MAP_NODE_TYPE_VISUAL_FALLBACK[node.type]?.icon || '?', nx, ny);
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

  canvas._minimapHoverData = {
    entries: nodeEntries,
    threshold: MINIMAP_HOVER_THRESHOLD,
  };
}
