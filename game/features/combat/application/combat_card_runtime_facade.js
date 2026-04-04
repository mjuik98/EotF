import { createLegacyGameStateRuntimeFacade } from '../../../shared/combat/public_combat_runtime_effects.js';
import { drawCardsService } from './card_draw_service.js';

export function createCombatRuntimeFacade(gs) {
  return createLegacyGameStateRuntimeFacade(gs);
}

export function createCardEffectRuntimeFacade(gs, runtimeDeps = {}) {
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

export function createCardEffectTracker(runtimeDeps = {}) {
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

export function runCardEffect(gs, card, runtimeDeps = {}) {
  gs._currentCard = card;
  try {
    card.effect?.(createCardEffectRuntimeFacade(gs, runtimeDeps));
  } finally {
    gs._currentCard = null;
  }
}
