import {
  createCharacterSelectProgressionFacade,
  ensureCharacterSelectMeta,
} from '../../application/load_character_select_use_case.js';
import { LevelUpPopupUI } from '../../presentation/browser/level_up_popup_ui.js';
import { RunEndScreenUI } from '../../presentation/browser/run_end_screen_ui.js';
import { createCharacterSelectSfx } from './character_select_audio.js';
import { setupCharacterSelectBindings } from './character_select_bindings.js';
import { CHARACTER_SELECT_CHARS } from '../../domain/character_select_catalog_content.js';
import { setupCharacterCardFx } from './character_select_fx.js';
import { createCharacterSelectFlow } from './character_select_flow.js';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from './character_select_modal.js';
import { createCharacterParticleRuntime } from '../../../../ui/title/character_select_particles.js';
import { createCharacterSummaryReplay } from './character_select_summary_replay.js';
import { createCharacterSelectMountRuntime } from './create_character_select_mount_runtime.js';

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
