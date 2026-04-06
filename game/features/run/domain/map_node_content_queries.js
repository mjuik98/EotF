export function getMapNodeTypeOrder(mapNodeTypeOrder = []) {
  return Array.isArray(mapNodeTypeOrder) ? mapNodeTypeOrder : [];
}

export function getMapNodeVisualFallback(nodeType, visualFallbackMap = {}) {
  return visualFallbackMap?.[nodeType] || null;
}
