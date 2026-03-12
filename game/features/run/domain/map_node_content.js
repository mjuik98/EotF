import {
  MAP_NODE_TYPE_ORDER,
  MAP_NODE_TYPE_VISUAL_FALLBACK,
} from '../../../../data/map_node_data.js';

export function getMapNodeTypeOrder() {
  return MAP_NODE_TYPE_ORDER;
}

export function getMapNodeVisualFallback(nodeType) {
  return MAP_NODE_TYPE_VISUAL_FALLBACK[nodeType] || null;
}
