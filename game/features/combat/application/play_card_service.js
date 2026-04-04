import { Actions } from '../ports/public_state_action_capabilities.js';
import {
  registerCardUsed,
} from '../../../shared/combat/public_combat_runtime_effects.js';
import {
  captureHandScopedRuntimeState,
  restoreHandScopedRuntimeState,
} from '../ports/public_hand_runtime_state_capabilities.js';
import { changePlayerEnergyState } from '../state/card_state_commands.js';
import {
  incrementCardsPlayedState,
  removeCardFromHandState,
  restorePlayerHandState,
  setCombatCardPlayLockState,
} from '../state/commands/combat_card_play_state_commands.js';
import {
  createCardEffectTracker,
  createCombatRuntimeFacade,
  runCardEffect,
} from './combat_card_runtime_facade.js';
import {
  applyPreItemCardPlayState,
  buildCardPlayPayload,
  finishCardPlayState,
} from './combat_card_play_resolution.js';

export { createCombatRuntimeFacade };

export function playCardService({
  cardId,
  handIdx,
  gs,
  card,
  cardCostUtils,
  classMechanics,
  discardCard,
  logger,
  audioEngine,
  runtimeDeps,
  hudUpdateUI,
}) {
  const combat = gs.combat;
  const player = gs.player;
  const boundTriggerItems = typeof gs?.triggerItems === 'function'
    ? gs.triggerItems.bind(gs)
    : gs?.triggerItems;

  if (combat._isPlayingCard) {
    logger.warn('Already playing a card. Ignoring input.');
    return false;
  }

  if (!card) return false;

  logger.group(`API: Play Card (${card.name})`);
  setCombatCardPlayLockState(gs, true);

  try {
    if (!combat?.active || !combat?.playerTurn) {
      logger.warn('Cannot play card: Not player turn.');
      return false;
    }

    gs._lastDodgedTarget = null;

    const handCardId = player.hand?.[handIdx];
    if (handCardId !== cardId) {
      logger.warn('Cannot play card: Invalid hand index or card mismatch.');
      return false;
    }

    const nextCardDiscountBeforePlay = Number(player._nextCardDiscount || 0);
    const cost = cardCostUtils?.calcEffectiveCost?.(cardId, card, player, handIdx, {
      triggerItems: boundTriggerItems,
    }) ?? card.cost;
    if (player.energy < cost) {
      logger.warn('Not enough energy.');
      return false;
    }

    const energyBefore = player.energy;
    const handBefore = [...player.hand];
    const handScopedStateBefore = captureHandScopedRuntimeState(gs);
    changePlayerEnergyState(gs, -cost);
    removeCardFromHandState(gs, handIdx);

    const rollbackPlayCost = () => {
      const restoreEnergy = energyBefore - player.energy;
      if (restoreEnergy !== 0) {
        changePlayerEnergyState(gs, restoreEnergy);
      }
      restorePlayerHandState(gs, handBefore);
      restoreHandScopedRuntimeState(gs, handScopedStateBefore);
    };
    const cardEffectTracker = createCardEffectTracker(runtimeDeps);

    try {
      runCardEffect(gs, card, cardEffectTracker.runtimeDeps);
    } catch (effectErr) {
      rollbackPlayCost();
      throw effectErr;
    }

    applyPreItemCardPlayState({
      gs,
      player,
      cardId,
      handIdx,
      nextCardDiscountBeforePlay,
      classMechanics,
      cardCostUtils,
      runtimeDeps,
    });

    const cardPlayPayload = buildCardPlayPayload(cardId, cost, cardEffectTracker?.damagedTargetIdxs);
    const cardPlayResult = gs.triggerItems?.('card_play', cardPlayPayload);
    if (cardPlayResult?.doubleCast) {
      runCardEffect(gs, card, runtimeDeps);
    }

    finishCardPlayState({
      gs,
      player,
      card,
      cardId,
      discardCard,
      audioEngine,
      runtimeDeps,
    });

    incrementCardsPlayedState(gs);
    registerCardUsed(gs, cardId);
    gs.bus?.emit(Actions.CARD_PLAY, { cardId, card, cost });

    logger.info(`Card ${card.name} played successfully.`);
    runtimeDeps?.renderCombatCards?.();
    gs.markDirty?.('hud');
    hudUpdateUI?.processDirtyFlags?.(runtimeDeps || {});
    return true;
  } catch (e) {
    logger.error('Error playing card:', e);
    return false;
  } finally {
    setCombatCardPlayLockState(gs, false);
    logger.groupEnd();
  }
}
