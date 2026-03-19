import { Logger } from '../../../utils/logger.js';
import { createCombatApplicationCapabilities } from '../../../features/combat/ports/public_application_capabilities.js';
import {
  getAudioEngine,
  getCombatRuntimeDeps,
  getCurrentCard,
  getDefaultState,
  getModule,
} from './runtime_context.js';

function getCombatApplication() {
  return createCombatApplicationCapabilities();
}

export function applyEnemyDamage(amount, targetIdx, gs = getDefaultState()) {
  const combatApplication = getCombatApplication();
  const result = combatApplication.applyEnemyDamageState(gs, { amount, targetIdx });
  if (typeof result?.actualDamage === 'number') return result.actualDamage;
  return combatApplication.applyEnemyDamageRuntime(gs, {
    amount,
    targetIdx,
    deps: getCombatRuntimeDeps(),
  }) || 0;
}

export function discardCard(cardId, isExhaust = false, gs = getDefaultState(), skipHandRemove = false) {
  getCombatApplication().discardStateCard(cardId, isExhaust, gs, skipHandRemove, Logger);
}

export function playCard(cardId, handIdx, gs = getDefaultState(), api) {
  const combatApplication = getCombatApplication();

  return combatApplication.playRuntimeCard({
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
      || combatApplication.discardStateCard(nextCardId, isExhaust, state, skipHandRemove, Logger),
  });
}

export async function endCombat(gs = getDefaultState()) {
  return getCombatApplication().endCombatRuntime(gs, getCombatRuntimeDeps());
}
