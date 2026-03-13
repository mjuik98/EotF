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
  if (typeof gs.dealDamage === 'function') {
    return gs.dealDamage(amount, targetIdx);
  }
  const result = getCombatApplication().applyEnemyDamageState(gs, { amount, targetIdx });
  return result?.actualDamage || 0;
}

export function discardCard(cardId, isExhaust = false, gs = getDefaultState(), skipHandRemove = false) {
  getCombatApplication().discardStateCard(cardId, isExhaust, gs, skipHandRemove, Logger);
}

export function playCard(cardId, handIdx, gs = getDefaultState(), api) {
  const combatApplication = getCombatApplication();

  return combatApplication.playStateCard({
    cardId,
    handIdx,
    gs,
    card: getCurrentCard(cardId),
    cardCostUtils: getModule('CardCostUtils'),
    classMechanics: getModule('ClassMechanics'),
    logger: Logger,
    audioEngine: getAudioEngine(),
    combatRuntimeDeps: getCombatRuntimeDeps(),
    hudUpdateUI: getModule('HudUpdateUI'),
    discardCard: (nextCardId, isExhaust, state, skipHandRemove) =>
      api?.discardCard?.(nextCardId, isExhaust, state, skipHandRemove)
      || combatApplication.discardStateCard(nextCardId, isExhaust, state, skipHandRemove, Logger),
  });
}

export async function endCombat(gs = getDefaultState()) {
  if (!gs.combat?.active || gs._endCombatRunning) return;
  return gs.endCombat();
}
