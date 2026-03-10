import { showFullMapOverlay } from './map_ui_full_map.js';
import { renderMinimapUI } from './map_ui_minimap.js';
import { updateNextNodesOverlay } from './map_ui_next_nodes.js';

export const MapUI = {
  renderMinimap(deps = {}) {
    return renderMinimapUI(deps);
  },

  updateNextNodes(deps = {}) {
    return updateNextNodesOverlay(deps);
  },

  showFullMap(deps = {}) {
    return showFullMapOverlay(deps);
  },
};
