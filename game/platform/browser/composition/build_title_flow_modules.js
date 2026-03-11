import { ClassSelectUI } from '../../../ui/title/class_select_ui.js';
import { CharacterSelectUI } from '../../../ui/title/character_select_ui.js';
import { GameBootUI } from '../../../ui/title/game_boot_ui.js';

export function buildTitleFlowModules() {
  return {
    ClassSelectUI,
    CharacterSelectUI,
    GameBootUI,
  };
}
