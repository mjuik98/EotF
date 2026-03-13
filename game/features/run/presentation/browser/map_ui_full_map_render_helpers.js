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
