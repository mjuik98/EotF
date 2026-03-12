export function resolveNodeByRef(gs, nodeRef) {
  const mapNodes = gs?.mapNodes;
  if (!Array.isArray(mapNodes)) return null;
  if (typeof nodeRef === 'string') {
    return mapNodes.find(function matchNode(node) {
      return node.id === nodeRef;
    }) || null;
  }
  return nodeRef || null;
}

export function updateNextFloorAccessibility(mapNodes, node) {
  if (!Array.isArray(mapNodes) || !node) return;
  const nextFloorNodes = mapNodes.filter(function isNextFloor(nextNode) {
    return nextNode.floor === node.floor + 1;
  });
  const hasExplicitChildren = Array.isArray(node.children) && node.children.length > 0;
  const allowedChildren = hasExplicitChildren ? new Set(node.children) : null;

  nextFloorNodes.forEach((nextNode) => {
    nextNode.accessible = hasExplicitChildren ? allowedChildren.has(nextNode.id) : true;
  });
}

export function applyNodeTraversalState(gs, node) {
  if (!gs || !node) {
    return {
      currentFloor: null,
      currentNode: null,
      prevFloor: null,
    };
  }

  node.visited = true;
  const prevFloor = gs.currentFloor;
  gs.currentNode = node;
  gs.currentFloor = node.floor;
  updateNextFloorAccessibility(gs.mapNodes, node);

  return {
    currentFloor: node.floor,
    currentNode: node,
    prevFloor,
  };
}
