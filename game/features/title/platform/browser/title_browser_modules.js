import { CharacterSelectUI } from '../../presentation/browser/character_select_ui.js';
import { ClassSelectUI } from '../../presentation/browser/class_select_ui.js';
import { GameBootUI } from '../../presentation/browser/game_boot_ui.js';
import { GameCanvasSetupUI } from '../../presentation/browser/game_canvas_setup_ui.js';
import { TitleCanvasUI } from '../../presentation/browser/title_canvas_ui.js';

export function buildTitleCanvasBrowserModules() {
  return {
    TitleCanvasUI,
    GameCanvasSetupUI,
  };
}

export function buildTitleFlowBrowserModules() {
  return {
    ClassSelectUI,
    CharacterSelectUI,
    GameBootUI,
  };
}
