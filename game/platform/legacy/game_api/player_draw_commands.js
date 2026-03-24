import { playAttackSlash } from '../../../shared/audio/audio_event_helpers.js';
import {
  drawCombatPlayerCards,
  executeCombatPlayerDraw,
} from '../../../features/combat/platform/public_combat_player_draw_surface.js';
import { getAudioEngine, getDefaultState, getRunRuntimeDeps } from './runtime_context.js';

export function drawCards(count = 1, gs = getDefaultState(), options = {}) {
  return drawCombatPlayerCards({
    count,
    gs,
    options,
    runRuntimeDeps: getRunRuntimeDeps(),
  });
}

export function executePlayerDraw(gs = getDefaultState(), api) {
  return executeCombatPlayerDraw({
    gs,
    modifyEnergy: (amount, state) => api.modifyEnergy(amount, state),
    drawCards: (count, state, options) => api.drawCards(count, state, options),
    playHit: () => playAttackSlash(getAudioEngine()),
    updateUI: () => getRunRuntimeDeps().updateUI?.(),
  });
}
