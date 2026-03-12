import {
  createCharacterSelectRuntime,
} from '../../features/title/application/create_character_select_runtime.js';
import {
  createCharacterSelectProgressionFacade,
  ensureCharacterSelectMeta,
} from '../../app/run/use_cases/load_character_select_use_case.js';
import { createCharacterSelectSfx } from './character_select_audio.js';
import { setupCharacterSelectBindings } from './character_select_bindings.js';
import { CHARACTER_SELECT_CHARS } from './character_select_catalog.js';
import { setupCharacterCardFx } from './character_select_fx.js';
import { createCharacterSelectFlow } from './character_select_flow.js';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from './character_select_modal.js';
import { createCharacterParticleRuntime } from './character_select_particles.js';
import { createCharacterSummaryReplay } from './character_select_summary_replay.js';
import { LevelUpPopupUI } from './level_up_popup_ui.js';
import { RunEndScreenUI } from './run_end_screen_ui.js';
import { createCharacterSelectMountRuntime } from './character_select_mount_runtime.js';

const CHARS = CHARACTER_SELECT_CHARS;

export const CharacterSelectUI = {
  CHARS,
  _runtime: null,

  onEnter() {
    this._runtime?.onEnter?.();
  },

  showPendingSummaries() {
    this._runtime?.showPendingSummaries?.();
  },

  getSelectionSnapshot() {
    return this._runtime?.getSelectionSnapshot?.() || null;
  },

  mount(deps = {}) {
    const owner = this;
    owner._runtime = createCharacterSelectRuntime(deps, {
      chars: CHARS,
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
    });

    return {
      destroy() {
        const runtime = owner._runtime;
        owner._runtime = null;
        runtime?.destroy?.();
      },
    };
  },
};
