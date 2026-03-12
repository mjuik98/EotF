import { WorldCanvasUI } from '../../presentation/browser/world_canvas_ui.js';
import { WorldRenderLoopUI } from '../../presentation/browser/world_render_loop_ui.js';
import { MapGenerationUI } from '../../presentation/browser/map_generation_ui.js';
import { MapNavigationUI } from '../../presentation/browser/map_navigation_ui.js';
import { MapUI } from '../../presentation/browser/map_ui.js';
import { MazeSystem } from '../../presentation/browser/maze_system_ui.js';
import { RegionTransitionUI } from '../../presentation/browser/region_transition_ui.js';
import { RunModeUI } from '../../../../ui/run/run_mode_ui.js';
import { RunStartUI } from '../../../../ui/run/run_start_ui.js';
import { RunSetupUI } from '../../../../ui/run/run_setup_ui.js';
import { RunReturnUI } from '../../../../ui/run/run_return_ui.js';

export function buildRunMapBrowserModules() {
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

export function buildRunFlowBrowserModules() {
  return {
    RunModeUI,
    RunStartUI,
    RunSetupUI,
    RunReturnUI,
  };
}
