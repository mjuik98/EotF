import { Logger } from '../../../utils/logger.js';
import { drawCardsService, executePlayerDrawService } from './card_draw_service.js';
import { playCardService } from './play_card_service.js';
import {
  applyEnemyDamageState,
  discardCardState,
} from '../state/card_state_commands.js';

export { executePlayerDrawService };

export { applyEnemyDamageState };

export function discardStateCard(cardId, isExhaust = false, gs, skipHandRemove = false, logger = Logger) {
  discardCardState(gs, cardId, isExhaust, skipHandRemove);
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
