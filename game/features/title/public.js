import { ClassSelectUI } from '../../ui/title/class_select_ui.js';
import { CharacterSelectUI } from '../../ui/title/character_select_ui.js';
import { GameBootUI } from '../../ui/title/game_boot_ui.js';
import { TitleCanvasUI } from '../../ui/title/title_canvas_ui.js';
import { GameCanvasSetupUI } from '../../ui/title/game_canvas_setup_ui.js';
import { buildTitleBootActions } from './app/build_title_boot_actions.js';
import { createTitleActions } from './app/create_title_actions.js';
import { createTitlePauseMenuActions } from './application/help_pause_menu_actions.js';
import { buildTitleHelpPauseActions } from './application/help_pause_title_actions.js';
import { buildTitleRunContractBuilders } from './ports/contracts/build_title_run_contracts.js';
import { buildTitleStoryContractBuilders } from './ports/contracts/build_title_story_contracts.js';
import { createTitlePorts } from './ports/create_title_ports.js';

export function createTitleFeatureFacade() {
  return {
    modules: {
      canvas: buildTitleCanvasPublicModules(),
      flow: buildTitlePublicModules(),
    },
    bindings: {
      createTitle: createTitleBindings,
    },
    contracts: {
      buildRun: buildTitleRunContractPublicBuilders,
      buildStory: buildTitleStoryContractPublicBuilders,
    },
    runtime: {
      buildBootActions: buildTitleBootPublicActions,
      buildHelpPauseActions: buildTitleHelpPausePublicActions,
      buildPauseMenuActions: buildTitlePauseMenuPublicActions,
    },
  };
}

export function buildTitleCanvasPublicModules() {
  return {
    TitleCanvasUI,
    GameCanvasSetupUI,
  };
}

export function buildTitlePublicModules() {
  return {
    ClassSelectUI,
    CharacterSelectUI,
    GameBootUI,
  };
}

export function createTitleBindings(modules, fns) {
  return createTitleActions(createTitlePorts(modules, fns));
}

export function buildTitleBootPublicActions(fns) {
  return buildTitleBootActions(fns);
}

export function buildTitleRunContractPublicBuilders(ctx) {
  return buildTitleRunContractBuilders(ctx);
}

export function buildTitleStoryContractPublicBuilders(ctx) {
  return buildTitleStoryContractBuilders(ctx);
}

export function buildTitleHelpPausePublicActions(deps = {}) {
  return buildTitleHelpPauseActions(deps);
}

export function buildTitlePauseMenuPublicActions(options = {}) {
  return createTitlePauseMenuActions(options);
}

export {
  ClassSelectUI,
  CharacterSelectUI,
  GameCanvasSetupUI,
  GameBootUI,
  TitleCanvasUI,
  buildTitleBootActions,
  buildTitleHelpPauseActions,
  createTitlePauseMenuActions,
  buildTitleRunContractBuilders,
  buildTitleStoryContractBuilders,
  createTitleActions,
  createTitlePorts,
};
