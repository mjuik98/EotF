import { WorldCanvasUI } from '../../../ui/map/world_canvas_ui.js';
import { WorldRenderLoopUI } from '../../../ui/map/world_render_loop_ui.js';
import { MapGenerationUI } from '../../../ui/map/map_generation_ui.js';
import { MapNavigationUI } from '../../../ui/map/map_navigation_ui.js';
import { MapUI } from '../../../ui/map/map_ui.js';
import { MazeSystem } from '../../../ui/map/maze_system_ui.js';
import { RegionTransitionUI } from '../../../ui/map/region_transition_ui.js';
import { RunModeUI } from '../../../ui/run/run_mode_ui.js';
import { RunStartUI } from '../../../ui/run/run_start_ui.js';
import { RunSetupUI } from '../../../ui/run/run_setup_ui.js';
import { RunReturnUI } from '../../../ui/run/run_return_ui.js';

export function buildRunMapPublicModules() {
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

export function buildRunFlowPublicModules() {
  return {
    RunModeUI,
    RunStartUI,
    RunSetupUI,
    RunReturnUI,
  };
}
