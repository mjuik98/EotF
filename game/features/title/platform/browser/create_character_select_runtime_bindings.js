import {
  createCharacterSelectProgressionFacade,
  ensureCharacterSelectMeta,
} from '../../../../app/run/use_cases/load_character_select_use_case.js';
import { createCharacterSelectSfx } from '../../../../ui/title/character_select_audio.js';
import { setupCharacterSelectBindings } from '../../../../ui/title/character_select_bindings.js';
import { CHARACTER_SELECT_CHARS } from '../../../../ui/title/character_select_catalog.js';
import { setupCharacterCardFx } from '../../../../ui/title/character_select_fx.js';
import { createCharacterSelectFlow } from '../../../../ui/title/character_select_flow.js';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from '../../../../ui/title/character_select_modal.js';
import { createCharacterParticleRuntime } from '../../../../ui/title/character_select_particles.js';
import { createCharacterSummaryReplay } from '../../../../ui/title/character_select_summary_replay.js';
import { LevelUpPopupUI } from '../../../../ui/title/level_up_popup_ui.js';
import { RunEndScreenUI } from '../../../../ui/title/run_end_screen_ui.js';
import { createCharacterSelectMountRuntime } from '../../../../ui/title/character_select_mount_runtime.js';

export function createCharacterSelectRuntimeBindings() {
  return {
    chars: CHARACTER_SELECT_CHARS,
    createProgressionFacade: createCharacterSelectProgressionFacade,
    ensureMeta: ensureCharacterSelectMeta,
    createSfx: createCharacterSelectSfx,
    setupBindings: setupCharacterSelectBindings,
    setupCardFx: setupCharacterCardFx,
    createFlow: createCharacterSelectFlow,
    openSkillModal: openCharacterSkillModal,
    closeSkillModal: closeCharacterSkillModal,
    createParticleRuntime: createCharacterParticleRuntime,
    createSummaryReplay: createCharacterSummaryReplay,
    LevelUpPopup: LevelUpPopupUI,
    RunEndScreen: RunEndScreenUI,
    createMountRuntime: createCharacterSelectMountRuntime,
  };
}
