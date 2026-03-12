import { Logger } from '../../../utils/logger.js';
import { Actions } from '../../../core/state_actions.js';
import {
  discardStateCard,
  playStateCard,
} from '../../../features/combat/public.js';
import {
  getAudioEngine,
  getCombatRuntimeDeps,
  getCurrentCard,
  getDefaultState,
  getModule,
} from './runtime_context.js';

export function applyEnemyDamage(amount, targetIdx, gs = getDefaultState()) {
  if (typeof gs.dealDamage === 'function') {
    return gs.dealDamage(amount, targetIdx);
  }
  const result = gs.dispatch(Actions.ENEMY_DAMAGE, { amount, targetIdx });
  getModule('HudUpdateUI')?.updateEnemyHpUI?.(targetIdx, gs.combat?.enemies?.[targetIdx]);
  return result?.actualDamage || 0;
}

export function discardCard(cardId, isExhaust = false, gs = getDefaultState(), skipHandRemove = false) {
  discardStateCard(cardId, isExhaust, gs, skipHandRemove, Logger);
}

export function playCard(cardId, handIdx, gs = getDefaultState(), api) {
  return playStateCard({
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
      || discardStateCard(nextCardId, isExhaust, state, skipHandRemove, Logger),
  });
}

export async function endCombat(gs = getDefaultState()) {
  if (!gs.combat?.active || gs._endCombatRunning) return;
  return gs.endCombat();
}
