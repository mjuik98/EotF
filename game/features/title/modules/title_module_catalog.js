import { ClassSelectUI } from '../../../ui/title/class_select_ui.js';
import { CharacterSelectUI } from '../../../ui/title/character_select_ui.js';
import { GameBootUI } from '../../../ui/title/game_boot_ui.js';
import { TitleCanvasUI } from '../../../ui/title/title_canvas_ui.js';
import { GameCanvasSetupUI } from '../../../ui/title/game_canvas_setup_ui.js';

export function buildTitleCanvasModuleCatalog() {
  return {
    TitleCanvasUI,
    GameCanvasSetupUI,
  };
}

export function buildTitleFlowModuleCatalog() {
  return {
    ClassSelectUI,
    CharacterSelectUI,
    GameBootUI,
  };
}
