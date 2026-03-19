import { playAttackSlash } from '../../../domain/audio/audio_event_helpers.js';
import { createCombatApplicationCapabilities } from '../../../features/combat/ports/public_application_capabilities.js';
import { getAudioEngine, getDefaultState, getRunRuntimeDeps } from './runtime_context.js';

function getCombatApplication() {
  return createCombatApplicationCapabilities();
}

export function drawCards(count = 1, gs = getDefaultState(), options = {}) {
  return getCombatApplication().drawStateCards({
    count,
    gs,
    options,
    runRuntimeDeps: getRunRuntimeDeps(),
  });
}

export function executePlayerDraw(gs = getDefaultState(), api) {
  return getCombatApplication().executePlayerDrawService({
    gs,
    modifyEnergy: (amount, state) => api.modifyEnergy(amount, state),
    drawCards: (count, state, options) => api.drawCards(count, state, options),
    playHit: () => playAttackSlash(getAudioEngine()),
    updateUI: () => getRunRuntimeDeps().updateUI?.(),
  });
}
