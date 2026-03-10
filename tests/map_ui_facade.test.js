import { describe, expect, it, vi } from 'vitest';

const {
  renderMinimapUISpy,
  updateNextNodesOverlaySpy,
  showFullMapOverlaySpy,
} = vi.hoisted(() => ({
  renderMinimapUISpy: vi.fn(),
  updateNextNodesOverlaySpy: vi.fn(),
  showFullMapOverlaySpy: vi.fn(),
}));

vi.mock('../game/ui/map/map_ui_minimap.js', () => ({
  renderMinimapUI: renderMinimapUISpy,
}));

vi.mock('../game/ui/map/map_ui_next_nodes.js', () => ({
  updateNextNodesOverlay: updateNextNodesOverlaySpy,
}));

vi.mock('../game/ui/map/map_ui_full_map.js', () => ({
  showFullMapOverlay: showFullMapOverlaySpy,
}));

import { MapUI } from '../game/ui/map/map_ui.js';

describe('map_ui facade', () => {
  it('delegates each public surface to the extracted helper', () => {
    const deps = { gs: { mapNodes: [] } };

    MapUI.renderMinimap(deps);
    MapUI.updateNextNodes(deps);
    MapUI.showFullMap(deps);

    expect(renderMinimapUISpy).toHaveBeenCalledWith(deps);
    expect(updateNextNodesOverlaySpy).toHaveBeenCalledWith(deps);
    expect(showFullMapOverlaySpy).toHaveBeenCalledWith(deps);
  });
});
