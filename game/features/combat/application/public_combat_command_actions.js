import { Logger } from '../../../utils/logger.js';
import { CombatLifecycle } from '../compat/combat_lifecycle.js';
import { DamageSystem } from '../compat/damage_system.js';
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

function resolveRuntimeCard(cardId, deps = {}) {
  return deps.card
    || deps.data?.cards?.[cardId]
    || deps.Data?.cards?.[cardId];
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

export function playRuntimeCard({
  cardId,
  handIdx,
  gs,
  deps = {},
  discardCard,
  logger = Logger,
}) {
  return playStateCard({
    cardId,
    handIdx,
    gs,
    card: resolveRuntimeCard(cardId, deps),
    cardCostUtils: deps.cardCostUtils || deps.CardCostUtils,
    classMechanics: deps.classMechanics || deps.ClassMechanics,
    logger,
    audioEngine: deps.audioEngine || deps.AudioEngine,
    combatRuntimeDeps: deps.combatRuntimeDeps || deps.runtimeDeps || deps,
    hudUpdateUI: deps.hudUpdateUI || deps.HudUpdateUI,
    discardCard,
  });
}

export function endCombatRuntime(gs, deps = {}) {
  if (!gs?.combat?.active || gs._endCombatRunning) return undefined;
  return CombatLifecycle.endCombat.call(gs, deps);
}

export function applyEnemyDamageRuntime(gs, {
  amount = 0,
  targetIdx = null,
  noChain = false,
  source = null,
  deps = {},
} = {}) {
  if (!gs) return 0;
  return DamageSystem.dealDamage.call(gs, amount, targetIdx, noChain, source, deps);
}

export function applyEnemyAreaDamageRuntime(gs, {
  amount = 0,
  noChain = false,
  deps = {},
} = {}) {
  if (!gs) return undefined;
  return DamageSystem.dealDamageAll.call(gs, amount, noChain, deps);
}
