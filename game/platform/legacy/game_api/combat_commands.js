import { Logger } from '../../../utils/logger.js';
import {
  applyCombatEnemyDamage,
  discardCombatCard,
  endCombatRuntimeFlow,
  playCombatRuntimeCard,
} from '../../../features/combat/platform/public_combat_command_surface.js';
import {
  getAudioEngine,
  getCombatRuntimeDeps,
  getCurrentCard,
  getDefaultState,
  getModule,
} from './runtime_context.js';

export function applyEnemyDamage(amount, targetIdx, gs = getDefaultState()) {
  return applyCombatEnemyDamage({
    amount,
    targetIdx,
    gs,
    runtimeDeps: getCombatRuntimeDeps(),
  });
}

export function discardCard(cardId, isExhaust = false, gs = getDefaultState(), skipHandRemove = false) {
  return discardCombatCard({
    cardId,
    isExhaust,
    gs,
    skipHandRemove,
    logger: Logger,
  });
}

export function playCard(cardId, handIdx, gs = getDefaultState(), api) {
  return playCombatRuntimeCard({
    cardId,
    handIdx,
    gs,
    deps: {
      card: getCurrentCard(cardId),
      cardCostUtils: getModule('CardCostUtils'),
      classMechanics: getModule('ClassMechanics'),
      audioEngine: getAudioEngine(),
      combatRuntimeDeps: getCombatRuntimeDeps(),
      hudUpdateUI: getModule('HudUpdateUI'),
    },
    discardCard: (nextCardId, isExhaust, state, skipHandRemove) =>
      api?.discardCard?.(nextCardId, isExhaust, state, skipHandRemove)
      || discardCombatCard({
        cardId: nextCardId,
        isExhaust,
        gs: state,
        skipHandRemove,
        logger: Logger,
      }),
    logger: Logger,
  });
}

export async function endCombat(gs = getDefaultState()) {
  return endCombatRuntimeFlow({
    gs,
    runtimeDeps: getCombatRuntimeDeps(),
  });
}
