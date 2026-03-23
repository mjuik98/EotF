import { createCharacterSelectSfx } from './character_select_audio.js';
import { setupCharacterSelectBindings } from './character_select_bindings.js';
import { setupCharacterCardFx } from './character_select_fx.js';
import { createCharacterSelectFlow } from './character_select_flow.js';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from './character_select_modal.js';
import { createCharacterParticleRuntime } from './character_select_particles.js';
import { createCharacterSummaryReplay } from './character_select_summary_replay.js';

export function buildCharacterSelectFlowRuntimeBindings() {
  return {
    createSfx: createCharacterSelectSfx,
    setupBindings: setupCharacterSelectBindings,
    setupCardFx: setupCharacterCardFx,
    createFlow: createCharacterSelectFlow,
    openSkillModal: openCharacterSkillModal,
    closeSkillModal: closeCharacterSkillModal,
    createParticleRuntime: createCharacterParticleRuntime,
    createSummaryReplay: createCharacterSummaryReplay,
  };
}
