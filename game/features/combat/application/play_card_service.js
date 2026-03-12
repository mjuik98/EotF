import { registerCardUsed } from '../../../systems/codex_records_system.js';
import { resolveActiveRegionId } from '../../../domain/run/region_service.js';
import { Actions } from '../../../shared/state/public.js';

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
  const stats = gs.stats;

  if (combat._isPlayingCard) {
    logger.warn('Already playing a card. Ignoring input.');
    return false;
  }

  if (!card) return false;

  logger.group(`API: Play Card (${card.name})`);
  combat._isPlayingCard = true;

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
    let cost = cardCostUtils?.calcEffectiveCost?.(cardId, card, player, handIdx) ?? card.cost;
    if (typeof gs.triggerItems === 'function') {
      const delta = gs.triggerItems('before_card_cost', { cardId, cost, baseCost: card.cost });
      if (typeof delta === 'number' && Number.isFinite(delta)) {
        cost = Math.max(0, Math.floor(cost + delta));
      }
    }
    if (player.energy < cost) {
      logger.warn('Not enough energy.');
      return false;
    }

    const energyBefore = player.energy;
    const handBefore = [...player.hand];
    gs.dispatch(Actions.PLAYER_ENERGY, { amount: -cost });
    player.hand.splice(handIdx, 1);

    const rollbackPlayCost = () => {
      const restoreEnergy = energyBefore - player.energy;
      if (restoreEnergy !== 0) {
        gs.dispatch(Actions.PLAYER_ENERGY, { amount: restoreEnergy });
      }
      player.hand = handBefore;
    };

    try {
      gs._currentCard = card;
      card.effect?.(gs);
    } catch (effectErr) {
      rollbackPlayCost();
      throw effectErr;
    } finally {
      gs._currentCard = null;
    }

    const combatRegionId = resolveActiveRegionId(gs, {
      getRegionData: runtimeDeps?.getRegionData,
    });
    if (combat?.active && combatRegionId === 1) {
      gs.addSilence?.(1);
    }

    if (nextCardDiscountBeforePlay > 0) {
      player._nextCardDiscount = Math.max(0, player._nextCardDiscount - 1);
    }

    cardCostUtils?.consumeTraitDiscount?.(cardId, player);
    cardCostUtils?.consumeFreeCharge?.(cardId, player, handIdx);

    const classMech = classMechanics?.[player.class];
    if (classMech && typeof classMech.onPlayCard === 'function') {
      classMech.onPlayCard(gs, { cardId });
    }

    gs.triggerItems?.('card_play', { cardId, cost });

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

    stats.cardsPlayed++;
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
    combat._isPlayingCard = false;
    logger.groupEnd();
  }
}
