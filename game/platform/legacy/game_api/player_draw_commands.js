import { playAttackSlash } from '../../../domain/audio/audio_event_helpers.js';
import {
  drawStateCards,
  executePlayerDrawService,
} from '../../../features/combat/application/public_combat_command_actions.js';
import { getAudioEngine, getDefaultState, getRunRuntimeDeps } from './runtime_context.js';

export function drawCards(count = 1, gs = getDefaultState(), options = {}) {
  return drawStateCards({
    count,
    gs,
    options,
    runRuntimeDeps: getRunRuntimeDeps(),
  });
}

export function executePlayerDraw(gs = getDefaultState(), api) {
  return executePlayerDrawService({
    gs,
    modifyEnergy: (amount, state) => api.modifyEnergy(amount, state),
    drawCards: (count, state, options) => api.drawCards(count, state, options),
    playHit: () => playAttackSlash(getAudioEngine()),
    updateUI: () => getRunRuntimeDeps().updateUI?.(),
  });
}
