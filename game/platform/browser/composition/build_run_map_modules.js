import { WorldCanvasUI } from '../../../ui/map/world_canvas_ui.js';
import { WorldRenderLoopUI } from '../../../ui/map/world_render_loop_ui.js';
import { MapGenerationUI } from '../../../ui/map/map_generation_ui.js';
import { MapNavigationUI } from '../../../ui/map/map_navigation_ui.js';
import { MapUI } from '../../../ui/map/map_ui.js';
import { MazeSystem } from '../../../ui/map/maze_system_ui.js';
import { RegionTransitionUI } from '../../../ui/map/region_transition_ui.js';

export function buildRunMapModules() {
  return {
    WorldCanvasUI,
    WorldRenderLoopUI,
    MapGenerationUI,
    MapNavigationUI,
    MapUI,
    MazeSystem,
    RegionTransitionUI,
  };
}
