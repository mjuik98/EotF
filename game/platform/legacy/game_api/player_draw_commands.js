import { drawCardsService, executePlayerDrawService } from '../../../app/combat/card_draw_service.js';
import { getAudioEngine, getDefaultState, getRunRuntimeDeps } from './runtime_context.js';

export function drawCards(count = 1, gs = getDefaultState(), options = {}) {
  const runtimeDeps = getRunRuntimeDeps();
  return drawCardsService({
    count,
    gs,
    options,
    deps: {
      getRegionData: runtimeDeps.getRegionData,
      runtimeDeps,
    },
  });
}

export function executePlayerDraw(gs = getDefaultState(), api) {
  return executePlayerDrawService({
    gs,
    modifyEnergy: (amount, state) => api.modifyEnergy(amount, state),
    drawCards: (count, state, options) => api.drawCards(count, state, options),
    playHit: () => getAudioEngine()?.playHit?.(),
    updateUI: () => getRunRuntimeDeps().updateUI?.(),
  });
}
