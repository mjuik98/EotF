import { resolveActiveRegionId } from '../../run/ports/public_rule_capabilities.js';
import { consumeNextCardDiscountState } from './commands/combat_card_play_state_commands.js';

export function applyPreItemCardPlayState({
  gs,
  player,
  cardId,
  handIdx,
  nextCardDiscountBeforePlay,
  classMechanics,
  cardCostUtils,
  runtimeDeps,
}) {
  const combatRegionId = resolveActiveRegionId(gs, {
    getRegionData: runtimeDeps?.getRegionData,
  });
  const combatState = gs?.combat;
  if (combatState?.active && combatRegionId === 1) {
    gs.addSilence?.(1);
  }

  if (nextCardDiscountBeforePlay > 0) {
    consumeNextCardDiscountState(gs);
  }

  cardCostUtils?.consumeTraitDiscount?.(cardId, player);
  cardCostUtils?.consumeFreeCharge?.(cardId, player, handIdx);

  const classMech = classMechanics?.[player.class];
  if (classMech && typeof classMech.onPlayCard === 'function') {
    classMech.onPlayCard(gs, { cardId });
  }
}

export function buildCardPlayPayload(cardId, cost, damagedTargetIdxs = []) {
  const payload = { cardId, cost };
  const resolvedTargetIdxs = [...new Set((damagedTargetIdxs || []).filter((idx) => Number.isInteger(idx)))];

  if (resolvedTargetIdxs.length > 0) {
    payload.targetIdx = resolvedTargetIdxs[0];
    payload.targetIdxs = resolvedTargetIdxs;
  }

  return payload;
}

export function finishCardPlayState({
  gs,
  player,
  card,
  cardId,
  discardCard,
  audioEngine,
  runtimeDeps,
}) {
  if (player.echoChain >= 5 && typeof gs.triggerResonanceBurst === 'function') {
    gs.triggerResonanceBurst({
      audioEngine,
      screenShake: runtimeDeps?.ScreenShake,
      particleSystem: runtimeDeps?.ParticleSystem,
      showDmgPopup: runtimeDeps?.showDmgPopup,
      updateUI: runtimeDeps?.updateUI,
      renderCombatEnemies: runtimeDeps?.renderCombatEnemies,
    }, { isPassive: true });
  }

  if (!player.graveyard.includes(cardId) && !player.exhausted.includes(cardId)) {
    discardCard(cardId, card.exhaust, gs, true);
  }
}
