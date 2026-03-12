import { Logger } from '../../../utils/logger.js';
import { Actions } from '../../../shared/state/public.js';
import { drawCardsService } from '../application/card_draw_service.js';
import { playCardService } from '../application/play_card_service.js';

export function discardStateCard(cardId, isExhaust = false, gs, skipHandRemove = false, logger = Logger) {
  gs.dispatch(Actions.CARD_DISCARD, { cardId, exhaust: isExhaust, skipHandRemove });
  logger.info(`[API] Card ${isExhaust ? 'exhausted' : 'discarded'}: ${cardId}`);
}

export function drawStateCards({ count = 1, gs, options = {}, runRuntimeDeps = {} }) {
  return drawCardsService({
    count,
    gs,
    options,
    deps: {
      getRegionData: runRuntimeDeps.getRegionData,
      runtimeDeps: runRuntimeDeps,
    },
  });
}

export function playStateCard({
  cardId,
  handIdx,
  gs,
  card,
  cardCostUtils,
  classMechanics,
  logger = Logger,
  audioEngine,
  combatRuntimeDeps = {},
  hudUpdateUI,
  discardCard,
}) {
  return playCardService({
    cardId,
    handIdx,
    gs,
    card,
    cardCostUtils,
    classMechanics,
    discardCard: discardCard || ((nextCardId, isExhaust, state, skipHandRemove) =>
      discardStateCard(nextCardId, isExhaust, state, skipHandRemove, logger)),
    logger,
    audioEngine,
    runtimeDeps: combatRuntimeDeps,
    hudUpdateUI,
  });
}
