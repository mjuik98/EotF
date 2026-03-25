import { Actions } from '../../../core/store/state_actions.js';
import {
  createLegacyGameStateRuntimeFacade,
  registerCardUsed,
} from '../../../shared/combat/public_combat_runtime_effects.js';
import { resolveActiveRegionId } from '../../run/ports/public_rule_capabilities.js';
import { changePlayerEnergyState } from '../state/card_state_commands.js';
import { drawCardsService } from './card_draw_service.js';
import {
  consumeNextCardDiscountState,
  incrementCardsPlayedState,
  removeCardFromHandState,
  restorePlayerHandState,
  setCombatCardPlayLockState,
} from '../state/commands/combat_card_play_state_commands.js';

export function createCombatRuntimeFacade(gs) {
  return createLegacyGameStateRuntimeFacade(gs);
}

function createCardEffectRuntimeFacade(gs, runtimeDeps = {}) {
  const combatRuntimeFacade = createCombatRuntimeFacade(gs);

  return new Proxy(combatRuntimeFacade, {
    get(target, prop, receiver) {
      if (
        prop === 'dealDamage'
        || prop === 'dealDamageAll'
        || prop === 'takeDamage'
        || prop === 'addShield'
        || prop === 'applyEnemyStatus'
      ) {
        const runtimeMethod = Reflect.get(target, prop, receiver);
        if (typeof runtimeMethod !== 'function') return runtimeMethod;

        return (...args) => {
          const depsArgIndex = prop === 'dealDamage'
            ? 4
            : (prop === 'applyEnemyStatus' ? 3 : 2);
          const currentDeps = args[depsArgIndex];
          const mergedDeps = { ...runtimeDeps, ...(currentDeps || {}) };
          const nextArgs = [...args];
          nextArgs[depsArgIndex] = mergedDeps;
          return runtimeMethod(...nextArgs);
        };
      }

      if (prop === 'drawCards') {
        return (count = 1, options = {}) => drawCardsService({
          count,
          gs,
          options,
          deps: {
            getRegionData: runtimeDeps?.getRegionData,
            runtimeDeps,
          },
        });
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

function createCardEffectTracker(runtimeDeps = {}) {
  const damagedTargetIdxs = [];
  const existingHandler = runtimeDeps?.onDealDamageResolved;

  return {
    damagedTargetIdxs,
    runtimeDeps: {
      ...runtimeDeps,
      onDealDamageResolved(payload = {}) {
        if (Number.isInteger(payload?.targetIdx)) {
          damagedTargetIdxs.push(payload.targetIdx);
        }
        existingHandler?.(payload);
      },
    },
  };
}

function runCardEffect(gs, card, runtimeDeps = {}) {
  gs._currentCard = card;
  try {
    card.effect?.(createCardEffectRuntimeFacade(gs, runtimeDeps));
  } finally {
    gs._currentCard = null;
  }
}

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
    changePlayerEnergyState(gs, -cost);
    removeCardFromHandState(gs, handIdx);

    const rollbackPlayCost = () => {
      const restoreEnergy = energyBefore - player.energy;
      if (restoreEnergy !== 0) {
        changePlayerEnergyState(gs, restoreEnergy);
      }
      restorePlayerHandState(gs, handBefore);
    };
    const cardEffectTracker = createCardEffectTracker(runtimeDeps);

    try {
      runCardEffect(gs, card, cardEffectTracker.runtimeDeps);
    } catch (effectErr) {
      rollbackPlayCost();
      throw effectErr;
    }

    const combatRegionId = resolveActiveRegionId(gs, {
      getRegionData: runtimeDeps?.getRegionData,
    });
    if (combat?.active && combatRegionId === 1) {
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

    const cardPlayPayload = { cardId, cost };
    const damagedTargetIdxs = [...new Set((cardEffectTracker?.damagedTargetIdxs || []).filter((idx) => Number.isInteger(idx)))];
    if (damagedTargetIdxs.length > 0) {
      cardPlayPayload.targetIdx = damagedTargetIdxs[0];
      cardPlayPayload.targetIdxs = damagedTargetIdxs;
    }
    const cardPlayResult = gs.triggerItems?.('card_play', cardPlayPayload);
    if (cardPlayResult?.doubleCast) {
      runCardEffect(gs, card, runtimeDeps);
    }

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
