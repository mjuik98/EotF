import {
  MAP_NODE_TYPE_ORDER,
  MAP_NODE_TYPE_VISUAL_FALLBACK,
} from '../ports/public_data_runtime_capabilities.js';
import {
  getMapNodeTypeOrder as getDomainMapNodeTypeOrder,
  getMapNodeVisualFallback as getDomainMapNodeVisualFallback,
} from '../domain/map_node_content_queries.js';

export { MAP_NODE_TYPE_ORDER, MAP_NODE_TYPE_VISUAL_FALLBACK };

export function getMapNodeTypeOrder() {
  return getDomainMapNodeTypeOrder(MAP_NODE_TYPE_ORDER);
}

export function getMapNodeVisualFallback(nodeType) {
  return getDomainMapNodeVisualFallback(nodeType, MAP_NODE_TYPE_VISUAL_FALLBACK);
}
