import { moveToNodeUseCase } from '../../app/run/use_cases/move_to_node_use_case.js';
import {
  createCharacterSelectProgressionFacade,
  ensureCharacterSelectMeta,
  getCharacterSelectPresentation,
} from '../../app/run/use_cases/load_character_select_use_case.js';
import { confirmCharacterSelection } from '../../app/run/use_cases/confirm_character_selection_use_case.js';
import { createStartRunUseCase } from '../../app/run/use_cases/start_run_use_case.js';
import { WorldCanvasUI } from '../../ui/map/world_canvas_ui.js';
import { WorldRenderLoopUI } from '../../ui/map/world_render_loop_ui.js';
import { MapGenerationUI } from '../../ui/map/map_generation_ui.js';
import { MapNavigationUI } from '../../ui/map/map_navigation_ui.js';
import { MapUI } from '../../ui/map/map_ui.js';
import { MazeSystem } from '../../ui/map/maze_system_ui.js';
import { RegionTransitionUI } from '../../ui/map/region_transition_ui.js';
import { RunModeUI } from '../../ui/run/run_mode_ui.js';
import { RunStartUI } from '../../ui/run/run_start_ui.js';
import { RunSetupUI } from '../../ui/run/run_setup_ui.js';
import { RunReturnUI } from '../../ui/run/run_return_ui.js';
import { buildRunBootActions } from './app/build_run_boot_actions.js';
import { createRunCanvasActions } from './app/create_run_canvas_actions.js';
import { buildRunFlowContractBuilders } from './ports/contracts/build_run_flow_contracts.js';
import { buildRunUiContractBuilders } from './ports/contracts/build_run_ui_contracts.js';
import { createRunCanvasPorts } from './ports/create_run_canvas_ports.js';

export function createRunFeatureFacade() {
  return {
    modules: {
      map: buildRunMapPublicModules(),
      flow: buildRunFlowPublicModules(),
    },
    bindings: {
      createCanvas: createRunCanvasBindings,
    },
    contracts: {
      buildFlow: buildRunFlowContractPublicBuilders,
      buildUi: buildRunUiContractPublicBuilders,
    },
    runtime: {
      buildBootActions: buildRunBootPublicActions,
    },
  };
}

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

export function createRunCanvasBindings(modules, fns) {
  return createRunCanvasActions(modules, fns, createRunCanvasPorts(modules));
}

export function buildRunBootPublicActions(fns) {
  return buildRunBootActions(fns);
}

export function buildRunUiContractPublicBuilders(ctx) {
  return buildRunUiContractBuilders(ctx);
}

export function buildRunFlowContractPublicBuilders(ctx) {
  return buildRunFlowContractBuilders(ctx);
}

export {
  buildRunFlowContractBuilders,
  buildRunUiContractBuilders,
  confirmCharacterSelection,
  createCharacterSelectProgressionFacade,
  createRunCanvasActions,
  createRunCanvasPorts,
  createStartRunUseCase,
  ensureCharacterSelectMeta,
  getCharacterSelectPresentation,
  buildRunBootActions,
  moveToNodeUseCase,
  MapGenerationUI,
  MapNavigationUI,
  MapUI,
  MazeSystem,
  RegionTransitionUI,
  RunModeUI,
  RunReturnUI,
  RunSetupUI,
  RunStartUI,
  WorldCanvasUI,
  WorldRenderLoopUI,
};
