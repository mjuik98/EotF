import { Logger } from '../../../utils/logger.js';
import { playCardService } from '../../../app/combat/play_card_service.js';
import { Actions } from '../../../core/state_actions.js';
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
  gs.dispatch(Actions.CARD_DISCARD, { cardId, exhaust: isExhaust, skipHandRemove });
  Logger.info(`[API] Card ${isExhaust ? 'exhausted' : 'discarded'}: ${cardId}`);
}

export function playCard(cardId, handIdx, gs = getDefaultState(), api) {
  return playCardService({
    cardId,
    handIdx,
    gs,
    card: getCurrentCard(cardId),
    cardCostUtils: getModule('CardCostUtils'),
    classMechanics: getModule('ClassMechanics'),
    discardCard: (nextCardId, isExhaust, state, skipHandRemove) =>
      api.discardCard(nextCardId, isExhaust, state, skipHandRemove),
    logger: Logger,
    audioEngine: getAudioEngine(),
    runtimeDeps: getCombatRuntimeDeps(),
    hudUpdateUI: getModule('HudUpdateUI'),
  });
}

export async function endCombat(gs = getDefaultState()) {
  if (!gs.combat?.active || gs._endCombatRunning) return;
  return gs.endCombat();
}
