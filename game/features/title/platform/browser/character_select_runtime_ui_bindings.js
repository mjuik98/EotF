import { LevelUpPopupUI } from '../../presentation/browser/level_up_popup_ui.js';
import { RunEndScreenUI } from '../../presentation/browser/run_end_screen_ui.js';
import { createCharacterSelectMountRuntime } from './create_character_select_mount_runtime.js';

export function buildCharacterSelectUiRuntimeBindings() {
  return {
    LevelUpPopup: LevelUpPopupUI,
    RunEndScreen: RunEndScreenUI,
    createMountRuntime: createCharacterSelectMountRuntime,
  };
}
