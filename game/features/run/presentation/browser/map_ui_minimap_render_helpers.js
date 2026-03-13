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

export function buildMinimapScene(gs) {
  const mapNodes = gs.mapNodes;
  const nodesByFloor = groupNodesByFloor(mapNodes);
  const nodesById = new Map(mapNodes.map((node) => [node.id, node]));
  const visibleFloors = getVisibleFloors(gs);
  const visibleNodeIds = new Set(
    mapNodes
      .filter((node) => visibleFloors.has(node.floor))
      .map((node) => node.id),
  );

  return {
    nodesByFloor,
    nodesById,
    visibleNodeIds,
  };
}
