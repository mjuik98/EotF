import {
  MapGenerationUI,
  MapNavigationUI,
  MapUI,
  MazeSystem,
  WorldCanvasUI,
  WorldRenderLoopUI,
} from '../../presentation/browser/map/public_run_map_browser_modules.js';
import {
  RegionTransitionUI,
  RunReturnUI,
  RunSetupUI,
  RunStartUI,
} from '../../presentation/browser/transition/public_run_transition_browser_modules.js';

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
    RunStartUI,
    RunSetupUI,
    RunReturnUI,
  };
}
