import {
  MAP_NODE_TYPE_ORDER,
  MAP_NODE_TYPE_VISUAL_FALLBACK,
} from '../ports/public_data_runtime_capabilities.js';

export { MAP_NODE_TYPE_ORDER, MAP_NODE_TYPE_VISUAL_FALLBACK };

export function getMapNodeTypeOrder() {
  return MAP_NODE_TYPE_ORDER;
}

export function getMapNodeVisualFallback(nodeType) {
  return MAP_NODE_TYPE_VISUAL_FALLBACK[nodeType] || null;
}
